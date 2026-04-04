"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { getProjectsForTeam, getAllTicketsForProject } from "@/dummy/projects";
import { DUMMY_DOCUMENTS } from "@/dummy/documents";
import { DUMMY_AGENTS } from "@/dummy/agents";
import { useHITLStore } from "@/stores/hitl-store";
import type { HITLQueueItem } from "@/types/hitl";
import {
  Search, FileText, Folder, Ticket, Bot, AlertTriangle, X, ArrowRight,
  Zap, BarChart3, BookOpen, Activity, User, Home, Settings, ExternalLink,
  Plus, Hash, AtSign, ChevronRight,
} from "lucide-react";

// ─── Types ───
interface PaletteItem {
  id: string;
  type: "action" | "project" | "ticket" | "hitl" | "agent" | "document" | "page" | "recent";
  title: string;
  subtitle?: string;
  href?: string;
  onSelect?: () => void;
  color?: string;
  icon: React.ReactNode;
  group: string;
}

// ─── Fuzzy score ───
function score(text: string, query: string): number {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t === q) return 3;
  if (t.startsWith(q)) return 2;
  if (t.includes(q)) return 1;
  return 0;
}

// ─── 빠른 액션 정의 ───
const QUICK_ACTIONS: Omit<PaletteItem, "onSelect">[] = [
  { id: "action-home",       type: "action", title: "홈으로 이동",         href: "/home",       icon: <Home className="w-3.5 h-3.5" />,        color: "var(--wiring-accent)", group: "빠른 이동" },
  { id: "action-analytics",  type: "action", title: "분석 대시보드",        href: "/analytics",  icon: <BarChart3 className="w-3.5 h-3.5" />,    color: "var(--wiring-info)",   group: "빠른 이동" },
  { id: "action-activity",   type: "action", title: "활동 로그",            href: "/activity",   icon: <Activity className="w-3.5 h-3.5" />,     color: "#10B981",              group: "빠른 이동" },
  { id: "action-agents",     type: "action", title: "에이전트 현황",        href: "/agents",     icon: <Bot className="w-3.5 h-3.5" />,          color: "#8B5CF6",              group: "빠른 이동" },
  { id: "action-docs",       type: "action", title: "문서 라이브러리",      href: "/docs",       icon: <BookOpen className="w-3.5 h-3.5" />,     color: "#3B82F6",              group: "빠른 이동" },
  { id: "action-external",   type: "action", title: "외주 업무",            href: "/external",   icon: <ExternalLink className="w-3.5 h-3.5" />, color: "#F59E0B",              group: "빠른 이동" },
  { id: "action-profile",    type: "action", title: "내 프로필",            href: "/profile",    icon: <User className="w-3.5 h-3.5" />,         color: "#EC4899",              group: "빠른 이동" },
  { id: "action-settings",   type: "action", title: "설정",                 href: "/settings",   icon: <Settings className="w-3.5 h-3.5" />,     color: "var(--wiring-text-secondary)", group: "빠른 이동" },
];

// ─── 최근 방문 기록 관리 (localStorage) ───
const RECENT_KEY = "wiring-recent-pages";
const MAX_RECENT = 5;

function getRecentPages(): { href: string; title: string }[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch { return []; }
}

export function recordRecentPage(href: string, title: string) {
  if (typeof window === "undefined") return;
  const existing = getRecentPages().filter((r) => r.href !== href);
  const updated = [{ href, title }, ...existing].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
}

