"use client";

import { use, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DUMMY_DOCUMENTS } from "@/dummy/documents";
import { WiringDocument, DocumentType, DocumentStatus } from "@/types/document";
import { DUMMY_TEAMS } from "@/dummy/teams";
import { AGENT_COLORS } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, Edit2, Eye, Save, Clock, BookOpen,
  FileCode, Palette, Users, BarChart3, Cpu, Tag,
  Bot, CheckCircle2, X, ExternalLink,
} from "lucide-react";

// ─── 간단한 마크다운 → HTML 변환기 ───
function markdownToHtml(md: string): string {
  return md
    // 코드 블록
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="md-code"><code>$2</code></pre>')
    // 인라인 코드
    .replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>')
    // H1
    .replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>')
    // H2
    .replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>')
    // H3
    .replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>')
    // 볼드
    .replace(/\*\*(.+?)\*\*/g, '<strong class="md-bold">$1</strong>')
    // 이탤릭
    .replace(/\*(.+?)\*/g, '<em class="md-em">$1</em>')
    // 테이블
    .replace(/^\|(.+)\|$/gm, (_, row) => {
      const cells = row.split("|").map((c: string) => c.trim());
      if (cells.every((c: string) => /^[-:]+$/.test(c))) return '<tr class="md-tr-divider"></tr>';
      return `<tr>${cells.map((c: string) => `<td class="md-td">${c}</td>`).join("")}</tr>`;
    })
    // 불릿 리스트
    .replace(/^- (.+)$/gm, '<li class="md-li">$1</li>')
    // 번호 리스트
    .replace(/^\d+\. (.+)$/gm, '<li class="md-li-num">$1</li>')
    // 링크
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a class="md-link" href="$2">$1</a>')
    // 구분선
    .replace(/^---$/gm, '<hr class="md-hr" />')
    // 줄바꿈 → <br>
    .replace(/\n\n/g, '</p><p class="md-p">')
    .replace(/\n/g, "<br/>");
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
  draft:     { label: "초안",   color: "var(--wiring-warning)" },
  published: { label: "발행됨", color: "var(--wiring-success)" },
  archived:  { label: "보관됨", color: "var(--wiring-text-tertiary)" },
};

const AGENT_LABELS: Record<string, string> = {
  "agent-pm": "PM", "agent-gm": "GM", "agent-sm": "SM",
  "agent-dsn": "Dsn", "agent-pln": "Pln", "agent-fe": "FE",
  "agent-be": "BE", "agent-bm": "BM", "agent-hr": "HR",
};

