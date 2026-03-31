"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { createProjectAction } from "@/actions/project-actions";
import { useUsers } from "@/hooks/use-users";
import { usePhaseMasters } from "@/hooks/use-phase-masters";
import type { ProjectStatus, ContractType } from "@/types";
import { PROJECT_STATUS_LABELS, CONTRACT_TYPE_LABELS } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const INITIAL = {
  companyName: "",
  projectName: "",
  status: "NOT_STARTED" as string,
  contractType: "" as string,
  orderAmount: 0,
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function ProjectCreateDialog({ open, onOpenChange, onCreated }: Props) {
  const [form, setForm] = useState(INITIAL);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedPhaseIds, setSelectedPhaseIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: users = [] } = useUsers();
  const { data: phaseMasters = [] } = usePhaseMasters();

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const togglePhase = (id: string) => {
    setSelectedPhaseIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllPhases = () => {
    setSelectedPhaseIds(phaseMasters.map((pm) => pm.id));
  };

  const handleSubmit = async () => {
    setSaving(true);
    const result = await createProjectAction({
      companyName: form.companyName,
      projectName: form.projectName,
      status: form.status,
      contractType: form.contractType || null,
      orderAmount: form.orderAmount,
      memberIds: selectedMemberIds,
      phaseMasterIds: selectedPhaseIds,
    });

    setSaving(false);
    if (result.success) {
      setForm(INITIAL);
      setSelectedMemberIds([]);
      setSelectedPhaseIds([]);
      onOpenChange(false);
      onCreated();
    }
  };

  const valid = form.companyName.trim() && form.projectName.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新規案件作成</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="企業名 *">
            <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="株式会社〇〇" />
          </Field>

          <Field label="案件名 *">
            <Input value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} placeholder="〇〇システム開発" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
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
                <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(CONTRACT_TYPE_LABELS) as [ContractType, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="受注金額">
            <Input type="number" value={form.orderAmount} onChange={(e) => setForm({ ...form, orderAmount: Number(e.target.value) })} />
          </Field>

          <Field label="担当者">
            <div className="flex flex-wrap gap-2">
              {users.map((u) => (
                <label key={u.id} className="flex cursor-pointer items-center gap-1.5 rounded border px-2 py-1 text-xs transition-colors hover:bg-muted/50">
                  <input type="checkbox" checked={selectedMemberIds.includes(u.id)} onChange={() => toggleMember(u.id)} className="h-3.5 w-3.5" />
                  {u.name}
                </label>
              ))}
            </div>
          </Field>

          <Field label="フェーズ">
            <div className="mb-2">
              <Button type="button" variant="outline" size="sm" onClick={selectAllPhases} className="text-xs h-7">
                すべて選択
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {phaseMasters.map((pm) => (
                <label key={pm.id} className="flex cursor-pointer items-center gap-1.5 rounded border px-2 py-1 text-xs transition-colors hover:bg-muted/50">
                  <input type="checkbox" checked={selectedPhaseIds.includes(pm.id)} onChange={() => togglePhase(pm.id)} className="h-3.5 w-3.5" />
                  {pm.name}
                </label>
              ))}
            </div>
          </Field>

          <Button className="w-full" disabled={!valid || saving} onClick={handleSubmit}>
            <Plus className="mr-2 h-4 w-4" />
            {saving ? "作成中…" : "案件を作成"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}
