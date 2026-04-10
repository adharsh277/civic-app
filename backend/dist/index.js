"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const PORT = 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
let reports = [];
app.post("/report", (req, res) => {
    const { type, location, description, imageUrl } = req.body;
    if (!type || !location) {
        return res.status(400).json({
            message: "'type' and 'location' are required fields",
        });
    }
    const report = {
        id: Date.now(),
        type: type || "garbage",
        location,
        description: description || "",
        imageUrl: imageUrl ||
            "https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?auto=format&fit=crop&w=900&q=80",
        status: "Pending",
        createdAt: new Date().toISOString(),
    };
    reports.unshift(report);
    return res.json({ message: "Report submitted", report });
});
app.get("/reports", (_req, res) => {
    return res.json(reports);
});
app.patch("/reports/:id/status", (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!status || !["Pending", "In Progress", "Resolved"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }
    const report = reports.find((item) => item.id === id);
    if (!report) {
        return res.status(404).json({ message: "Report not found" });
    }
    report.status = status;
    return res.json({ message: "Status updated", report });
});
app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "civic-reporting-backend" });
});
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map