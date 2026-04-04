"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useLayoutStore } from "@/stores/layout-store";
import { useChatStore } from "@/stores/chat-store";
import { useHITLStore } from "@/stores/hitl-store";
import { DUMMY_AGENTS } from "@/dummy/agents";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Send, Sparkles, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AGENT_COLORS } from "@/lib/constants";

// ─── 슬래시 커맨드 정의 ───
interface SlashCommand {
  cmd: string;
  desc: string;
  example?: string;
}

const SLASH_COMMANDS: SlashCommand[] = [
  { cmd: "/status",  desc: "현재 시스템 상태 요약",      example: "/status" },
  { cmd: "/hitl",    desc: "HITL 대기 항목 조회",         example: "/hitl" },
  { cmd: "/cost",    desc: "오늘 AI 비용 요약",            example: "/cost" },
  { cmd: "/agents",  desc: "에이전트 현황 조회",           example: "/agents" },
  { cmd: "/assign",  desc: "에이전트 배정 요청",           example: "/assign @FE ticket-id" },
  { cmd: "/help",    desc: "사용 가능한 커맨드 목록",      example: "/help" },
];

// ─── 슬래시 커맨드 응답 생성 ───
function handleSlashCommand(input: string, hitlWaiting: number): { agent: string; content: string } | null {
  const parts = input.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();

  if (cmd === "/help") {
    const list = SLASH_COMMANDS.map((c) => `**${c.cmd}** — ${c.desc}`).join("\n");
    return { agent: "PM", content: `사용 가능한 커맨드:\n\n${list}` };
  }
  if (cmd === "/status") {
    return { agent: "PM", content: `**시스템 현황 요약**\n\n- HITL 대기: ${hitlWaiting}건\n- 활성 에이전트: ${(DUMMY_AGENTS as any[]).filter((a) => a.status === "active").length}개\n- 오늘 총 비용: $${(DUMMY_AGENTS as any[]).reduce((s: number, a: any) => s + (a.todayCostUsd ?? 0), 0).toFixed(1)}\n- 마지막 업데이트: 방금` };
  }
  if (cmd === "/hitl") {
    if (hitlWaiting === 0) return { agent: "GM", content: "현재 대기 중인 HITL 항목이 없습니다. 모든 항목이 처리되었습니다." };
    return { agent: "GM", content: `**HITL 대기 항목: ${hitlWaiting}건**\n\n최우선 처리 권장:\n1. 보안 승인 (security_approval)\n2. 코드 리뷰 (code_review)\n3. 스펙 결정 (spec_decision)\n\n/hitl [item-id] 로 특정 항목 상세 조회 가능합니다.` };
  }
  if (cmd === "/cost") {
    const agents = (DUMMY_AGENTS as any[]);
    const total = agents.reduce((s: number, a: any) => s + (a.todayCostUsd ?? 0), 0);
    const top = [...agents].sort((a, b) => (b.todayCostUsd ?? 0) - (a.todayCostUsd ?? 0)).slice(0, 3);
    const topStr = top.map((a) => `  - ${a.id}: $${(a.todayCostUsd ?? 0).toFixed(1)}`).join("\n");
    return { agent: "BM", content: `**오늘 AI 비용: $${total.toFixed(1)}**\n\n상위 비용 에이전트:\n${topStr}\n\n예산 대비: 정상 범위 내` };
  }
  if (cmd === "/agents") {
    const active = (DUMMY_AGENTS as any[]).filter((a) => a.status === "active");
    const idle = (DUMMY_AGENTS as any[]).filter((a) => a.status === "idle");
    const activeStr = active.map((a: any) => `  - **${a.id}**: ${a.currentTask ?? "작업 없음"}`).join("\n");
    return { agent: "PM", content: `**활성 에이전트 (${active.length}개)**\n${activeStr}\n\n**대기 중 (${idle.length}개)**: ${idle.map((a: any) => a.id).join(", ")}` };
  }
  if (cmd === "/assign") {
    const agentMention = parts.find((p) => p.startsWith("@"))?.slice(1);
    const ticketId = parts.find((p) => !p.startsWith("/") && !p.startsWith("@"));
    if (!agentMention) return { agent: "PM", content: "사용법: /assign @에이전트명 티켓ID\n예: /assign @FE ticket-123" };
    return { agent: "PM", content: `**배정 요청 완료**\n\n에이전트: **${agentMention}**\n티켓: ${ticketId ?? "지정 없음"}\n\n실제 배정은 PM Agent가 검토 후 처리합니다. HITL 항목이 생성될 수 있습니다.` };
  }
  return null;
}

