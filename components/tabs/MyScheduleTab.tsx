"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { Legend } from "@/components/schedule/Legend";
import { useMeetFlow } from "@/context/MeetFlowContext";

export function MyScheduleTab() {
  const { members, updateMemberAvailability } = useMeetFlow();
  const me = members.find((m) => m.id === "me");
  if (!me) return null;

  function handleToggle(day: number, hour: number) {
    updateMemberAvailability("me", day, hour);
  }

  return (
    <>
      <div className="mb-5">
        <h2 className="text-base font-semibold">我的時間表</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          點擊格子來切換你的空閒時段
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Legend
            items={[
              { color: "bg-muted border border-border", label: "空閒" },
              { color: "bg-primary", label: "忙碌" },
            ]}
          />
          <ScheduleGrid
            availability={me.availability}
            onToggle={handleToggle}
          />
        </CardContent>
      </Card>
    </>
  );
}
