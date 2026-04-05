export type InboxMessageCategory =
  | "agent_report"
  | "hitl_request"
  | "system_alert"
  | "ticket_update"
  | "agent_conversation"
  | "external_update";

export type InboxMessagePriority = "critical" | "high" | "normal" | "low";

export type InboxMessageStatus = "unread" | "read" | "archived";

export interface InboxAttachment {
  id: string;
  type: "ticket" | "hitl" | "epic" | "project" | "document" | "agent" | "url";
  refId: string;
  label: string;
  href: string;
}

export interface InboxAction {
  id: string;
  type: "approve" | "reject" | "navigate" | "reply" | "escalate" | "acknowledge";
  label: string;
  variant: "primary" | "danger" | "secondary";
  hitlItemId?: string;
}

export interface InboxThreadMessage {
  id: string;
  role: "user" | "agent" | "system";
  agentId?: string;
  agentLabel?: string;
  content: string;
  timestamp: string;
  attachments?: InboxAttachment[];
}

export interface InboxMessage {
  id: string;
  category: InboxMessageCategory;
  priority: InboxMessagePriority;
  status: InboxMessageStatus;
  starred: boolean;

  // Sender
  senderAgentId?: string;
  senderAgentLabel?: string;
  senderSystem?: string;

  // Content
  subject: string;
  preview: string;
  body: string;

  // Thread
  threadId: string;
  thread: InboxThreadMessage[];
  hasUnreadReply: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Attachments & Actions
  attachments: InboxAttachment[];
  actions: InboxAction[];

  // Cross-references
  hitlItemId?: string;
  ticketId?: string;
  epicId?: string;
  teamId?: string;
}

export type InboxFolder =
  | "all"
  | "unread"
  | "starred"
  | "hitl"
  | "agent"
  | "archive";