// ─── 컨텍스트별 빠른 질문 ───
const QUICK_QUESTIONS: Record<string, string[]> = {
  ticket: ["이 티켓 현재 상태 요약해줘", "의존성 있는 티켓 알려줘", "예상 완료까지 얼마나 걸려?"],
  hitl: ["이 HITL 요청 배경 설명해줘", "리스크 있으면 알려줘", "유사 이전 결정 사례 있어?"],
  epic: ["이 에픽 진행률 알려줘", "블로킹 이슈 있어?", "예산 현황 알려줘"],
  general: ["/status", "/hitl", "/agents"],
};

// ─── 일반 응답 생성 ───
function generateAgentResponse(userInput: string, contextType: string, contextTitle?: string): { agent: string; content: string } {
  const input = userInput.toLowerCase();
  if (contextType === "hitl") {
    if (input.includes("배경") || input.includes("설명")) return { agent: "GM", content: `${contextTitle ?? "이 HITL 항목"}은 에이전트가 자동으로 처리하기 어려운 판단이 필요한 케이스입니다.` };
    if (input.includes("리스크")) return { agent: "GM", content: "현재 식별된 리스크: 승인 지연 시 하위 티켓 3개가 블로킹될 수 있습니다." };
    return { agent: "PM", content: `${contextTitle ?? "HITL 항목"}에 대한 검토를 요청합니다. 추가 궁금한 내용을 말씀해 주세요.` };
  }
  if (contextType === "ticket") {
    if (input.includes("상태") || input.includes("요약")) return { agent: "PM", content: `${contextTitle ?? "티켓"} 현재 상태: 진행 중. 코드 리뷰 HITL 발행 후 완료 예정입니다.` };
    if (input.includes("의존") || input.includes("블로킹")) return { agent: "PM", content: "HITL 승인 대기 중인 하위 작업이 있습니다. 승인 후 자동 재개됩니다." };
    return { agent: "FE", content: `${contextTitle ?? "티켓"} 관련 추가 정보가 필요하시면 말씀해 주세요.` };
  }
  if (contextType === "epic") {
    if (input.includes("진행") || input.includes("현황")) return { agent: "PM", content: "에픽 진행률: 약 40% 완료. 5개 티켓 중 2개 완료, 2개 진행 중입니다." };
    if (input.includes("예산")) return { agent: "BM", content: "현재 에픽 예산 소진율: 62%. 남은 작업 대비 예산은 충분합니다." };
    return { agent: "PM", content: "에픽 전반에 대해 추가로 알고 싶은 내용을 말씀해 주세요." };
  }
  if (input.includes("hitl") || input.includes("대기")) return { agent: "PM", content: "현재 HITL 대기: 3건 (코드 리뷰, 보안 승인, 디자인 검토). 보안 승인이 가장 우선입니다." };
  if (input.includes("에이전트") || input.includes("현황")) return { agent: "PM", content: "활성 에이전트: FE, BE, Dsn, GM, PM (5개). 대기: SM, Pln, BM, HR." };
  return { agent: "PM", content: "안녕하세요! 티켓·HITL·에이전트 현황 등을 물어보세요. **/** 를 입력하면 커맨드 목록을 볼 수 있습니다." };
}

