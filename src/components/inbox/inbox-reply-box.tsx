"use client";

import { useState, useRef, useCallback } from "react";
import { Send } from "lucide-react";
import { useInboxStore } from "@/stores/inbox-store";
import { InboxThreadMessage } from "@/types/inbox";

// Agent auto-reply simulation
const AGENT_REPLIES: Record<string, string[]> = {
  "agent-pm": [
    "네, 확인했습니다. 다음 스프린트 계획에 반영하겠습니다.",
    "좋은 의견 감사합니다. 팀과 논의 후 업데이트 드리겠습니다.",
    "알겠습니다. 우선순위를 조정하여 반영하겠습니다.",
  ],
  "agent-gm": [
    "검토 결과를 반영하여 수정하겠습니다.",
    "추가 정보가 필요하시면 말씀해 주세요.",
  ],
  "agent-sm": [
    "피드백 반영하여 기획서를 업데이트하겠습니다.",
    "네, 해당 부분 상세히 분석하여 공유드리겠습니다.",
  ],
  "agent-fe": [
    "코드 수정 후 PR 올리겠습니다.",
    "성능 측정 결과도 함께 공유드리겠습니다.",
  ],
  "agent-be": [
    "테스트 결과와 함께 업데이트하겠습니다.",
    "API 문서도 함께 업데이트하겠습니다.",
  ],
  "agent-bm": [
    "비용 분석 상세 데이터를 준비하겠습니다.",
    "예산 조정안을 업데이트하겠습니다.",
  ],
};

function getAgentReply(agentId: string): string {
  const replies = AGENT_REPLIES[agentId] ?? ["확인했습니다. 처리하겠습니다."];
  return replies[Math.floor(Math.random() * replies.length)];
}

export function InboxReplyBox({ messageId, agentId, agentLabel }: { messageId: string; agentId?: string; agentLabel?: string }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addReply } = useInboxStore();

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    // Add user reply
    const userReply: InboxThreadMessage = {
      id: `reply-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    addReply(messageId, userReply);
    setInput("");

    // Simulate agent response
    if (agentId) {
      setTimeout(() => {
        const agentReply: InboxThreadMessage = {
          id: `reply-${Date.now()}`,
          role: "agent",
          agentId,
          agentLabel,
          content: getAgentReply(agentId),
          timestamp: new Date().toISOString(),
        };
        addReply(messageId, agentReply);
      }, 800);
    }
  }, [input, messageId, agentId, agentLabel, addReply]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 border-t border-[var(--wiring-glass-border)]">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="답장을 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
        rows={1}
        className="flex-1 resize-none bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--wiring-text-primary)] placeholder:text-[var(--wiring-text-tertiary)] focus:outline-none focus:border-[var(--wiring-accent)] transition-colors"
      />
      <button
        onClick={handleSend}
        disabled={!input.trim()}
        className="p-2 rounded-lg bg-[var(--wiring-accent)] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
