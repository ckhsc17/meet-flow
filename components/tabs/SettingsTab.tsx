"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Legend } from "@/components/schedule/Legend";
import { useMeetFlow } from "@/context/MeetFlowContext";
import { DAYS, HOURS, slot } from "@/lib/constants";

export function SettingsTab() {
  const { members, updateMemberDeepWork } = useMeetFlow();
  const me = members.find((m) => m.id === "me");
  if (!me) return null;

  const deepWorkSlots = me.deepWorkSlots ?? [];

  function handleToggle(day: number, hour: number) {
    updateMemberDeepWork("me", day, hour);
  }

  return (
    <>
      <div className="mb-5">
        <h2 className="text-base font-semibold">設定與偏好</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          設定每日深度工作時段（低優先會議將不會被排入此時段）
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Legend
            items={[
              {
                color: "bg-amber-400 border-amber-500",
                label: "深度工作保護區",
              },
              { color: "bg-muted border border-border", label: "非保護區" },
            ]}
          />
          <DeepWorkGrid
            deepWorkSlots={deepWorkSlots}
            onToggle={handleToggle}
          />
        </CardContent>
      </Card>
    </>
  );
}

function DeepWorkGrid({
  deepWorkSlots,
  onToggle,
}: {
  deepWorkSlots: string[];
  onToggle: (day: number, hour: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="w-14" />
            {DAYS.map((d) => (
              <th key={d} className="p-2 text-center font-medium text-sm">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map((h) => (
            <tr key={h}>
              <td className="text-right pr-3 text-muted-foreground text-xs py-0.5 whitespace-nowrap">
                {h}:00
              </td>
              {DAYS.map((_, d) => {
                const s = slot(d, h);
                const active = deepWorkSlots.includes(s);
                const cellClass = active
                  ? "bg-amber-400 border-amber-500"
                  : "bg-muted border-border hover:bg-muted/60";
                return (
                  <td key={d} className="p-0.5">
                    <div
                      className={`h-8 rounded border transition-colors ${cellClass} cursor-pointer`}
                      onClick={() => onToggle(d, h)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