// ─── 마크다운 렌더러 ───
function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
          return <p key={i} className="font-semibold text-[var(--wiring-text-primary)]">{line.slice(2, -2)}</p>;
        }
        // Bold inline
        const boldParts = line.split(/(\*\*[^*]+\*\*)/);
        const hasInlineBold = boldParts.length > 1;

        if (line.startsWith("  - ") || line.startsWith("- ")) {
          const text = line.replace(/^(\s+)?- /, "");
          const textParts = text.split(/(\*\*[^*]+\*\*)/);
          return (
            <div key={i} className="flex gap-1.5 ml-2">
              <span className="text-[var(--wiring-text-tertiary)] shrink-0 mt-0.5">·</span>
              <p>{textParts.map((p, j) =>
                p.startsWith("**") && p.endsWith("**")
                  ? <strong key={j} className="font-semibold text-[var(--wiring-accent)]">{p.slice(2, -2)}</strong>
                  : <span key={j}>{p}</span>
              )}</p>
            </div>
          );
        }
        if (line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.")) {
          return <p key={i} className="ml-2">{line}</p>;
        }
        if (line === "") return <div key={i} className="h-1.5" />;
        return (
          <p key={i}>{hasInlineBold ? boldParts.map((p, j) =>
            p.startsWith("**") && p.endsWith("**")
              ? <strong key={j} className="font-semibold text-[var(--wiring-accent)]">{p.slice(2, -2)}</strong>
              : <span key={j}>{p}</span>
          ) : line}</p>
        );
      })}
    </div>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

// ─── 메시지 카드 ───
function MessageCard({ msg }: { msg: any }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(msg.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className={`flex gap-2 group ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
      {msg.role !== "user" && (
        <Avatar className="w-6 h-6 shrink-0 mt-0.5">
          <AvatarFallback className="text-[9px] font-bold text-white" style={{ backgroundColor: msg.agent ? (AGENT_COLORS[msg.agent as keyof typeof AGENT_COLORS] ?? "#5C5C6F") : "#5C5C6F" }}>
            {msg.agent ?? "SYS"}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="flex-1 min-w-0">
        {msg.role === "agent" && msg.agent && (
          <div className="flex items-center gap-2 mb-0.5 ml-0.5">
            <p className="text-[10px] text-[var(--wiring-text-tertiary)]">{msg.agent} · {formatTime(msg.timestamp)}</p>
            <button onClick={copy} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-text-secondary)]">
              {copied ? <Check className="w-3 h-3 text-[var(--wiring-success)]" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        )}
        <div className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
          msg.role === "user"
            ? "bg-[var(--wiring-accent)] text-white ml-auto max-w-[85%] inline-block"
            : msg.role === "system"
            ? "bg-[var(--wiring-glass-bg)] text-[var(--wiring-text-tertiary)] border border-[var(--wiring-glass-border)]"
            : "bg-[var(--wiring-bg-tertiary)] text-[var(--wiring-text-primary)]"
        }`}>
          {msg.role === "agent" ? <MarkdownContent content={msg.content} /> : <p className="whitespace-pre-wrap">{msg.content}</p>}
        </div>
        {msg.role === "user" && (
          <p className="text-[10px] text-[var(--wiring-text-tertiary)] mt-0.5 text-right">{formatTime(msg.timestamp)}</p>
        )}
      </div>
    </div>
  );
}

