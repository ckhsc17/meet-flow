"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Member, Meeting, Notification } from "@/lib/types";
import { COLORS, slot } from "@/lib/constants";
import { getMeetingsWithConflict, findBestRescheduleSlot, applyReschedule } from "@/lib/meetings";
import { createRescheduleNotification } from "@/lib/notifications";

// ─── Seed data ───────────────────────────────────────────────────────────────

const INITIAL_MEMBERS: Member[] = [
  {
    id: "me",
    name: "我",
    color: "bg-blue-500",
    availability: [
      slot(0, 9), slot(0, 10), slot(0, 11),
      slot(0, 14), slot(0, 15), slot(0, 16),
      slot(2, 9), slot(2, 10), slot(2, 11),
      slot(3, 14), slot(3, 15), slot(3, 16),
      slot(4, 9), slot(4, 10),
    ],
  },
  {
    id: "xiao-liang",
    name: "小梁",
    color: "bg-green-500",
    availability: [
      slot(0, 9), slot(0, 10), slot(0, 11),
      slot(2, 9), slot(2, 10), slot(2, 11),
      slot(2, 14), slot(2, 15), slot(2, 16),
      slot(4, 9), slot(4, 10),
    ],
  },
  {
    id: "lu-lu",
    name: "盧盧",
    color: "bg-purple-500",
    availability: [
      slot(1, 10), slot(1, 11), slot(1, 12),
      slot(2, 9), slot(2, 10), slot(2, 11),
      slot(3, 14), slot(3, 15),
    ],
  },
];

const INITIAL_MEETINGS: Meeting[] = [
  {
    id: "meeting-1",
    title: "團隊同步",
    participantIds: ["me", "xiao-liang", "lu-lu"],
    slot: "2-9",
    createdAt: Date.now(),
  },
];

// ─── Context type ────────────────────────────────────────────────────────────

type MeetFlowContextValue = {
  members: Member[];
  meetings: Meeting[];
  notifications: Notification[];
  updateMemberAvailability: (memberId: string, day: number, hour: number) => void;
  addMember: (name: string) => void;
  addMeeting: (participantIds: string[], slot: string, title?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
};

const MeetFlowContext = createContext<MeetFlowContextValue | null>(null);

type MeetFlowState = {
  members: Member[];
  meetings: Meeting[];
  notifications: Notification[];
};

const INITIAL_STATE: MeetFlowState = {
  members: INITIAL_MEMBERS,
  meetings: INITIAL_MEETINGS,
  notifications: [],
};

// ─── Provider ────────────────────────────────────────────────────────────────

export function MeetFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MeetFlowState>(INITIAL_STATE);
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
          },
        ],
      };
    });
  }, []);

  const addMeeting = useCallback(
    (participantIds: string[], slotStr: string, title?: string) => {
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
          },
        ],
      }));
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
      addMember,
      addMeeting,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      members,
      meetings,
      notifications,
      updateMemberAvailability,
      addMember,
      addMeeting,
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
