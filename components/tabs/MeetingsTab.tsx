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
import type { Meeting, Member, MeetingWeight } from "@/lib/types";
import { useMeetFlow } from "@/context/MeetFlowContext";
import { getTopRecommendedSlots } from "@/lib/meetings";
import { DAYS } from "@/lib/constants";
import { Plus, CalendarClock } from "lucide-react";

export function MeetingsTab() {
  const { members, meetings, addMeeting, rescheduleMeeting } = useMeetFlow();
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const [open, setOpen] = useState(false);
  const [rescheduleMeetingId, setRescheduleMeetingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [title, setTitle] = useState("");
  const [weight, setWeight] = useState<MeetingWeight>("high");

  const createSlotOptions =
    selectedIds.length > 0
      ? getTopRecommendedSlots(
          selectedIds,
          members,
          meetings,
          weight,
          { top: 50 }
        )
      : [];

  function toggleParticipant(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleCreate() {
    if (selectedIds.length === 0 || !selectedSlot) return;
    addMeeting(selectedIds, selectedSlot, title.trim() || undefined, weight);
    setSelectedIds([]);
    setSelectedSlot("");
    setTitle("");
    setWeight("high");
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
              <p className="text-xs text-muted-foreground">會議權重</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={weight === "high" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWeight("high")}
                >
                  需報告（高優先）
                </Button>
                <Button
                  type="button"
                  variant={weight === "low" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWeight("low")}
                >
                  僅需聆聽（低優先）
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">時段（依權重與深度工作區篩選，依 batching 排序）</p>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
              >
                <option value="">請選擇</option>
                {createSlotOptions.map((r) => {
                  const [d, h] = r.slot.split("-").map(Number);
                  return (
                    <option key={r.slot} value={r.slot}>
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
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">
                      {m.title ?? `與 ${participantNames} 的會議`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {DAYS[d]} {h}:00–{h + 1}:00 · {participantNames}
                      {m.weight === "low" ? " · 僅聆聽" : " · 需報告"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 shrink-0"
                    onClick={() => setRescheduleMeetingId(m.id)}
                  >
                    <CalendarClock className="w-3.5 h-3.5" />
                    重新排程
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <RescheduleDialog
        meeting={meetings.find((m) => m.id === rescheduleMeetingId) ?? null}
        members={members}
        meetings={meetings}
        open={rescheduleMeetingId != null}
        onClose={() => setRescheduleMeetingId(null)}
        onReschedule={(newSlot) => {
          if (rescheduleMeetingId) {
            rescheduleMeeting(rescheduleMeetingId, newSlot);
            setRescheduleMeetingId(null);
          }
        }}
      />
    </>
  );
}

function RescheduleDialog({
  meeting,
  members,
  meetings,
  open,
  onClose,
  onReschedule,
}: {
  meeting: Meeting | null;
  members: Member[];
  meetings: Meeting[];
  open: boolean;
  onClose: () => void;
  onReschedule: (newSlot: string) => void;
}) {
  const recommendations =
    meeting && open
      ? getTopRecommendedSlots(
          meeting.participantIds,
          members,
          meetings,
          meeting.weight,
          { top: 3 }
        )
      : [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>重新排程 · 推薦時段</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          前 3 個最優推薦時段（參與者皆空閒，且依權重過濾深度工作區、依 batching 排序）
        </p>
        {recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            目前無可推薦時段
          </p>
        ) : (
          <div className="space-y-2">
            {recommendations.map((r) => {
              const [d, h] = r.slot.split("-").map(Number);
              return (
                <div
                  key={r.slot}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {DAYS[d]} {h}:00–{h + 1}:00
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.reason}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onReschedule(r.slot)}
                  >
                    選此時段
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
