"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Loader2,
  Plus,
  LogOut,
  Clock,
} from "lucide-react";

import { useProjects } from "@/hooks/use-projects";
import { useUsers } from "@/hooks/use-users";
import { seedAction } from "@/actions/seed-action";
import type { PhaseView, ProjectView, ProjectStatus } from "@/types";
import { PROJECT_STATUS_LABELS } from "@/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProjectSheet } from "@/components/projects/project-sheet";
import { ProjectCreateDialog } from "@/components/projects/project-create-dialog";
import { PhaseMasterDialog } from "@/components/projects/phase-master-dialog";

function isPhaseOverdue(phase: PhaseView): boolean {
  if (phase.status === "COMPLETED" || !phase.dueDate) return false;
  return new Date(phase.dueDate) < new Date();
}

function isPhaseNearDeadline(phase: PhaseView): boolean {
  if (phase.status === "COMPLETED" || !phase.dueDate) return false;
  const due = new Date(phase.dueDate);
  const now = new Date();
  if (due < now) return false;
  const diff = due.getTime() - now.getTime();
  return diff <= 7 * 86400000;
}

function getNearestDeadline(phases: PhaseView[]) {
  const active = phases
    .filter((p) => p.status !== "COMPLETED" && p.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  if (active.length === 0) return { date: null, overdue: false, nearDeadline: false };
  const nearest = new Date(active[0].dueDate!);
  const now = new Date();
  return {
    date: nearest,
    overdue: nearest < now,
    nearDeadline: !( nearest < now) && nearest.getTime() - now.getTime() <= 7 * 86400000,
  };
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

function statusBadgeClass(status: ProjectStatus): string {
  switch (status) {
    case "COMPLETED": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "IN_PROGRESS": return "bg-blue-100 text-blue-800 border-blue-200";
    case "NOT_STARTED": return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function phasePillClass(phase: PhaseView): string {
  if (phase.status === "COMPLETED") return "bg-emerald-100 text-emerald-700 border-emerald-300";
  if (isPhaseOverdue(phase)) return "bg-red-100 text-red-700 border-red-300 font-bold";
  if (isPhaseNearDeadline(phase)) return "bg-amber-100 text-amber-700 border-amber-300 font-semibold";
  if (phase.status === "IN_PROGRESS") return "bg-blue-100 text-blue-700 border-blue-300";
  return "bg-gray-50 text-gray-500 border-gray-200";
}

export function Dashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [memberFilter, setMemberFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [phaseMasterOpen, setPhaseMasterOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const { data: users = [] } = useUsers();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  const { data: projects = [], isLoading, refetch } = useProjects({
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    memberId: memberFilter !== "ALL" ? memberFilter : undefined,
    sortBy: sortOrder ? "due_date" : undefined,
    sortOrder: sortOrder ?? undefined,
  });

  const selectedProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId) ?? null
    : null;

  if (sessionStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleSeed = async () => {
    setSeeding(true);
    await seedAction();
    refetch();
    setSeeding(false);
  };

  const toggleSort = () => {
    setSortOrder((prev) => {
      if (prev === null) return "asc";
      if (prev === "asc") return "desc";
      return null;
    });
  };

  const SortIcon = sortOrder === "asc" ? ArrowUp : sortOrder === "desc" ? ArrowDown : ArrowUpDown;

  const overdueCount = projects.filter((p) => p.phases.some(isPhaseOverdue)).length;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold">案件管理システム</h1>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {isAdmin ? "管理者" : "担当者"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {session?.user?.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="h-8 gap-1.5 text-xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              案件一覧
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              全 {projects.length} 件
              {overdueCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-red-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {overdueCount} 件に期限切れフェーズあり
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSeed} disabled={seeding}>
              {seeding ? "投入中…" : "デモデータ投入"}
            </Button>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => setPhaseMasterOpen(true)}>
                フェーズ管理
              </Button>
            )}
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />新規案件
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="ステータス" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">すべてのステータス</SelectItem>
                <SelectItem value="NOT_STARTED">未着手</SelectItem>
                <SelectItem value="IN_PROGRESS">進行中</SelectItem>
                <SelectItem value="COMPLETED">完了</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isAdmin && (
            <div className="w-48">
              <Select value={memberFilter} onValueChange={setMemberFilter}>
                <SelectTrigger><SelectValue placeholder="担当者" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">すべての担当者</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            variant={sortOrder ? "default" : "outline"}
            size="sm"
            onClick={toggleSort}
            className="gap-1.5"
          >
            <SortIcon className="h-4 w-4" />
            納期{sortOrder === "asc" && " (昇順)"}{sortOrder === "desc" && " (降順)"}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-lg border border-dashed py-16 text-center">
            <p className="text-muted-foreground">
              案件データがありません。「デモデータ投入」ボタンを押してください。
            </p>
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[160px]">企業名</TableHead>
                  <TableHead className="w-[180px]">案件名</TableHead>
                  <TableHead className="w-[140px]">担当者</TableHead>
                  <TableHead className="w-[100px]">ステータス</TableHead>
                  <TableHead>フェーズ進捗</TableHead>
                  <TableHead className="w-[120px] text-right">受注金額</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    onClick={() => setSelectedProjectId(project.id)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {selectedProject && (
        <ProjectSheet
          project={selectedProject}
          open={!!selectedProject}
          onOpenChange={(open) => { if (!open) setSelectedProjectId(null); }}
          onUpdated={() => { refetch(); }}
        />
      )}

      <ProjectCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => refetch()}
      />

      <PhaseMasterDialog
        open={phaseMasterOpen}
        onOpenChange={setPhaseMasterOpen}
      />
    </div>
  );
}

function ProjectRow({ project, onClick }: { project: ProjectView; onClick: () => void }) {
  const deadline = getNearestDeadline(project.phases);

  return (
    <TableRow className="cursor-pointer" onClick={onClick}>
      <TableCell className="font-medium">{project.companyName}</TableCell>
      <TableCell>
        <div>{project.projectName}</div>
        {deadline.date && (
          <div className={`mt-1 flex items-center gap-0.5 text-xs ${
            deadline.overdue ? "font-semibold text-red-600" :
            deadline.nearDeadline ? "font-medium text-amber-600" :
            "text-muted-foreground"
          }`}>
            {deadline.overdue && <AlertTriangle className="h-3 w-3" />}
            {deadline.nearDeadline && <Clock className="h-3 w-3" />}
            直近期限: {formatDate(deadline.date)}
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {project.members.map((m) => (
            <span key={m.id} className="inline-block rounded-md bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">
              {m.name}
            </span>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={statusBadgeClass(project.status)}>
          {PROJECT_STATUS_LABELS[project.status]}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {project.phases.map((phase) => (
            <span
              key={phase.id}
              className={`inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[11px] leading-tight ${phasePillClass(phase)}`}
              title={`${phase.phaseMaster.name}: ${phase.dueDate ? formatDate(new Date(phase.dueDate)) : "期限未設定"}${isPhaseOverdue(phase) ? " ⚠ 期限切れ" : isPhaseNearDeadline(phase) ? " ⏰ 期限間近" : ""}`}
            >
              {isPhaseOverdue(phase) && <AlertTriangle className="h-2.5 w-2.5" />}
              {isPhaseNearDeadline(phase) && <Clock className="h-2.5 w-2.5" />}
              {phase.phaseMaster.name}
            </span>
          ))}
        </div>
      </TableCell>
      <TableCell className="text-right font-medium tabular-nums">
        {formatCurrency(project.orderAmount)}
      </TableCell>
    </TableRow>
  );
}
