"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DUMMY_DOCUMENTS } from "@/dummy/documents";
import { WiringDocument, DocumentType, DocumentStatus } from "@/types/document";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { AGENT_COLORS } from "@/lib/constants";
import {
  FileText, BookOpen, Search, Plus, Clock, Eye,
  FileCode, Palette, Users, BarChart3, Cpu, ChevronRight,
  Bot, User, Tag, Filter,
} from "lucide-react";

// ─── 유틸 ───
function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getDate().toString().padStart(2, "0")}`;
}

const TYPE_CONFIG: Record<DocumentType, { label: string; icon: React.ReactNode; color: string }> = {
  spec:      { label: "기술 스펙",    icon: <FileCode className="w-3.5 h-3.5" />,  color: "#3B82F6" },
  design:    { label: "디자인",       icon: <Palette className="w-3.5 h-3.5" />,   color: "#EC4899" },
  meeting:   { label: "회의록",       icon: <Users className="w-3.5 h-3.5" />,     color: "#10B981" },
  technical: { label: "기술 문서",    icon: <Cpu className="w-3.5 h-3.5" />,       color: "#8B5CF6" },
  runbook:   { label: "런북",         icon: <BookOpen className="w-3.5 h-3.5" />,  color: "#F59E0B" },
  report:    { label: "리포트",       icon: <BarChart3 className="w-3.5 h-3.5" />, color: "#EF4444" },
};

const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string }> = {
  draft:     { label: "초안", color: "var(--wiring-warning)" },
  published: { label: "발행됨", color: "var(--wiring-success)" },
  archived:  { label: "보관됨", color: "var(--wiring-text-tertiary)" },
};

const AGENT_LABELS: Record<string, string> = {
  "agent-pm": "PM", "agent-gm": "GM", "agent-sm": "SM",
  "agent-dsn": "Dsn", "agent-pln": "Pln", "agent-fe": "FE",
  "agent-be": "BE", "agent-bm": "BM", "agent-hr": "HR",
};

function DocCard({ doc, onClick }: { doc: WiringDocument; onClick: () => void }) {
  const typeCfg = TYPE_CONFIG[doc.type];
  const statusCfg = STATUS_CONFIG[doc.status];
  const team = DUMMY_TEAMS.find((t) => t.id === doc.teamId);
  const authorLabel = doc.authorType === "agent"
    ? (AGENT_LABELS[doc.authorId] ?? doc.authorId)
    : "Human";
  const authorColor = doc.authorType === "agent"
    ? (AGENT_COLORS[AGENT_LABELS[doc.authorId] as keyof typeof AGENT_COLORS] ?? "#888")
    : "var(--wiring-info)";

  // Extract first paragraph as preview
  const preview = doc.content.replace(/^#.*$/m, "").replace(/[#*`\[\]]/g, "").trim().slice(0, 120);

  return (
    <button
      onClick={onClick}
      className="w-full text-left glass-panel p-4 hover:border-[var(--wiring-accent)] transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-start gap-2.5 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: `${typeCfg.color}18`, color: typeCfg.color }}
          >
            {typeCfg.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--wiring-text-primary)] group-hover:text-[var(--wiring-accent)] transition-colors truncate">
              {doc.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs" style={{ color: typeCfg.color }}>{typeCfg.label}</span>
              {team && (
                <>
                  <span className="text-[var(--wiring-text-tertiary)] text-xs">·</span>
                  <span className="text-xs" style={{ color: team.color }}>{team.name}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <span className="text-xs px-1.5 py-0.5 rounded shrink-0" style={{ color: statusCfg.color, backgroundColor: `${statusCfg.color}18` }}>
          {statusCfg.label}
        </span>
      </div>

      {/* Preview */}
      <p className="text-xs text-[var(--wiring-text-secondary)] line-clamp-2 mb-3 pl-9">
        {preview}...
      </p>

      {/* Tags */}
      {doc.tags.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3 pl-9 flex-wrap">
          {doc.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-[var(--wiring-text-tertiary)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pl-9">
        <div className="flex items-center gap-2">
          <Avatar className="w-4 h-4">
            <AvatarFallback className="text-[9px] font-bold text-white" style={{ backgroundColor: authorColor }}>
              {doc.authorType === "agent" ? authorLabel[0] : "H"}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-[var(--wiring-text-tertiary)]">{authorLabel}</span>
          <span className="text-[var(--wiring-text-tertiary)] text-xs">·</span>
          <Clock className="w-3 h-3 text-[var(--wiring-text-tertiary)]" />
          <span className="text-xs text-[var(--wiring-text-tertiary)]">{formatDate(doc.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-1 text-[var(--wiring-text-tertiary)]">
          <Eye className="w-3 h-3" />
          <span className="text-xs">{doc.viewCount}</span>
        </div>
      </div>
    </button>
  );
}

type FilterType = "all" | DocumentType;
type FilterStatus = "all" | DocumentStatus;

export default function DocsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const filtered = useMemo(() => {
    return DUMMY_DOCUMENTS.filter((d) => {
      if (filterType !== "all" && d.type !== filterType) return false;
      if (filterStatus !== "all" && d.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          d.title.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [search, filterType, filterStatus]);

  const totalPublished = DUMMY_DOCUMENTS.filter((d) => d.status === "published").length;
  const totalDraft = DUMMY_DOCUMENTS.filter((d) => d.status === "draft").length;
  const totalViews = DUMMY_DOCUMENTS.reduce((sum, d) => sum + d.viewCount, 0);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-[var(--wiring-accent)]" />
              <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)]">문서</h1>
            </div>
            <button
              onClick={() => router.push("/docs/new")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
              style={{ backgroundColor: "var(--wiring-accent)" }}
            >
              <Plus className="w-3.5 h-3.5" />
              새 문서
            </button>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "전체 문서", value: DUMMY_DOCUMENTS.length, icon: <FileText className="w-4 h-4" />, color: "var(--wiring-accent)" },
              { label: "발행됨", value: totalPublished, icon: <BookOpen className="w-4 h-4" />, color: "var(--wiring-success)" },
              { label: "총 조회수", value: totalViews, icon: <Eye className="w-4 h-4" />, color: "var(--wiring-info)" },
            ].map((kpi) => (
              <div key={kpi.label} className="glass-panel p-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${kpi.color}18`, color: kpi.color }}>
                  {kpi.icon}
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--wiring-text-primary)]">{kpi.value}</p>
                  <p className="text-xs text-[var(--wiring-text-tertiary)]">{kpi.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--wiring-text-tertiary)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="제목, 태그 검색..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-[var(--wiring-text-primary)] placeholder-[var(--wiring-text-tertiary)] outline-none focus:border-[var(--wiring-accent)]"
              />
            </div>
            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-[var(--wiring-text-secondary)] outline-none focus:border-[var(--wiring-accent)]"
            >
              <option value="all">전체 유형</option>
              {(Object.keys(TYPE_CONFIG) as DocumentType[]).map((t) => (
                <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>
              ))}
            </select>
            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-[var(--wiring-text-secondary)] outline-none focus:border-[var(--wiring-accent)]"
            >
              <option value="all">전체 상태</option>
              {(Object.keys(STATUS_CONFIG) as DocumentStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>

          {/* Result count */}
          <p className="text-xs text-[var(--wiring-text-tertiary)]">
            {filtered.length}개 문서
          </p>

          {/* Document List */}
          <div className="grid gap-3">
            {filtered.length === 0 ? (
              <div className="glass-panel p-8 flex flex-col items-center gap-2 text-center">
                <FileText className="w-8 h-8 text-[var(--wiring-text-tertiary)]" />
                <p className="text-sm text-[var(--wiring-text-tertiary)]">검색 결과가 없습니다</p>
              </div>
            ) : (
              filtered.map((doc) => (
                <DocCard key={doc.id} doc={doc} onClick={() => router.push(`/docs/${doc.id}`)} />
              ))
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