// ─── 검색 결과 hook ───
function usePaletteResults(query: string, queueItems: HITLQueueItem[]): PaletteItem[] {
  return useMemo(() => {
    const q = query.trim();

    // > prefix → 페이지 이동 모드
    if (q.startsWith(">")) {
      const pageQ = q.slice(1).trim();
      if (!pageQ) return QUICK_ACTIONS.map((a) => ({ ...a }));
      return QUICK_ACTIONS
        .filter((a) => score(a.title, pageQ) > 0)
        .map((a) => ({ ...a }));
    }

    // # prefix → 티켓 전용 검색
    if (q.startsWith("#")) {
      const ticketQ = q.slice(1).trim();
      if (!ticketQ) return [];
      const results: PaletteItem[] = [];
      DUMMY_TEAMS.forEach((team) => {
        getProjectsForTeam(team.id).forEach((p) => {
          getAllTicketsForProject(p.id).forEach((t) => {
            if (score(t.title, ticketQ) > 0 || score(t.id, ticketQ) > 0) {
              results.push({
                id: `ticket-${t.id}`, type: "ticket",
                title: t.title, subtitle: `${p.name} · ${t.id}`,
                href: `/team/${team.id}/project/${p.id}`,
                color: team.color, icon: <Ticket className="w-3.5 h-3.5" />, group: "티켓",
              });
            }
          });
        });
      });
      return results.slice(0, 8);
    }

    // @ prefix → 에이전트 전용 검색
    if (q.startsWith("@")) {
      const agentQ = q.slice(1).trim();
      if (!agentQ) {
        return (DUMMY_AGENTS as any[]).map((a) => ({
          id: `agent-${a.id}`, type: "agent" as const,
          title: a.name ?? a.id, subtitle: a.role,
          href: "/agents", color: a.color,
          icon: <Bot className="w-3.5 h-3.5" />, group: "에이전트",
        }));
      }
      return (DUMMY_AGENTS as any[])
        .filter((a) => score(a.name ?? a.id, agentQ) > 0 || score(a.role ?? "", agentQ) > 0)
        .map((a) => ({
          id: `agent-${a.id}`, type: "agent" as const,
          title: a.name ?? a.id, subtitle: a.role,
          href: "/agents", color: a.color,
          icon: <Bot className="w-3.5 h-3.5" />, group: "에이전트",
        }));
    }

    // 빈 쿼리 → 빠른 액션 + 최근 방문
    if (!q) {
      const recent = getRecentPages().map((r) => ({
        id: `recent-${r.href}`, type: "recent" as const,
        title: r.title, subtitle: r.href,
        href: r.href, color: "var(--wiring-text-tertiary)",
        icon: <ChevronRight className="w-3.5 h-3.5" />, group: "최근 방문",
      }));
      return [...recent, ...QUICK_ACTIONS.slice(0, 5).map((a) => ({ ...a }))];
    }

    // 일반 검색
    const results: (PaletteItem & { _score: number })[] = [];

    DUMMY_TEAMS.forEach((team) => {
      getProjectsForTeam(team.id).forEach((p) => {
        const s = score(p.name, q);
        if (s > 0) results.push({ id: `project-${p.id}`, type: "project", title: p.name, subtitle: team.name, href: `/team/${team.id}/project/${p.id}`, color: team.color, icon: <Folder className="w-3.5 h-3.5" />, group: "프로젝트", _score: s + 0.1 });
      });
    });

    DUMMY_TEAMS.forEach((team) => {
      getProjectsForTeam(team.id).forEach((p) => {
        getAllTicketsForProject(p.id).forEach((t) => {
          const s = Math.max(score(t.title, q), score(t.id, q));
          if (s > 0) results.push({ id: `ticket-${t.id}`, type: "ticket", title: t.title, subtitle: `${p.name} · ${t.id}`, href: `/team/${team.id}/project/${p.id}`, color: team.color, icon: <Ticket className="w-3.5 h-3.5" />, group: "티켓", _score: s });
        });
      });
    });

    queueItems.forEach((h) => {
      const typeLabel = h.type.replace(/_/g, " ");
      const s = Math.max(score(typeLabel, q), score(h.id, q));
      if (s > 0) results.push({ id: `hitl-${h.id}`, type: "hitl", title: `HITL: ${typeLabel}`, subtitle: `상태: ${h.status}`, href: `/hitl/${h.id}`, color: "var(--hitl-waiting)", icon: <AlertTriangle className="w-3.5 h-3.5" />, group: "HITL", _score: s });
    });

    (DUMMY_AGENTS as any[]).forEach((a) => {
      const label = a.name ?? a.id;
      const s = Math.max(score(label, q), score(a.role ?? "", q));
      if (s > 0) results.push({ id: `agent-${a.id}`, type: "agent", title: label, subtitle: `Agent · ${a.role ?? ""}`, href: "/agents", color: a.color ?? "#8B5CF6", icon: <Bot className="w-3.5 h-3.5" />, group: "에이전트", _score: s });
    });

    DUMMY_DOCUMENTS.forEach((d) => {
      const s = Math.max(score(d.title, q), d.tags.reduce((m, t) => Math.max(m, score(t, q)), 0));
      if (s > 0) results.push({ id: `doc-${d.id}`, type: "document", title: d.title, subtitle: `문서 · ${d.type}`, href: `/docs/${d.id}`, color: "#3B82F6", icon: <FileText className="w-3.5 h-3.5" />, group: "문서", _score: s });
    });

    // 빠른 액션도 검색
    QUICK_ACTIONS.forEach((a) => {
      if (score(a.title, q) > 0) results.push({ ...a, _score: 0.5 });
    });

    return results.sort((a, b) => b._score - a._score).slice(0, 14).map(({ _score, ...r }) => r);
  }, [query, queueItems]);
}

