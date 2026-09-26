export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  type: 'emergency' | 'hazard' | 'family' | 'system';
  data?: Record<string, any>;
  receivedAt: string;
  isRead: boolean;
}
