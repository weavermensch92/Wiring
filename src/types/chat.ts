export interface ChatContext {
  type: "ticket" | "hitl" | "epic" | "general";
  id: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent" | "system";
  agent?: string;
  content: string;
  timestamp: string;
}
