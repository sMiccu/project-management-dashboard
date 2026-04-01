"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

import { usePhaseMasters } from "@/hooks/use-phase-masters";
import {
  createPhaseMasterAction,
  updatePhaseMasterAction,
  deletePhaseMasterAction,
} from "@/actions/phase-master-actions";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PhaseMasterDialog({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const { data: phaseMasters = [] } = usePhaseMasters();

  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["phase-masters"] });
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    setError("");
    const result = await createPhaseMasterAction(newName);
    setAdding(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setNewName("");
    invalidate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>フェーズマスター管理</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {phaseMasters.map((pm) => (
            <PhaseMasterRow
              key={pm.id}
              id={pm.id}
              name={pm.name}
              onUpdated={invalidate}
              onError={setError}
            />
          ))}

          {phaseMasters.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              フェーズが登録されていません。
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="新しいフェーズ名"
            onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && handleAdd()}
          />
          <Button type="button" size="sm" onClick={handleAdd} disabled={adding || !newName.trim()} className="shrink-0">
            <Plus className="mr-1 h-4 w-4" />追加
          </Button>
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PhaseMasterRow({
  id,
  name,
  onUpdated,
  onError,
}: {
  id: string;
  name: string;
  onUpdated: () => void;
  onError: (msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    onError("");
    const result = await updatePhaseMasterAction(id, editName);
    setSaving(false);
    if (!result.success) {
      onError(result.error);
      return;
    }
    setEditing(false);
    onUpdated();
  };

  const handleDelete = async () => {
    onError("");
    const result = await deletePhaseMasterAction(id);
    if (!result.success) {
      onError(result.error);
      return;
    }
    onUpdated();
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="h-9 text-sm"
          onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && handleSave()}
          autoFocus
        />
        <Button variant="ghost" size="sm" onClick={handleSave} disabled={saving} className="h-8 w-8 p-0">
          <Check className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setEditName(name); }} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-md border px-3 py-2">
      <span className="text-sm">{name}</span>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="h-7 w-7 p-0">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDelete} className="h-7 w-7 p-0 text-destructive hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