export default function DocDetailPage({ params }: { params: Promise<{ docId: string }> }) {
  const { docId } = use(params);
  const router = useRouter();

  const originalDoc = useMemo(
    () => DUMMY_DOCUMENTS.find((d) => d.id === docId) ?? null,
    [docId]
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(originalDoc?.content ?? "");
  const [editTitle, setEditTitle] = useState(originalDoc?.title ?? "");
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    // In a real app this would persist; here we just show a toast effect
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  if (!originalDoc) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-[var(--wiring-text-secondary)]">문서를 찾을 수 없습니다</p>
          <button onClick={() => router.back()} className="text-xs text-[var(--wiring-accent)]">← 돌아가기</button>
        </div>
      </div>
    );
  }

  const typeCfg = TYPE_CONFIG[originalDoc.type];
  const statusCfg = STATUS_CONFIG[originalDoc.status];
  const team = DUMMY_TEAMS.find((t) => t.id === originalDoc.teamId);
  const authorLabel = originalDoc.authorType === "agent"
    ? (AGENT_LABELS[originalDoc.authorId] ?? originalDoc.authorId)
    : "김CTO";
  const authorColor = originalDoc.authorType === "agent"
    ? (AGENT_COLORS[AGENT_LABELS[originalDoc.authorId] as keyof typeof AGENT_COLORS] ?? "#888")
    : "var(--wiring-info)";

  const htmlContent = useMemo(() => markdownToHtml(isEditing ? editContent : originalDoc.content), [isEditing, editContent, originalDoc.content]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="shrink-0 px-6 py-3 border-b border-[var(--wiring-glass-border)] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${typeCfg.color}20`, color: typeCfg.color }}
          >
            {typeCfg.icon}
          </div>
          <span className="text-xs text-[var(--wiring-text-tertiary)] shrink-0">{typeCfg.label}</span>
          {team && (
            <>
              <span className="text-[var(--wiring-text-tertiary)] text-xs shrink-0">/</span>
              <span className="text-xs shrink-0" style={{ color: team.color }}>{team.name}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {saved && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--wiring-success)] px-2 py-1 rounded-lg bg-[var(--wiring-success)]/10">
              <CheckCircle2 className="w-3.5 h-3.5" />
              저장됨
            </div>
          )}
          <span className="text-xs px-2 py-0.5 rounded" style={{ color: statusCfg.color, backgroundColor: `${statusCfg.color}18` }}>
            {statusCfg.label}
          </span>
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                취소
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                style={{ backgroundColor: "var(--wiring-accent)" }}
              >
                <Save className="w-3.5 h-3.5" />
                저장
              </button>
            </>
          ) : (
            <button
              onClick={() => { setEditContent(originalDoc.content); setEditTitle(originalDoc.title); setIsEditing(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--wiring-text-secondary)] hover:bg-[var(--wiring-glass-hover)] border border-[var(--wiring-glass-border)] transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              편집
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {isEditing ? (
          /* 편집 모드: split view */
          <div className="flex-1 flex overflow-hidden">
            {/* Editor */}
            <div className="flex-1 flex flex-col border-r border-[var(--wiring-glass-border)] overflow-hidden">
              <div className="px-4 py-2 border-b border-[var(--wiring-glass-border)] flex items-center gap-2">
                <Edit2 className="w-3.5 h-3.5 text-[var(--wiring-text-tertiary)]" />
                <span className="text-xs text-[var(--wiring-text-tertiary)]">마크다운 편집</span>
              </div>
              <div className="p-4 pb-0">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xl font-bold text-[var(--wiring-text-primary)] bg-transparent border-none outline-none mb-3 placeholder-[var(--wiring-text-tertiary)]"
                  placeholder="문서 제목..."
                />
              </div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 p-4 pt-0 text-xs font-mono text-[var(--wiring-text-secondary)] bg-transparent border-none outline-none resize-none leading-relaxed"
                placeholder="마크다운으로 작성하세요..."
              />
            </div>
            {/* Preview */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 py-2 border-b border-[var(--wiring-glass-border)] flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-[var(--wiring-text-tertiary)]" />
                <span className="text-xs text-[var(--wiring-text-tertiary)]">미리보기</span>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-[var(--wiring-text-primary)] mb-6">{editTitle}</h1>
                  <div
                    className="doc-content text-sm text-[var(--wiring-text-secondary)] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: `<p class="md-p">${htmlContent}</p>` }}
                  />
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          /* 읽기 모드 */
          <div className="flex-1 flex overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="p-8">
                {/* Title + meta */}
                <h1 className="text-2xl font-bold text-[var(--wiring-text-primary)] mb-4">{originalDoc.title}</h1>
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-[9px] font-bold text-white" style={{ backgroundColor: authorColor }}>
                        {originalDoc.authorType === "agent" ? authorLabel[0] : "H"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-[var(--wiring-text-secondary)]">{authorLabel}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--wiring-text-tertiary)]">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(originalDoc.updatedAt).toLocaleDateString("ko-KR")} 업데이트
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--wiring-text-tertiary)]">
                    <Eye className="w-3.5 h-3.5" />
                    {originalDoc.viewCount}회 조회
                  </div>
                  {originalDoc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-[var(--wiring-text-tertiary)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <hr className="border-[var(--wiring-glass-border)] mb-6" />
                {/* Rendered content */}
                <div
                  className="doc-content text-sm text-[var(--wiring-text-secondary)] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: `<p class="md-p">${htmlContent}</p>` }}
                />
              </div>
            </ScrollArea>
            {/* Side info */}
            <div className="w-56 shrink-0 border-l border-[var(--wiring-glass-border)] p-4 space-y-4">
              <div>
                <p className="text-xs text-[var(--wiring-text-tertiary)] mb-2">문서 정보</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--wiring-text-tertiary)]">유형</span>
                    <span className="text-xs font-medium" style={{ color: typeCfg.color }}>{typeCfg.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--wiring-text-tertiary)]">상태</span>
                    <span className="text-xs font-medium" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
                  </div>
                  {team && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--wiring-text-tertiary)]">팀</span>
                      <span className="text-xs font-medium" style={{ color: team.color }}>{team.name}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--wiring-text-tertiary)]">작성자</span>
                    <div className="flex items-center gap-1">
                      {originalDoc.authorType === "agent" ? (
                        <Bot className="w-3 h-3" style={{ color: authorColor }} />
                      ) : (
                        <Users className="w-3 h-3 text-[var(--wiring-info)]" />
                      )}
                      <span className="text-xs text-[var(--wiring-text-secondary)]">{authorLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
              <hr className="border-[var(--wiring-glass-border)]" />
              <div>
                <p className="text-xs text-[var(--wiring-text-tertiary)] mb-2">태그</p>
                <div className="flex flex-wrap gap-1">
                  {originalDoc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-[var(--wiring-text-tertiary)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <hr className="border-[var(--wiring-glass-border)]" />
              <div className="space-y-1.5">
                <p className="text-xs text-[var(--wiring-text-tertiary)] mb-2">날짜</p>
                <div className="flex justify-between">
                  <span className="text-xs text-[var(--wiring-text-tertiary)]">생성</span>
                  <span className="text-xs text-[var(--wiring-text-secondary)]">
                    {new Date(originalDoc.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-[var(--wiring-text-tertiary)]">수정</span>
                  <span className="text-xs text-[var(--wiring-text-secondary)]">
                    {new Date(originalDoc.updatedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* doc-content 스타일 */}
      <style>{`
        .doc-content .md-h1 { font-size: 1.4rem; font-weight: 700; color: var(--wiring-text-primary); margin: 1.5rem 0 0.75rem; }
        .doc-content .md-h2 { font-size: 1.1rem; font-weight: 600; color: var(--wiring-text-primary); margin: 1.25rem 0 0.5rem; border-bottom: 1px solid var(--wiring-glass-border); padding-bottom: 0.25rem; }
        .doc-content .md-h3 { font-size: 0.9rem; font-weight: 600; color: var(--wiring-text-primary); margin: 1rem 0 0.4rem; }
        .doc-content .md-p { margin-bottom: 0.75rem; line-height: 1.75; }
        .doc-content .md-bold { font-weight: 600; color: var(--wiring-text-primary); }
        .doc-content .md-em { font-style: italic; color: var(--wiring-text-primary); }
        .doc-content .md-code { background: var(--wiring-bg-tertiary); border: 1px solid var(--wiring-glass-border); border-radius: 8px; padding: 0.75rem 1rem; margin: 0.75rem 0; overflow-x: auto; font-size: 0.75rem; font-family: monospace; color: var(--wiring-text-primary); white-space: pre; display: block; }
        .doc-content .md-inline-code { background: var(--wiring-bg-tertiary); border-radius: 4px; padding: 0.1rem 0.3rem; font-size: 0.75rem; font-family: monospace; color: var(--wiring-accent); }
        .doc-content .md-li { margin: 0.25rem 0 0.25rem 1.25rem; list-style-type: disc; display: list-item; }
        .doc-content .md-li-num { margin: 0.25rem 0 0.25rem 1.25rem; list-style-type: decimal; display: list-item; }
        .doc-content .md-td { border: 1px solid var(--wiring-glass-border); padding: 0.35rem 0.65rem; font-size: 0.75rem; }
        .doc-content tr { display: table-row; }
        .doc-content .md-tr-divider { display: none; }
        .doc-content table, .doc-content tr { display: table; width: 100%; border-collapse: collapse; margin: 0.5rem 0; }
        .doc-content .md-link { color: var(--wiring-accent); text-decoration: underline; }
        .doc-content .md-hr { border-color: var(--wiring-glass-border); margin: 1rem 0; }
      `}</style>
    </div>
  );
}
