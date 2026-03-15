"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { Legend } from "@/components/schedule/Legend";
import { useMeetFlow } from "@/context/MeetFlowContext";

export function ViewMemberTab() {
  const { members, updateMemberAvailability } = useMeetFlow();
  const others = members.filter((m) => m.id !== "me");
  const [viewId, setViewId] = useState(others[0]?.id ?? "");
  const effectiveViewId =
    others.some((m) => m.id === viewId) ? viewId : (others[0]?.id ?? "");
  const viewing = members.find((m) => m.id === effectiveViewId) ?? others[0];

  function handleToggle(day: number, hour: number) {
    if (!effectiveViewId) return;
    updateMemberAvailability(effectiveViewId, day, hour);
  }

  return (
    <>
      <div className="mb-5">
        <h2 className="text-base font-semibold">查看成員時間表</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          選擇成員來查看或編輯他們的空閒時段（Demo：可編輯此成員時間表）
        </p>
      </div>

      {others.length === 0 ? (
        <p className="text-muted-foreground text-sm py-12 text-center">
          尚無其他成員，請先在「成員」頁加入
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-5">
            {others.map((m) => (
              <Button
                key={m.id}
                variant={effectiveViewId === m.id ? "default" : "outline"}
                size="sm"
                onClick={() => setViewId(m.id)}
              >
                {m.name}
              </Button>
            ))}
          </div>

          {viewing && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback
                      className={`${viewing.color} text-white text-xs font-semibold`}
                    >
                      {viewing.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {viewing.name} 的時間表
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Legend
                  items={[
                    { color: "bg-muted border border-border", label: "空閒" },
                    { color: "bg-primary", label: "忙碌" },
                  ]}
                />
                <ScheduleGrid
                  availability={viewing.availability}
                  onToggle={handleToggle}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </>
  );
}
