import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

type IssueType = "garbage" | "road" | "water";
type IssueStatus = "Pending" | "In Progress" | "Resolved";

type Report = {
  id: number;
  type: IssueType;
  location: string;
  phoneNumber: string;
  state: string;
  district: string;
  city: string;
  description: string;
  imageUrl: string;
  status: IssueStatus;
  createdAt: string;
};

type AdminAccount = {
  username: string;
  password: string;
  state: string;
  name: string;
};

type AdminSession = {
  username: string;
  state: string;
  name: string;
};

type AdminRow = {
  username: string;
  password: string;
  state: string;
  name: string;
};

type ReportRow = {
  id: number;
  type: IssueType;
  location: string;
  phoneNumber: string;
  state: string;
  district: string;
  city: string;
  description: string;
  imageUrl: string;
  status: IssueStatus;
  createdAt: string;
};

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const adminTokens = new Map<string, AdminSession>();

const dataDir = path.join(__dirname, "..", "data");
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, "civic.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    state TEXT NOT NULL,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    location TEXT NOT NULL,
    phoneNumber TEXT NOT NULL DEFAULT '',
    state TEXT NOT NULL,
    district TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    imageUrl TEXT NOT NULL,
    status TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );
`);

const reportColumns = db.prepare("PRAGMA table_info(reports)").all() as Array<{ name: string }>;
const hasPhoneNumber = reportColumns.some((column) => column.name === "phoneNumber");
if (!hasPhoneNumber) {
  db.exec("ALTER TABLE reports ADD COLUMN phoneNumber TEXT NOT NULL DEFAULT ''");
}

const seedAdmins = db.prepare(`
  INSERT OR IGNORE INTO admins (username, password, state, name)
  VALUES (@username, @password, @state, @name)
`);

const adminAccounts: AdminAccount[] = [
  { username: "delhi_admin", password: "admin123", state: "Delhi", name: "Delhi Control Admin" },
  { username: "kerala_admin", password: "admin123", state: "Kerala", name: "Kerala Control Admin" },
  { username: "maharashtra_admin", password: "admin123", state: "Maharashtra", name: "Maharashtra Control Admin" },
  { username: "punjab_admin", password: "admin123", state: "Punjab", name: "Punjab Control Admin" },
];

for (const admin of adminAccounts) {
  seedAdmins.run(admin);
}

const findAdminByCredentials = db.prepare(
  `SELECT username, password, state, name FROM admins WHERE lower(username) = lower(?) AND password = ?`
);

const insertReport = db.prepare(`
  INSERT INTO reports (type, location, phoneNumber, state, district, city, description, imageUrl, status, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const findReportById = db.prepare(`SELECT * FROM reports WHERE id = ?`);
const updateReportStatus = db.prepare(`UPDATE reports SET status = ? WHERE id = ?`);
const getAllReports = db.prepare(`SELECT * FROM reports ORDER BY datetime(createdAt) DESC`);
const getReportsByState = db.prepare(`SELECT * FROM reports WHERE lower(state) = lower(?) ORDER BY datetime(createdAt) DESC`);

function mapReportRow(row: ReportRow): Report {
  return {
    id: row.id,
    type: row.type,
    location: row.location,
    phoneNumber: row.phoneNumber,
    state: row.state,
    district: row.district,
    city: row.city,
    description: row.description,
    imageUrl: row.imageUrl,
    status: row.status,
    createdAt: row.createdAt,
  };
}

function normalizeRegion(value: string) {
  return value.trim().toLowerCase();
}

function getAdminSession(req: express.Request): AdminSession | null {
  const authHeader = req.header("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const fallbackToken = req.header("x-admin-token") || "";
  const token = bearerToken || fallbackToken;
  if (!token) return null;
  return adminTokens.get(token) || null;
}

app.post("/admin/login", (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const account = findAdminByCredentials.get(username.trim(), password) as AdminRow | undefined;

  if (!account) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  adminTokens.set(token, { username: account.username, state: account.state, name: account.name });

  return res.json({
    token,
    admin: {
      username: account.username,
      state: account.state,
      name: account.name,
    },
  });
});

app.post("/report", (req, res) => {
  const { type, location, phoneNumber, state, district, city, description, imageUrl } = req.body as Partial<Report>;

  if (!type || !location || !state || !phoneNumber) {
    return res.status(400).json({
      message: "'type', 'location', 'phoneNumber', and 'state' are required fields",
    });
  }

  const report: Report = {
    type: (type as IssueType) || "garbage",
    location: location.trim(),
    phoneNumber: phoneNumber.trim(),
    state: state.trim(),
    district: (district || "").trim(),
    city: (city || "").trim(),
    description: description || "",
    imageUrl:
      imageUrl ||
      "https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?auto=format&fit=crop&w=900&q=80",
    status: "Pending",
    createdAt: new Date().toISOString(),
    id: 0,
  };

  const result = insertReport.run(
    report.type,
    report.location,
    report.phoneNumber,
    report.state,
    report.district,
    report.city,
    report.description,
    report.imageUrl,
    report.status,
    report.createdAt
  );

  const saved = findReportById.get(result.lastInsertRowid) as ReportRow;
  return res.json({ message: "Report submitted", report: mapReportRow(saved) });
});

app.get("/reports", (_req, res) => {
  const rows = getAllReports.all() as ReportRow[];
  return res.json(rows.map(mapReportRow));
});

app.get("/admin/reports", (req, res) => {
  const session = getAdminSession(req);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized admin access" });
  }

  const scoped = (getReportsByState.all(session.state) as ReportRow[]).map(mapReportRow);
  return res.json({ reports: scoped, adminState: session.state, adminName: session.name });
});

app.patch("/reports/:id/status", (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body as { status?: IssueStatus };

  if (!status || !["Pending", "In Progress", "Resolved"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const report = findReportById.get(id) as ReportRow | undefined;
  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  updateReportStatus.run(status, id);
  const updated = findReportById.get(id) as ReportRow;
  return res.json({ message: "Status updated", report: mapReportRow(updated) });
});

app.patch("/admin/reports/:id/status", (req, res) => {
  const session = getAdminSession(req);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized admin access" });
  }

  const id = Number(req.params.id);
  const { status } = req.body as { status?: IssueStatus };

  if (!status || !["Pending", "In Progress", "Resolved"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const report = findReportById.get(id) as ReportRow | undefined;
  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  if (normalizeRegion(report.state) !== normalizeRegion(session.state)) {
    return res.status(403).json({ message: "You can only update reports in your assigned state" });
  }

  updateReportStatus.run(status, id);
  const updated = findReportById.get(id) as ReportRow;
  return res.json({ message: "Status updated", report: mapReportRow(updated) });
});

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "civic-reporting-backend",
    message: "Backend is running. Use frontend app for UI and /health for health check.",
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "civic-reporting-backend" });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running on http://localhost:${PORT}`);
});