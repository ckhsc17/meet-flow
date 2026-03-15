/** "day-hour", e.g. "0-9" = Monday 9am */
export type TimeSlot = string;

export type Member = {
  id: string;
  name: string;
  color: string;
  availability: TimeSlot[];
};

export type Meeting = {
  id: string;
  title?: string;
  participantIds: string[];
  slot: TimeSlot;
  createdAt: number;
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
