/** "day-hour", e.g. "0-9" = Monday 9am */
export type TimeSlot = string;

export type Member = {
  id: string;
  name: string;
  color: string;
  availability: TimeSlot[];
  /** User-defined deep work protection blocks (深度工作時段) */
  deepWorkSlots?: TimeSlot[];
};

export type MeetingWeight = "high" | "low";

export type Meeting = {
  id: string;
  title?: string;
  participantIds: string[];
  slot: TimeSlot;
  createdAt: number;
  /** 需報告 = high, 僅需聆聽 = low */
  weight: MeetingWeight;
};

export type NotificationType = "reschedule";

export type Notification = {
  id: string;
  type: NotificationType;
  meetingId?: string;
  message: string;
  read: boolean;
  createdAt: number;
};
