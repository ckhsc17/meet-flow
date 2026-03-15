"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMeetFlow } from "@/context/MeetFlowContext";
import { getCommonSlots } from "@/lib/slots";
import { DAYS } from "@/lib/constants";
import { Plus } from "lucide-react";

export function MeetingsTab() {
  const { members, meetings, addMeeting } = useMeetFlow();
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const commonSlots = getCommonSlots(members);
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [title, setTitle] = useState("");

  function toggleParticipant(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleCreate() {
    if (selectedIds.length === 0 || !selectedSlot) return;
    addMeeting(selectedIds, selectedSlot, title.trim() || undefined);
    setSelectedIds([]);
    setSelectedSlot("");
    setTitle("");
    setOpen(false);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold">現有會議</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            共 {meetings.length} 個會議
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              建立會議
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>建立會議</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-2">
              <p className="text-xs text-muted-foreground">參與者（至少一位）</p>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => (
                  <Button
                    key={m.id}
                    type="button"
                    variant={selectedIds.includes(m.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleParticipant(m.id)}
                  >
                    {m.name}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">時段（共同空閒）</p>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
              >
                <option value="">請選擇</option>
                {commonSlots.map((s) => {
                  const [d, h] = s.split("-").map(Number);
                  return (
                    <option key={s} value={s}>
                      {DAYS[d]} {h}:00–{h + 1}:00
                    </option>
                  );
                })}
              </select>
              <Input
                placeholder="會議名稱（選填）"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Button
                onClick={handleCreate}
                disabled={selectedIds.length === 0 || !selectedSlot}
              >
                建立
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {meetings.length === 0 ? (
        <p className="text-muted-foreground text-sm py-12 text-center">
          尚無會議
        </p>
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => {
            const [d, h] = m.slot.split("-").map(Number);
            const participantNames = m.participantIds
              .map((id) => memberMap.get(id)?.name ?? id)
              .join("、");
            return (
              <Card key={m.id}>
                <CardContent className="p-4">
                  <p className="font-medium text-sm">
                    {m.title ?? `與 ${participantNames} 的會議`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {DAYS[d]} {h}:00–{h + 1}:00 · {participantNames}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
