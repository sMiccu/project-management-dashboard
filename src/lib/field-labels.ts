const FIELD_LABELS: Record<string, string> = {
  companyName: "企業名",
  projectName: "案件名",
  status: "ステータス",
  contractType: "契約形態",
  orderAmount: "受注金額",
  outsourcingCost: "外注費",
  expense: "経費",
  googleDriveUrl: "Googleドライブ",
  phases: "フェーズ",
};

export function getFieldLabel(field: string): string {
  if (field.startsWith("phase.")) {
    const parts = field.split(".");
    const phaseName = parts[1];
    const attr = parts[2];
    const attrLabel = attr === "status" ? "ステータス" : attr === "dueDate" ? "期限" : attr;
    return `${phaseName} - ${attrLabel}`;
  }
  return FIELD_LABELS[field] ?? field;
}
