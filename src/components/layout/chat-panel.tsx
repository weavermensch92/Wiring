"use client";

import { useState, useRef, useEffect } from "react";
import { useLayoutStore } from "@/stores/layout-store";
import { useChatStore } from "@/stores/chat-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Send, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { AGENT_COLORS } from "@/lib/constants";

// ─── 컨텍스트별 빠른 질문 ───
const QUICK_QUESTIONS: Record<string, string[]> = {
  ticket: [
    "이 티켓 현재 상태 요약해줘",
    "의존성 있는 티켓 알려줘",
    "예상 완료까지 얼마나 걸려?",
  ],
  hitl: [
    "이 HITL 요청 배경 설명해줘",
    "리스크 있으면 알려줘",
    "유사 이전 결정 사례 있어?",
  ],
  epic: [
    "이 에픽 진행률 알려줘",
    "블로킹 이슈 있어?",
    "예산 현황 알려줘",
  ],
  general: [
    "오늘 HITL 대기 항목 알려줘",
    "활성 에이전트 현황",
    "이번 주 완료된 티켓 요약",
  ],
};

// ─── 컨텍스트별 응답 생성 (더미) ───
function generateAgentResponse(userInput: string, contextType: string, contextTitle?: string): { agent: string; content: string } {
  const input = userInput.toLowerCase();

  if (contextType === "hitl") {
    if (input.includes("배경") || input.includes("설명")) {
      return { agent: "GM", content: `${contextTitle ?? "이 HITL 항목"}은 에이전트가 자동으로 처리하기 어려운 판단이 필요한 케이스입니다. 보안·비용·스펙 결정 등 중요도가 높아 인간 승인을 요청했습니다.` };
    }
    if (input.includes("리스크")) {
      return { agent: "GM", content: "현재 식별된 리스크: 승인 지연 시 하위 티켓 3개가 블로킹될 수 있습니다. 가능하면 오늘 내로 처리 권장합니다." };
    }
    return { agent: "PM", content: `${contextTitle ?? "HITL 항목"}에 대한 검토를 요청합니다. 추가로 궁금한 내용이 있으면 말씀해 주세요.` };
  }

  if (contextType === "ticket") {
    if (input.includes("상태") || input.includes("요약")) {
      return { agent: "PM", content: `${contextTitle ?? "티켓"} 현재 상태: 진행 중입니다. 담당 에이전트가 작업 중이며, 코드 리뷰 HITL 발행 후 완료될 예정입니다.` };
    }
    if (input.includes("의존") || input.includes("블로킹")) {
      return { agent: "PM", content: "이 티켓은 현재 HITL 승인을 기다리고 있어 일부 하위 작업이 대기 중입니다. 승인 완료 후 자동으로 재개됩니다." };
    }
    return { agent: "FE", content: `${contextTitle ?? "티켓"} 관련해서 추가 정보가 필요하시면 말씀해 주세요.` };
  }

  if (contextType === "epic") {
    if (input.includes("진행") || input.includes("현황")) {
      return { agent: "PM", content: `에픽 진행률: 약 40% 완료. 5개 티켓 중 2개 완료, 2개 진행 중, 1개 대기 중입니다.` };
    }
    if (input.includes("예산")) {
      return { agent: "BM", content: "현재 에픽 예산 소진율: 62%. 남은 작업 대비 예산은 충분합니다. 단, 모델 배분 HITL 승인에 따라 변동될 수 있습니다." };
    }
    return { agent: "PM", content: "에픽 전반에 대해 추가로 알고 싶은 내용을 말씀해 주세요." };
  }

  // general
  if (input.includes("hitl") || input.includes("대기")) {
    return { agent: "PM", content: "현재 HITL 대기 항목: 3건 (코드 리뷰, 보안 승인, 디자인 검토). 우선순위는 보안 승인 > 코드 리뷰 순입니다." };
  }
  if (input.includes("에이전트") || input.includes("현황")) {
    return { agent: "PM", content: "현재 활성 에이전트: FE, BE, Dsn, GM, PM (5개). 대기 중: SM, Pln, BM, HR (4개). FE/BE가 핵심 티켓 작업 중입니다." };
  }
  if (input.includes("완료") || input.includes("티켓")) {
    return { agent: "PM", content: "이번 주 완료 티켓: 4건. S3 업로드 모듈, 이미지 메타데이터 저장, 업로드 UI 등 이미지 공유 기능 위주로 진행됐습니다." };
  }
  return { agent: "PM", content: "안녕하세요! Wiring AI입니다. 티켓, HITL, 에이전트 현황 등 궁금한 것을 물어보세요." };
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function ChatPanel() {
  const { chatPanelOpen, setChatPanelOpen, chatPanelWidth } = useLayoutStore();
  const { currentContext, histories, addMessage } = useChatStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const contextId = currentContext?.id ?? "general";
  const contextType = currentContext?.type ?? "general";
  const messages = histories[contextId] ?? [];
  const quickQuestions = QUICK_QUESTIONS[contextType] ?? QUICK_QUESTIONS.general;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!chatPanelOpen) return null;

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsgId = `u-${Date.now()}`;
    addMessage(contextId, {
      id: userMsgId,
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString(),
    });
    setInput("");

    setTimeout(() => {
      const { agent, content } = generateAgentResponse(text, contextType, currentContext?.title);
      addMessage(contextId, {
        id: `a-${Date.now()}`,
        role: "agent",
        agent,
        content,
        timestamp: new Date().toISOString(),
      });
    }, 600);
  };

  return (
    <motion.div
      initial={{ x: chatPanelWidth }}
      animate={{ x: 0 }}
      exit={{ x: chatPanelWidth }}
      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
      className="flex flex-col h-full border-l border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-secondary)] shrink-0"
      style={{ width: chatPanelWidth }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--wiring-glass-border)] shrink-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--wiring-accent)] shrink-0" />
            <h3 className="text-sm font-semibold text-[var(--wiring-text-primary)]">Wiring AI</h3>
          </div>
          {currentContext ? (
            <p className="text-[10px] text-[var(--wiring-accent)] truncate mt-0.5">
              {currentContext.type === "ticket" ? "티켓"
                : currentContext.type === "hitl" ? "HITL"
                : currentContext.type === "epic" ? "에픽"
                : "일반"} · {currentContext.title}
            </p>
          ) : (
            <p className="text-[10px] text-[var(--wiring-text-tertiary)] mt-0.5">일반 대화</p>
          )}
        </div>
        <button
          onClick={() => setChatPanelOpen(false)}
          className="p-1.5 rounded-lg text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="py-6 text-center">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-[var(--wiring-accent)]" />
              <p className="text-sm text-[var(--wiring-text-secondary)]">무엇이든 물어보세요</p>
              <p className="text-xs text-[var(--wiring-text-tertiary)] mt-1">
                {currentContext
                  ? `${currentContext.title} 관련 질문`
                  : "티켓, HITL, 에이전트 현황 등"}
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {msg.role !== "user" && (
                <Avatar className="w-6 h-6 shrink-0 mt-0.5">
                  <AvatarFallback
                    className="text-[9px] font-bold text-white"
                    style={{ backgroundColor: msg.agent ? (AGENT_COLORS[msg.agent] ?? "#5C5C6F") : "#5C5C6F" }}
                  >
                    {msg.agent ?? "SYS"}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 min-w-0">
                {msg.role === "agent" && msg.agent && (
                  <p className="text-[10px] text-[var(--wiring-text-tertiary)] mb-0.5 ml-0.5">{msg.agent} · {formatTime(msg.timestamp)}</p>
                )}
                <div
                  className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[var(--wiring-accent)] text-white ml-auto max-w-[85%] inline-block"
                      : msg.role === "system"
                      ? "bg-[var(--wiring-glass-bg)] text-[var(--wiring-text-tertiary)] border border-[var(--wiring-glass-border)]"
                      : "bg-[var(--wiring-bg-tertiary)] text-[var(--wiring-text-primary)]"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <p className="text-[10px] text-[var(--wiring-text-tertiary)] mt-0.5 text-right">{formatTime(msg.timestamp)}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* 빠른 질문 */}
      {messages.length === 0 && (
        <div className="px-4 pb-2">
          <div className="flex flex-col gap-1.5">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-left text-xs px-3 py-2 rounded-lg border border-[var(--wiring-glass-border)] text-[var(--wiring-text-secondary)] hover:border-[var(--wiring-accent)] hover:text-[var(--wiring-text-primary)] hover:bg-[var(--wiring-accent-glow)] transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-[var(--wiring-glass-border)] shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="메시지를 입력하세요..."
            rows={1}
            className="flex-1 resize-none bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] rounded-xl px-3 py-2 text-xs text-[var(--wiring-text-primary)] placeholder:text-[var(--wiring-text-tertiary)] focus:outline-none focus:border-[var(--wiring-accent)] transition-colors"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="p-2 rounded-xl bg-[var(--wiring-accent)] text-white disabled:opacity-30 hover:opacity-90 transition-opacity"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
