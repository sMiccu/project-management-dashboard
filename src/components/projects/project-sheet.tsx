"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  ExternalLink,
  Clock,
} from "lucide-react";

import { updateProjectAction, deleteProjectAction } from "@/actions/project-actions";
import { addPhaseAction, updatePhaseAction, deletePhaseAction } from "@/actions/phase-actions";
import { useUsers } from "@/hooks/use-users";
import { usePhaseMasters } from "@/hooks/use-phase-masters";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import type { PhaseView, ProjectView, ProjectStatus, ContractType, PhaseStatus } from "@/types";
import { PROJECT_STATUS_LABELS, PHASE_STATUS_LABELS, CONTRACT_TYPE_LABELS } from "@/types";
import { getFieldLabel } from "@/lib/field-labels";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatCurrency(n: number) {
  return `¥${n.toLocaleString("ja-JP")}`;
}

function isOverdue(phase: PhaseView) {
  return phase.status !== "COMPLETED" && phase.dueDate && new Date(phase.dueDate) < new Date();
}

interface Props {
  project: ProjectView;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function ProjectSheet({ project, open, onOpenChange, onUpdated }: Props) {
  const [tab, setTab] = useState("basic");
  const queryClient = useQueryClient();

  const { data: users = [] } = useUsers();
  const { data: phaseMasters = [] } = usePhaseMasters();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["activity-logs", project.id] });
    onUpdated();
  };

  const handleDelete = async () => {
    if (!confirm(`「${project.projectName}」を削除しますか？この操作は取り消せません。`)) return;
    const result = await deleteProjectAction(project.id);
    if (result.success) {
      onOpenChange(false);
      invalidate();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{project.companyName}</SheetTitle>
          <p className="text-sm text-muted-foreground">{project.projectName}</p>
        </SheetHeader>

        <div className="px-6 py-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="basic">基本</TabsTrigger>
              <TabsTrigger value="money">金額</TabsTrigger>
              <TabsTrigger value="members">担当</TabsTrigger>
              <TabsTrigger value="phases">フェーズ</TabsTrigger>
              <TabsTrigger value="history">履歴</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <BasicInfoTab project={project} onSaved={invalidate} />
            </TabsContent>
            <TabsContent value="money">
              <MoneyTab project={project} onSaved={invalidate} />
            </TabsContent>
            <TabsContent value="members">
              <MembersTab project={project} users={users} onSaved={invalidate} />
            </TabsContent>
            <TabsContent value="phases">
              <PhasesTab project={project} users={users} phaseMasters={phaseMasters} onSaved={invalidate} />
            </TabsContent>
            <TabsContent value="history">
              <HistoryTab projectId={project.id} />
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />
          <Button variant="destructive" size="sm" onClick={handleDelete} className="w-full">
            <Trash2 className="mr-2 h-4 w-4" />案件を削除
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function BasicInfoTab({ project, onSaved }: { project: ProjectView; onSaved: () => void }) {
  const [form, setForm] = useState(() => ({
    companyName: project.companyName,
    projectName: project.projectName,
    status: project.status as string,
    contractType: (project.contractType ?? "") as string,
    googleDriveUrl: project.googleDriveUrl ?? "",
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    setForm({
      companyName: project.companyName,
      projectName: project.projectName,
      status: project.status as string,
      contractType: (project.contractType ?? "") as string,
      googleDriveUrl: project.googleDriveUrl ?? "",
    });
  }, [project]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const result = await updateProjectAction(project.id, {
      companyName: form.companyName,
      projectName: form.projectName,
      status: form.status,
      contractType: form.contractType || null,
      googleDriveUrl: form.googleDriveUrl || null,
    });
    setSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    onSaved();
  };

  return (
    <div className="space-y-4 pt-4">
      <Field label="企業名">
        <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
      </Field>
      <Field label="案件名">
        <Input value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} />
      </Field>
      <Field label="ステータス">
        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {(Object.entries(PROJECT_STATUS_LABELS) as [ProjectStatus, string][]).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="契約形態">
        <Select value={form.contractType} onValueChange={(v) => setForm({ ...form, contractType: v })}>
          <SelectTrigger><SelectValue placeholder="選択してください" /></SelectTrigger>
          <SelectContent>
            {(Object.entries(CONTRACT_TYPE_LABELS) as [ContractType, string][]).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Googleドライブ">
        <div className="flex gap-2">
          <Input value={form.googleDriveUrl} onChange={(e) => setForm({ ...form, googleDriveUrl: e.target.value })} placeholder="https://drive.google.com/..." />
          {form.googleDriveUrl && (
            <a href={form.googleDriveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          )}
        </div>
      </Field>
      <ErrorMessage message={error} />
      <SaveButton loading={saving} onClick={handleSave} />
    </div>
  );
}

function MoneyTab({ project, onSaved }: { project: ProjectView; onSaved: () => void }) {
  const [form, setForm] = useState(() => ({
    orderAmount: project.orderAmount,
    outsourcingCost: project.outsourcingCost,
    expense: project.expense,
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    setForm({
      orderAmount: project.orderAmount,
      outsourcingCost: project.outsourcingCost,
      expense: project.expense,
    });
  }, [project]);

  const gross = form.orderAmount - (form.outsourcingCost + form.expense);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const result = await updateProjectAction(project.id, form);
    setSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    onSaved();
  };

  return (
    <div className="space-y-4 pt-4">
      <Field label="受注金額">
        <MoneyInput value={form.orderAmount} onChange={(v) => setForm({ ...form, orderAmount: v })} />
      </Field>
      <Field label="外注費">
        <MoneyInput value={form.outsourcingCost} onChange={(v) => setForm({ ...form, outsourcingCost: v })} />
      </Field>
      <Field label="経費">
        <MoneyInput value={form.expense} onChange={(v) => setForm({ ...form, expense: v })} />
      </Field>
      <Separator />
      <div className="rounded-lg bg-muted/50 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">粗利</span>
          <span className={`font-semibold tabular-nums ${gross < 0 ? "text-red-600" : "text-emerald-700"}`}>
            {formatCurrency(gross)}
          </span>
        </div>
      </div>
      <ErrorMessage message={error} />
      <SaveButton loading={saving} onClick={handleSave} />
    </div>
  );
}

function MembersTab({ project, users, onSaved }: { project: ProjectView; users: { id: string; name: string; role: string }[]; onSaved: () => void }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => project.members.map((m) => m.id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    setSelectedIds(project.members.map((m) => m.id));
  }, [project]);

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const result = await updateProjectAction(project.id, { memberIds: selectedIds });
    setSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    onSaved();
  };

  return (
    <div className="space-y-4 pt-4">
      <p className="text-sm text-muted-foreground">案件にアサインする担当者を選択してください。</p>
      <div className="space-y-2">
        {users.map((u) => (
          <label key={u.id} className="flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50">
            <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggle(u.id)} className="h-4 w-4 rounded border-gray-300" />
            <span className="text-sm font-medium">{u.name}</span>
            <Badge variant="outline" className="ml-auto text-xs">
              {u.role === "ADMIN" ? "管理者" : "メンバー"}
            </Badge>
          </label>
        ))}
      </div>
      <ErrorMessage message={error} />
      <SaveButton loading={saving} onClick={handleSave} />
    </div>
  );
}

function PhasesTab({
  project,
  users,
  phaseMasters,
  onSaved,
}: {
  project: ProjectView;
  users: { id: string; name: string }[];
  phaseMasters: { id: string; name: string }[];
  onSaved: () => void;
}) {
  const [addingId, setAddingId] = useState<string>("");

  const usedMasterIds = new Set(project.phases.map((p) => p.phaseMaster.id));
  const availableMasters = phaseMasters.filter((pm) => !usedMasterIds.has(pm.id));

  const handleAdd = async () => {
    if (!addingId) return;
    await addPhaseAction(project.id, addingId);
    setAddingId("");
    onSaved();
  };

  return (
    <div className="space-y-4 pt-4">
      {project.phases.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">フェーズがありません。</p>
      )}
      {project.phases.map((phase) => (
        <PhaseRow key={phase.id} phase={phase} users={users} onSaved={onSaved} />
      ))}
      <Separator />
      {availableMasters.length > 0 && (
        <div className="flex gap-2">
          <Select value={addingId} onValueChange={setAddingId}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="フェーズを選択" /></SelectTrigger>
            <SelectContent>
              {availableMasters.map((pm) => (
                <SelectItem key={pm.id} value={pm.id}>{pm.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" disabled={!addingId} onClick={handleAdd} className="shrink-0">
            <Plus className="mr-1 h-4 w-4" />追加
          </Button>
        </div>
      )}
    </div>
  );
}

function PhaseRow({ phase, users, onSaved }: { phase: PhaseView; users: { id: string; name: string }[]; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(phase.status as string);
  const [dueDate, setDueDate] = useState(phase.dueDate ? phase.dueDate.slice(0, 10) : "");
  const [assigneeId, setAssigneeId] = useState(phase.assignee?.id ?? "none");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updatePhaseAction(phase.id, {
      status,
      dueDate: dueDate ? `${dueDate}T00:00:00Z` : null,
      assigneeId: assigneeId !== "none" ? assigneeId : null,
    });
    setSaving(false);
    setEditing(false);
    onSaved();
  };

  const handleDelete = async () => {
    if (!confirm(`「${phase.phaseMaster.name}」を削除しますか？`)) return;
    await deletePhaseAction(phase.id);
    onSaved();
  };

  const overdue = isOverdue(phase);

  if (!editing) {
    return (
      <div className={`rounded-md border p-3 transition-colors ${overdue ? "border-red-300 bg-red-50" : ""}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {overdue && <AlertTriangle className="h-3.5 w-3.5 text-red-600" />}
            <span className="text-sm font-medium">{phase.phaseMaster.name}</span>
            <Badge variant="outline" className={`text-[11px] ${
              phase.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" :
              phase.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-600"
            }`}>
              {PHASE_STATUS_LABELS[phase.status]}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="text-xs h-7">編集</Button>
        </div>
        <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
          {phase.dueDate && (
            <span className={overdue ? "font-semibold text-red-600" : ""}>
              期限: {new Date(phase.dueDate).toLocaleDateString("ja-JP")}
            </span>
          )}
          {phase.assignee && <span>担当: {phase.assignee.name}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-primary/30 bg-muted/30 p-3">
      <div className="text-sm font-medium">{phase.phaseMaster.name}</div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="ステータス">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.entries(PHASE_STATUS_LABELS) as [PhaseStatus, string][]).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="期限">
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-9 text-xs" />
        </Field>
      </div>
      <Field label="担当者">
        <Select value={assigneeId} onValueChange={setAssigneeId}>
          <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">未アサイン</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving} className="h-8 text-xs">
          <Save className="mr-1 h-3.5 w-3.5" />保存
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-8 text-xs">キャンセル</Button>
        <Button size="sm" variant="ghost" onClick={handleDelete} className="ml-auto h-8 text-xs text-destructive hover:text-destructive">
          <Trash2 className="mr-1 h-3.5 w-3.5" />削除
        </Button>
      </div>
    </div>
  );
}

function HistoryTab({ projectId }: { projectId: string }) {
  const { data, isLoading } = useActivityLogs(projectId);

  if (isLoading) {
    return <div className="flex justify-center py-8"><Clock className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  const logs = data?.logs ?? [];

  if (logs.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">変更履歴はまだありません。</p>;
  }

  return (
    <div className="space-y-3 pt-4">
      {logs.map((log) => (
        <div key={log.id} className="flex gap-3 rounded-md border p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {log.user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm">
              <span className="font-medium">{log.user.name}</span>
              {log.action === "CREATE" && " が案件を作成しました"}
              {log.action === "DELETE" && " が案件を削除しました"}
              {log.action === "UPDATE" && log.field && (
                <>
                  {" が "}
                  <span className="font-medium">{getFieldLabel(log.field)}</span>
                  {" を変更しました"}
                </>
              )}
            </p>
            {log.action === "UPDATE" && (log.oldValue || log.newValue) && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {log.oldValue && <span className="line-through">{log.oldValue}</span>}
                {log.oldValue && log.newValue && " → "}
                {log.newValue && <span>{log.newValue}</span>}
              </p>
            )}
            <p className="mt-1 text-[11px] text-muted-foreground">
              {new Date(log.createdAt).toLocaleString("ja-JP")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  if (!message) return null;
  return <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{message}</p>;
}

function MoneyInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [display, setDisplay] = useState(value.toLocaleString("ja-JP"));
  const [focused, setFocused] = useState(false);

  React.useEffect(() => {
    if (!focused) {
      setDisplay(value.toLocaleString("ja-JP"));
    }
  }, [value, focused]);

  return (
    <Input
      inputMode="numeric"
      value={display}
      onFocus={() => {
        setFocused(true);
        setDisplay(value === 0 ? "" : String(value));
      }}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^0-9]/g, "");
        setDisplay(raw);
        onChange(raw === "" ? 0 : Number(raw));
      }}
      onBlur={() => {
        setFocused(false);
        setDisplay(value.toLocaleString("ja-JP"));
      }}
    />
  );
}

function SaveButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <Button onClick={onClick} disabled={loading} className="w-full">
      <Save className="mr-2 h-4 w-4" />
      {loading ? "保存中…" : "変更を保存"}
    </Button>
  );
}
