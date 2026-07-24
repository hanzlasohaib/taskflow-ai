export type DemoNotification = {
  id: string;
  title: string;
  time: string;
};

export const DEMO_NOTIFICATIONS: DemoNotification[] = [
  { id: "1", title: "Task completed", time: "2 min ago" },
  { id: "2", title: "Database synced", time: "Yesterday" },
  { id: "3", title: "Voice transcription finished", time: "Yesterday" },
];