export function ChatPanel() {
  const { chatPanelOpen, setChatPanelOpen, chatPanelWidth } = useLayoutStore();
  const { currentContext, histories, addMessage } = useChatStore();
  const { queueItems } = useHITLStore();
  const [input, setInput] = useState("");
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashFilter, setSlashFilter] = useState("");
  const [selectedSlash, setSelectedSlash] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const contextId = currentContext?.id ?? "general";
  const contextType = currentContext?.type ?? "general";
  const messages = histories[contextId] ?? [];
  const quickQuestions = QUICK_QUESTIONS[contextType] ?? QUICK_QUESTIONS.general;
  const hitlWaiting = queueItems.filter((i) => i.status === "waiting").length;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredSlash = useMemo(() =>
    SLASH_COMMANDS.filter((c) => c.cmd.includes(slashFilter.toLowerCase())),
    [slashFilter]
  );

  if (!chatPanelOpen) return null;

  const handleInputChange = (val: string) => {
    setInput(val);
    if (val.startsWith("/") && !val.includes(" ")) {
      setShowSlashMenu(true);
      setSlashFilter(val.slice(1));
      setSelectedSlash(0);
    } else {
      setShowSlashMenu(false);
    }
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setShowSlashMenu(false);
    addMessage(contextId, { id: `u-${Date.now()}`, role: "user", content: text.trim(), timestamp: new Date().toISOString() });
    setInput("");

    setTimeout(() => {
      let response: { agent: string; content: string };
      if (text.trim().startsWith("/")) {
        const r = handleSlashCommand(text.trim(), hitlWaiting);
        response = r ?? generateAgentResponse(text, contextType, currentContext?.title);
      } else {
        response = generateAgentResponse(text, contextType, currentContext?.title);
      }
      addMessage(contextId, { id: `a-${Date.now()}`, role: "agent", agent: response.agent, content: response.content, timestamp: new Date().toISOString() });
    }, 500);
  };

  const selectSlashCommand = (cmd: string) => {
    setInput(cmd + " ");
    setShowSlashMenu(false);
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
              {currentContext.type === "ticket" ? "티켓" : currentContext.type === "hitl" ? "HITL" : currentContext.type === "epic" ? "에픽" : "일반"} · {currentContext.title}
            </p>
          ) : (
            <p className="text-[10px] text-[var(--wiring-text-tertiary)] mt-0.5">일반 대화 · / 로 커맨드 사용</p>
          )}
        </div>
        <button onClick={() => setChatPanelOpen(false)} className="p-1.5 rounded-lg text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] transition-colors shrink-0">
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
              <p className="text-xs text-[var(--wiring-text-tertiary)] mt-1">{currentContext ? `${currentContext.title} 관련 질문` : "/ 를 입력해 커맨드를 사용해 보세요"}</p>
            </div>
          )}
          {messages.map((msg) => <MessageCard key={msg.id} msg={msg} />)}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* 빠른 질문 */}
      {messages.length === 0 && (
        <div className="px-4 pb-2">
          <div className="flex flex-col gap-1.5">
            {quickQuestions.map((q) => (
              <button key={q} onClick={() => sendMessage(q)} className="text-left text-xs px-3 py-2 rounded-lg border border-[var(--wiring-glass-border)] text-[var(--wiring-text-secondary)] hover:border-[var(--wiring-accent)] hover:text-[var(--wiring-text-primary)] hover:bg-[var(--wiring-accent-glow)] transition-all">
                {q.startsWith("/") ? <span className="text-[var(--wiring-accent)]">{q}</span> : q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-[var(--wiring-glass-border)] shrink-0 relative">
        {/* Slash command dropdown */}
        <AnimatePresence>
          {showSlashMenu && filteredSlash.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.12 }}
              className="absolute bottom-full left-4 right-4 mb-2 rounded-xl overflow-hidden border border-[var(--wiring-glass-border)] shadow-2xl"
              style={{ backgroundColor: "var(--wiring-bg-secondary)" }}
            >
              {filteredSlash.map((c, i) => (
                <button
                  key={c.cmd}
                  onClick={() => selectSlashCommand(c.cmd)}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors ${i === selectedSlash ? "bg-[var(--wiring-accent-glow)]" : "hover:bg-[var(--wiring-glass-hover)]"}`}
                >
                  <span className="text-xs font-mono font-semibold text-[var(--wiring-accent)] shrink-0 mt-0.5">{c.cmd}</span>
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--wiring-text-secondary)]">{c.desc}</p>
                    {c.example && <p className="text-[10px] text-[var(--wiring-text-tertiary)]">{c.example}</p>}
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (showSlashMenu && e.key === "ArrowDown") { e.preventDefault(); setSelectedSlash((s) => Math.min(s + 1, filteredSlash.length - 1)); return; }
              if (showSlashMenu && e.key === "ArrowUp") { e.preventDefault(); setSelectedSlash((s) => Math.max(s - 1, 0)); return; }
              if (showSlashMenu && e.key === "Enter") { e.preventDefault(); if (filteredSlash[selectedSlash]) selectSlashCommand(filteredSlash[selectedSlash].cmd); return; }
              if (showSlashMenu && e.key === "Escape") { setShowSlashMenu(false); return; }
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
            }}
            placeholder="메시지 또는 /커맨드..."
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
