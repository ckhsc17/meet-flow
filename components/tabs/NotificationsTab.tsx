"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMeetFlow } from "@/context/MeetFlowContext";
import { CheckCheck } from "lucide-react";

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString("zh-TW", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationsTab() {
  const { notifications, markNotificationRead, markAllNotificationsRead } =
    useMeetFlow();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold">通知</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {unreadCount > 0 ? `${unreadCount} 則未讀` : "全部已讀"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={markAllNotificationsRead}
          >
            <CheckCheck className="w-4 h-4" />
            標示全部已讀
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-muted-foreground text-sm py-12 text-center">
          尚無通知
        </p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={n.read ? "opacity-80" : "border-primary/30"}
            >
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(n.createdAt)}
                  </p>
                </div>
                {!n.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-xs"
                    onClick={() => markNotificationRead(n.id)}
                  >
                    標示已讀
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
