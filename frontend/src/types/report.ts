export type IssueType = "garbage" | "road" | "water";
export type IssueStatus = "Pending" | "In Progress" | "Resolved";

export type Report = {
  id: number;
  type: IssueType;
  location: string;
  description: string;
  imageUrl: string;
  status: IssueStatus;
  createdAt: string;
};
