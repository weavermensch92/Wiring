"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { getProjectsForTeam, DUMMY_EPICS, DUMMY_TICKETS, getAllTicketsForProject } from "@/dummy/projects";
import { DUMMY_DOCUMENTS } from "@/dummy/documents";
import { DUMMY_AGENTS } from "@/dummy/agents";
import { useHITLStore } from "@/stores/hitl-store";
import { Search, FileText, Folder, Ticket, Bot, AlertTriangle, X, ArrowRight } from "lucide-react";

// ─── Types ───
interface SearchResult {
  id: string;
  type: "project" | "ticket" | "hitl" | "agent" | "document";
  title: string;
  subtitle?: string;
  href: string;
  color?: string;
  icon: React.ReactNode;
}

// ─── Score helper ───
function score(text: string, query: string): number {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t === q) return 3;
  if (t.startsWith(q)) return 2;
  if (t.includes(q)) return 1;
  return 0;
}

function useSearchResults(query: string): SearchResult[] {
  const { queueItems } = useHITLStore();

  return useMemo(() => {
    if (query.trim().length < 1) return [];
    const q = query.trim();
    const results: (SearchResult & { _score: number })[] = [];

    // Projects
    DUMMY_TEAMS.forEach((team) => {
      getProjectsForTeam(team.id).forEach((p) => {
        const s = score(p.name, q);
        if (s > 0) {
          results.push({
            id: `project-${p.id}`,
            type: "project",
            title: p.name,
            subtitle: team.name,
            href: `/team/${team.id}/project/${p.id}`,
            color: team.color,
            icon: <Folder className="w-3.5 h-3.5" />,
            _score: s + 0.1,
          });
        }
      });
    });

    // Tickets
    DUMMY_TEAMS.forEach((team) => {
      getProjectsForTeam(team.id).forEach((p) => {
        getAllTicketsForProject(p.id).forEach((t) => {
          const s = Math.max(score(t.title, q), score(t.id, q));
          if (s > 0) {
            results.push({
              id: `ticket-${t.id}`,
              type: "ticket",
              title: t.title,
              subtitle: `${p.name} · ${t.id}`,
              href: `/team/${team.id}/project/${p.id}`,
              color: team.color,
              icon: <Ticket className="w-3.5 h-3.5" />,
              _score: s,
            });
          }
        });
      });
    });

    // HITL
    queueItems.forEach((h) => {
      const typeLabel = h.type.replace(/_/g, " ");
      const s = Math.max(score(typeLabel, q), score(h.id, q));
      if (s > 0) {
        results.push({
          id: `hitl-${h.id}`,
          type: "hitl",
          title: `HITL: ${typeLabel}`,
          subtitle: `상태: ${h.status}`,
          href: `/hitl/${h.id}`,
          color: "var(--hitl-waiting)",
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          _score: s,
        });
      }
    });

    // Agents
    (DUMMY_AGENTS as { id: string; role: string; name?: string }[]).forEach((a) => {
      const label = a.name ?? a.role;
      const s = Math.max(score(label, q), score(a.role ?? "", q));
      if (s > 0) {
        results.push({
          id: `agent-${a.id}`,
          type: "agent",
          title: label,
          subtitle: `Agent · ${a.role ?? ""}`,
          href: "/agents",
          color: "#8B5CF6",
          icon: <Bot className="w-3.5 h-3.5" />,
          _score: s,
        });
      }
    });

    // Documents
    DUMMY_DOCUMENTS.forEach((d) => {
      const s = Math.max(
        score(d.title, q),
        d.tags.reduce((m, t) => Math.max(m, score(t, q)), 0)
      );
      if (s > 0) {
        results.push({
          id: `doc-${d.id}`,
          type: "document",
          title: d.title,
          subtitle: `문서 · ${d.type}`,
          href: `/docs/${d.id}`,
          color: "#3B82F6",
          icon: <FileText className="w-3.5 h-3.5" />,
          _score: s,
        });
      }
    });

    return results
      .sort((a, b) => b._score - a._score)
      .slice(0, 12)
      .map(({ _score, ...r }) => r);
  }, [query, queueItems]);
}

