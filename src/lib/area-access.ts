export type AppArea = "challenge" | "clinic";
export type AccessStatus = "pending" | "approved" | "declined";

export function canEnterArea(status: AccessStatus | undefined): boolean {
  return status === "approved";
}

export function accessLabel(status: AccessStatus | undefined): string {
  if (status === "approved") return "Approved";
  if (status === "declined") return "Not approved";
  return "Awaiting approval";
}