"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Member, Meeting, MeetingWeight, Notification } from "@/lib/types";
import { COLORS, slot } from "@/lib/constants";
import { getCommonSlots, generateRandomAvailability } from "@/lib/slots";
import { getMeetingsWithConflict, findBestRescheduleSlot, applyReschedule } from "@/lib/meetings";
import { createRescheduleNotification } from "@/lib/notifications";

// ─── Seed data (random availability for 3 members) ──────────────────────────

function getInitialMembers(): Member[] {
  const seedIds = ["me", "xiao-liang", "lu-lu"] as const;
  const names = { me: "我", "xiao-liang": "小梁", "lu-lu": "盧盧" } as const;
  const seedColors = ["bg-blue-500", "bg-green-500", "bg-purple-500"] as const;
  return seedIds.map((id, i) => ({
    id,
    name: names[id],
    color: seedColors[i],
    availability: generateRandomAvailability(),
    deepWorkSlots: [],
  }));
}

function getInitialState(): MeetFlowState {
  const members = getInitialMembers();
  const commonSlots = getCommonSlots(members);
  const meetings: Meeting[] =
    commonSlots.length > 0
      ? [
          {
            id: "meeting-1",
            title: "團隊同步",
            participantIds: ["me", "xiao-liang", "lu-lu"],
            slot: commonSlots[0],
            createdAt: Date.now(),
            weight: "high",
          },
        ]
      : [];
  return { members, meetings, notifications: [] };
}

// ─── Context type ────────────────────────────────────────────────────────────

type MeetFlowContextValue = {
  members: Member[];
  meetings: Meeting[];
  notifications: Notification[];
  updateMemberAvailability: (memberId: string, day: number, hour: number) => void;
  updateMemberDeepWork: (memberId: string, day: number, hour: number) => void;
  addMember: (name: string) => void;
  addMeeting: (participantIds: string[], slot: string, title?: string, weight?: MeetingWeight) => void;
  rescheduleMeeting: (meetingId: string, newSlot: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
};

const MeetFlowContext = createContext<MeetFlowContextValue | null>(null);

type MeetFlowState = {
  members: Member[];
  meetings: Meeting[];
  notifications: Notification[];
};

// ─── Provider ────────────────────────────────────────────────────────────────

export function MeetFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MeetFlowState>(getInitialState);
  const { members, meetings, notifications } = state;

  const updateMemberAvailability = useCallback(
    (memberId: string, day: number, hour: number) => {
      const s = slot(day, hour);
      setState((prev) => {
        const nextMembers = prev.members.map((m) =>
          m.id !== memberId
            ? m
            : {
                ...m,
                availability: m.availability.includes(s)
                  ? m.availability.filter((x) => x !== s)
                  : [...m.availability, s],
              }
        );
        const conflicted = getMeetingsWithConflict(
          nextMembers,
          prev.meetings
        );
        let nextMeetings = [...prev.meetings];
        const newNotifs: Notification[] = [];
        const memberById = new Map(nextMembers.map((m) => [m.id, m]));
        const changedMemberName = memberById.get(memberId)?.name;

        for (const meeting of conflicted) {
          const newSlot = findBestRescheduleSlot(
            meeting,
            nextMembers,
            nextMeetings
          );
          if (!newSlot) continue;
          const updated = applyReschedule(meeting, newSlot);
          nextMeetings = nextMeetings.map((m) =>
            m.id === meeting.id ? updated : m
          );
          const payload = createRescheduleNotification(
            updated,
            meeting.slot,
            newSlot,
            changedMemberName
          );
          for (const pid of meeting.participantIds) {
            newNotifs.push({
              ...payload,
              id: `notif-${Date.now()}-${pid}-${Math.random().toString(36).slice(2)}`,
            });
          }
        }

        return {
          members: nextMembers,
          meetings: nextMeetings,
          notifications:
            newNotifs.length > 0
              ? [...newNotifs, ...prev.notifications]
              : prev.notifications,
        };
      });
    },
    []
  );

  const updateMemberDeepWork = useCallback(
    (memberId: string, day: number, hour: number) => {
      const s = slot(day, hour);
      setState((prev) => ({
        ...prev,
        members: prev.members.map((m) => {
          if (m.id !== memberId) return m;
          const current = m.deepWorkSlots ?? [];
          const next = current.includes(s)
            ? current.filter((x) => x !== s)
            : [...current, s];
          return { ...m, deepWorkSlots: next };
        }),
      }));
    },
    []
  );

  const addMember = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setState((prev) => {
      const color = COLORS[prev.members.length % COLORS.length];
      return {
        ...prev,
        members: [
          ...prev.members,
          {
            id: `member-${Date.now()}`,
            name: trimmed,
            color,
            availability: [],
            deepWorkSlots: [],
          },
        ],
      };
    });
  }, []);

  const addMeeting = useCallback(
    (
      participantIds: string[],
      slotStr: string,
      title?: string,
      weight: MeetingWeight = "high"
    ) => {
      setState((prev) => ({
        ...prev,
        meetings: [
          ...prev.meetings,
          {
            id: `meeting-${Date.now()}`,
            title,
            participantIds,
            slot: slotStr,
            createdAt: Date.now(),
            weight,
          },
        ],
      }));
    },
    []
  );

  const rescheduleMeeting = useCallback(
    (meetingId: string, newSlot: string) => {
      setState((prev) => {
        const meeting = prev.meetings.find((m) => m.id === meetingId);
        if (!meeting) return prev;
        const updated = { ...meeting, slot: newSlot };
        const nextMeetings = prev.meetings.map((m) =>
          m.id === meetingId ? updated : m
        );
        const payload = createRescheduleNotification(
          updated,
          meeting.slot,
          newSlot
        );
        const newNotifs: Notification[] = meeting.participantIds.map(
          (pid) => ({
            ...payload,
            id: `notif-${Date.now()}-${pid}-${Math.random().toString(36).slice(2)}`,
          })
        );
        return {
          ...prev,
          meetings: nextMeetings,
          notifications: [...newNotifs, ...prev.notifications],
        };
      });
    },
    []
  );

  const markNotificationRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const value = useMemo<MeetFlowContextValue>(
    () => ({
      members,
      meetings,
      notifications,
      updateMemberAvailability,
      updateMemberDeepWork,
      addMember,
      addMeeting,
      rescheduleMeeting,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      members,
      meetings,
      notifications,
      updateMemberAvailability,
      updateMemberDeepWork,
      addMember,
      addMeeting,
      rescheduleMeeting,
      markNotificationRead,
      markAllNotificationsRead,
    ]
  );

  return (
    <MeetFlowContext.Provider value={value}>
      {children}
    </MeetFlowContext.Provider>
  );
}

export function useMeetFlow() {
  const ctx = useContext(MeetFlowContext);
  if (!ctx) throw new Error("useMeetFlow must be used within MeetFlowProvider");
  return ctx;
}
