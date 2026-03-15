"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { Legend } from "@/components/schedule/Legend";
import { useMeetFlow } from "@/context/MeetFlowContext";
import { getCommonSlots } from "@/lib/slots";
import { DAYS } from "@/lib/constants";

export function CommonSlotsTab() {
  const { members } = useMeetFlow();
  const commonSlots = getCommonSlots(members);

  return (
    <>
      <div className="mb-5">
        <h2 className="text-base font-semibold">共同空閒時間</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          所有 {members.length} 位成員都空閒的時段
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Legend
            items={[
              { color: "bg-emerald-400", label: "共同空閒" },
              { color: "bg-muted border border-border", label: "非共同" },
            ]}
          />
          {commonSlots.length === 0 ? (
            <p className="text-center text-muted-foreground py-10 text-sm">
              目前沒有共同空閒時段
            </p>
          ) : (
            <ScheduleGrid availability={commonSlots} emerald />
          )}
        </CardContent>
      </Card>

      {commonSlots.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {commonSlots.map((s) => {
            const [d, h] = s.split("-").map(Number);
            return (
              <div
                key={s}
                className="text-sm px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200"
              >
                {DAYS[d]} {h}:00–{h + 1}:00
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
