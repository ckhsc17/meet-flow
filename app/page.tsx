"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Users, User, Calendar, CalendarDays, Bell, Settings } from "lucide-react";
import { MeetFlowProvider, useMeetFlow } from "@/context/MeetFlowContext";
import { MembersTab } from "@/components/tabs/MembersTab";
import { MyScheduleTab } from "@/components/tabs/MyScheduleTab";
import { ViewMemberTab } from "@/components/tabs/ViewMemberTab";
import { SettingsTab } from "@/components/tabs/SettingsTab";
import { CommonSlotsTab } from "@/components/tabs/CommonSlotsTab";
import { NotificationsTab } from "@/components/tabs/NotificationsTab";
import { MeetingsTab } from "@/components/tabs/MeetingsTab";

function MeetFlowTabs() {
  const { notifications } = useMeetFlow();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Tabs defaultValue="members">
      <TabsList className="mb-8 h-10 flex-wrap">
        <TabsTrigger value="members" className="gap-1.5 text-sm">
          <Users className="w-3.5 h-3.5" />
          成員
        </TabsTrigger>
        <TabsTrigger value="my-schedule" className="gap-1.5 text-sm">
          <User className="w-3.5 h-3.5" />
          我的時間表
        </TabsTrigger>
        <TabsTrigger value="view-member" className="gap-1.5 text-sm">
          <Calendar className="w-3.5 h-3.5" />
          查看成員
        </TabsTrigger>
        <TabsTrigger value="settings" className="gap-1.5 text-sm">
          <Settings className="w-3.5 h-3.5" />
          設定與偏好
        </TabsTrigger>
        <TabsTrigger value="common" className="gap-1.5 text-sm">
          <CalendarCheck className="w-3.5 h-3.5" />
          共同空閒
        </TabsTrigger>
        <TabsTrigger value="meetings" className="gap-1.5 text-sm">
          <CalendarDays className="w-3.5 h-3.5" />
          現有會議
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-1.5 text-sm relative">
          <Bell className="w-3.5 h-3.5" />
          通知
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="ml-1 h-5 min-w-5 rounded-full px-1 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="members">
        <MembersTab />
      </TabsContent>
      <TabsContent value="my-schedule">
        <MyScheduleTab />
      </TabsContent>
      <TabsContent value="view-member">
        <ViewMemberTab />
      </TabsContent>
      <TabsContent value="settings">
        <SettingsTab />
      </TabsContent>
      <TabsContent value="common">
        <CommonSlotsTab />
      </TabsContent>
      <TabsContent value="meetings">
        <MeetingsTab />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationsTab />
      </TabsContent>
    </Tabs>
  );
}

export default function MeetFlow() {
  return (
    <MeetFlowProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
            <CalendarCheck className="w-5 h-5" />
            <h1 className="text-lg font-semibold tracking-tight">MeetFlow</h1>
            <Badge variant="secondary" className="text-xs font-normal">
              Beta
            </Badge>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          <MeetFlowTabs />
        </main>
      </div>
    </MeetFlowProvider>
  );
}