const TYPE_LABELS: Record<SearchResult["type"], string> = {
  project: "프로젝트",
  ticket: "티켓",
  hitl: "HITL",
  agent: "에이전트",
  document: "문서",
};

// ─── Global Search Modal ───
export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const results = useSearchResults(query);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    router.push(result.href);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (results[selectedIdx]) handleSelect(results[selectedIdx]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  // Group results by type
  const grouped = useMemo(() => {
    const map = new Map<string, SearchResult[]>();
    results.forEach((r) => {
      const key = TYPE_LABELS[r.type];
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return map;
  }, [results]);

  // flat index → result
  const flatResults = useMemo(() => {
    return Array.from(grouped.values()).flat();
  }, [grouped]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] -translate-x-1/2 z-50 w-full max-w-lg"
          >
            <div
              className="rounded-xl overflow-hidden border border-[var(--wiring-glass-border)]"
              style={{ backgroundColor: "var(--wiring-bg-secondary)", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--wiring-glass-border)]">
                <Search className="w-4 h-4 text-[var(--wiring-text-tertiary)] shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="프로젝트, 티켓, 에이전트, 문서 검색..."
                  className="flex-1 bg-transparent text-sm text-[var(--wiring-text-primary)] placeholder-[var(--wiring-text-tertiary)] outline-none"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-text-secondary)]">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <kbd className="text-[10px] text-[var(--wiring-text-tertiary)] px-1.5 py-0.5 rounded border border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-tertiary)]">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto">
                {query.trim().length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs text-[var(--wiring-text-tertiary)]">검색어를 입력하세요</p>
                    <p className="text-[10px] text-[var(--wiring-text-tertiary)] mt-1">프로젝트, 티켓, 에이전트, 문서를 검색할 수 있습니다</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs text-[var(--wiring-text-tertiary)]">"{query}"에 대한 결과가 없습니다</p>
                  </div>
                ) : (
                  <div className="py-1">
                    {Array.from(grouped.entries()).map(([groupLabel, groupResults]) => {
                      return (
                        <div key={groupLabel}>
                          <p className="px-4 py-1.5 text-[10px] uppercase text-[var(--wiring-text-tertiary)] font-medium tracking-wider">
                            {groupLabel}
                          </p>
                          {groupResults.map((result) => {
                            const flatIdx = flatResults.indexOf(result);
                            const isSelected = flatIdx === selectedIdx;
                            return (
                              <button
                                key={result.id}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                  isSelected
                                    ? "bg-[var(--wiring-accent-glow)]"
                                    : "hover:bg-[var(--wiring-glass-hover)]"
                                }`}
                                onClick={() => handleSelect(result)}
                                onMouseEnter={() => setSelectedIdx(flatIdx)}
                              >
                                <div
                                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: `${result.color ?? "#888"}20`, color: result.color ?? "#888" }}
                                >
                                  {result.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-[var(--wiring-text-primary)] truncate">{result.title}</p>
                                  {result.subtitle && (
                                    <p className="text-xs text-[var(--wiring-text-tertiary)] truncate">{result.subtitle}</p>
                                  )}
                                </div>
                                {isSelected && (
                                  <ArrowRight className="w-3.5 h-3.5 text-[var(--wiring-accent)] shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-[var(--wiring-glass-border)] flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--wiring-text-tertiary)]">
                  <kbd className="px-1 py-0.5 rounded border border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-tertiary)]">↑↓</kbd>
                  <span>탐색</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--wiring-text-tertiary)]">
                  <kbd className="px-1 py-0.5 rounded border border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-tertiary)]">Enter</kbd>
                  <span>이동</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--wiring-text-tertiary)]">
                  <kbd className="px-1 py-0.5 rounded border border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-tertiary)]">ESC</kbd>
                  <span>닫기</span>
                </div>
                <span className="ml-auto text-[10px] text-[var(--wiring-text-tertiary)]">{results.length}개 결과</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