// ─── Prefix 힌트 컴포넌트 ───
function PrefixHints({ onPrefix }: { onPrefix: (p: string) => void }) {
  const hints = [
    { prefix: ">", icon: <Zap className="w-3 h-3" />, label: "페이지 이동" },
    { prefix: "#", icon: <Hash className="w-3 h-3" />, label: "티켓 검색" },
    { prefix: "@", icon: <AtSign className="w-3 h-3" />, label: "에이전트 검색" },
  ];
  return (
    <div className="px-4 py-3 border-b border-[var(--wiring-glass-border)]">
      <p className="text-[10px] text-[var(--wiring-text-tertiary)] mb-2">검색 모드</p>
      <div className="flex gap-2">
        {hints.map((h) => (
          <button
            key={h.prefix}
            onClick={() => onPrefix(h.prefix)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--wiring-glass-border)] hover:border-[var(--wiring-accent)] hover:bg-[var(--wiring-accent-glow)] transition-all text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-accent)]"
          >
            {h.icon}
            <span className="text-[10px] font-mono font-bold">{h.prefix}</span>
            <span className="text-[10px]">{h.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main CommandPalette ───
export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { queueItems } = useHITLStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const results = usePaletteResults(query, queueItems);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => { setSelectedIdx(0); }, [query]);

  const handleSelect = useCallback((item: PaletteItem) => {
    if (item.onSelect) { item.onSelect(); }
    else if (item.href) {
      recordRecentPage(item.href, item.title);
      router.push(item.href);
    }
    onClose();
  }, [router, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { if (results[selectedIdx]) handleSelect(results[selectedIdx]); }
    else if (e.key === "Escape") { onClose(); }
  };

  // 그룹화
  const grouped = useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    results.forEach((r) => {
      if (!map.has(r.group)) map.set(r.group, []);
      map.get(r.group)!.push(r);
    });
    return map;
  }, [results]);

  const flatResults = useMemo(() => Array.from(grouped.values()).flat(), [grouped]);

  // 현재 prefix 감지
  const prefix = query.startsWith(">") ? ">" : query.startsWith("#") ? "#" : query.startsWith("@") ? "@" : null;
  const prefixLabels: Record<string, string> = { ">": "페이지 이동", "#": "티켓 검색", "@": "에이전트 검색" };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[15%] -translate-x-1/2 z-50 w-full max-w-xl"
          >
            <div
              className="rounded-2xl overflow-hidden border border-[var(--wiring-glass-border)]"
              style={{ backgroundColor: "var(--wiring-bg-secondary)", boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                {prefix ? (
                  <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--wiring-accent-glow)] text-[var(--wiring-accent)] shrink-0">{prefix}</span>
                ) : (
                  <Search className="w-4 h-4 text-[var(--wiring-text-tertiary)] shrink-0" />
                )}
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={prefix ? prefixLabels[prefix] + " 모드" : "검색 또는 > # @ 로 모드 전환..."}
                  className="flex-1 bg-transparent text-sm text-[var(--wiring-text-primary)] placeholder-[var(--wiring-text-tertiary)] outline-none"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-text-secondary)]">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <kbd className="text-[10px] text-[var(--wiring-text-tertiary)] px-1.5 py-0.5 rounded border border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-tertiary)] shrink-0">ESC</kbd>
              </div>

              {/* Prefix hints (빈 쿼리일 때만) */}
              {!query && <PrefixHints onPrefix={(p) => { setQuery(p); inputRef.current?.focus(); }} />}

              {/* Results */}
              <div className="max-h-80 overflow-y-auto">
                {results.length === 0 && query ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs text-[var(--wiring-text-tertiary)]">"{query}"에 대한 결과가 없습니다</p>
                  </div>
                ) : (
                  <div className="py-1">
                    {Array.from(grouped.entries()).map(([groupLabel, groupResults]) => (
                      <div key={groupLabel}>
                        <p className="px-4 py-1.5 text-[10px] uppercase text-[var(--wiring-text-tertiary)] font-medium tracking-wider">
                          {groupLabel}
                        </p>
                        {groupResults.map((item) => {
                          const flatIdx = flatResults.indexOf(item);
                          const isSelected = flatIdx === selectedIdx;
                          return (
                            <button
                              key={item.id}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isSelected ? "bg-[var(--wiring-accent-glow)]" : "hover:bg-[var(--wiring-glass-hover)]"}`}
                              onClick={() => handleSelect(item)}
                              onMouseEnter={() => setSelectedIdx(flatIdx)}
                            >
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${item.color ?? "#888"}18`, color: item.color ?? "#888" }}
                              >
                                {item.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-[var(--wiring-text-primary)] truncate">{item.title}</p>
                                {item.subtitle && <p className="text-xs text-[var(--wiring-text-tertiary)] truncate">{item.subtitle}</p>}
                              </div>
                              {isSelected && <ArrowRight className="w-3.5 h-3.5 text-[var(--wiring-accent)] shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-[var(--wiring-glass-border)] flex items-center gap-3 flex-wrap">
                {[["↑↓", "탐색"], ["Enter", "이동"], ["ESC", "닫기"]].map(([key, label]) => (
                  <div key={key} className="flex items-center gap-1.5 text-[10px] text-[var(--wiring-text-tertiary)]">
                    <kbd className="px-1 py-0.5 rounded border border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-tertiary)]">{key}</kbd>
                    <span>{label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 ml-auto text-[10px] text-[var(--wiring-text-tertiary)]">
                  <span className="font-mono">{">"}</span><span>이동</span>
                  <span className="font-mono ml-2">#</span><span>티켓</span>
                  <span className="font-mono ml-2">@</span><span>에이전트</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
