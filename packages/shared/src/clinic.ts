export const AREA_STATUSES = ["awaiting", "approved", "not_approved"] as const;
export type AreaStatus = (typeof AREA_STATUSES)[number];

export const CLINIC_DOC_TYPES = ["pathology", "treatment", "supplements"] as const;
export type ClinicDocType = (typeof CLINIC_DOC_TYPES)[number];

export const CLINIC_DOC_LABELS: Record<ClinicDocType, string> = {
  pathology: "Latest pathology report",
  treatment: "Treatment plan",
  supplements: "Personalised supplement details",
};

export type ClinicDocument = {
  id: string;
  user_id: string;
  doc_type: ClinicDocType;
  storage_path: string;
  updated_at: string;
};

export const CLINIC_INTAKE_FORM_URL: string | null = null;
export const CLINIC_CHECKIN_FORM_URL: string | null = null;
