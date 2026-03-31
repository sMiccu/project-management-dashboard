export type UserRole = "ADMIN" | "MEMBER";
export type ProjectStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type ContractType = "CONTRACT" | "TIME_AND_MATERIAL";
export type PhaseStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface PhaseMasterSummary {
  id: string;
  name: string;
  defaultOrder: number;
}

export interface PhaseView {
  id: string;
  phaseMaster: PhaseMasterSummary;
  status: PhaseStatus;
  dueDate: string | null;
  assignee: UserSummary | null;
  orderIndex: number;
}

export interface ProjectView {
  id: string;
  companyName: string;
  projectName: string;
  status: ProjectStatus;
  contractType: ContractType | null;
  orderAmount: number;
  outsourcingCost: number;
  expense: number;
  grossProfit: number;
  googleDriveUrl: string | null;
  members: UserSummary[];
  phases: PhaseView[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLogView {
  id: string;
  action: string;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  user: UserSummary;
  createdAt: string;
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  NOT_STARTED: "未着手",
  IN_PROGRESS: "進行中",
  COMPLETED: "完了",
};

export const PHASE_STATUS_LABELS: Record<PhaseStatus, string> = {
  NOT_STARTED: "未着手",
  IN_PROGRESS: "進行中",
  COMPLETED: "完了",
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  CONTRACT: "請負",
  TIME_AND_MATERIAL: "準委任",
};
