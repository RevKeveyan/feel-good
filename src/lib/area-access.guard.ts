import { redirect } from "@tanstack/react-router";
import { checkAreaAccess } from "./area-access.functions";
import type { AppArea } from "./area-access";

export async function requireAreaApproval(area: AppArea) {
  if (!(await checkAreaAccess({ data: area }))) {
    throw redirect({ to: "/app", replace: true });
  }
}