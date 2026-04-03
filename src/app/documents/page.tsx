"use client";

import { useState } from "react";
import { DUMMY_SKILL_DOCUMENTS } from "@/dummy/skills";
import { SkillDocument } from "@/types/skill";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AGENT_COLORS } from "@/lib/constants";
import {
  FileText, Plus, Bold, Italic, List, Code,
  Heading2, Save, ChevronLeft, Trash2, Clock,
  RefreshCw, AlertTriangle, CheckCircle2,
} from "lucide-react";

// ─── Document store (in-memory, session only) ───
interface Doc {
  id: string;
  title: string;
  content: string;
  type: SkillDocument["type"];
  createdAt: string;
  updatedAt: string;
  generatedBy: string[];
  tags: string[];
  status: "ready" | "generating" | "outdated";
  sizeKb: number;
}

const DOC_TYPE_LABELS: Record<SkillDocument["type"], string> = {
  api_docs: "API 문서",
  migration_guide: "마이그레이션 가이드",
  architecture: "아키텍처 문서",
  runbook: "런북",
  onboarding: "온보딩 가이드",
};

// Convert SkillDocument to editable Doc
function toDoc(sd: SkillDocument): Doc {
  return {
    id: sd.id,
    title: sd.title,
    content: `# ${sd.title}\n\n> ${DOC_TYPE_LABELS[sd.type]}\n\n---\n\n## 개요\n\n이 문서는 **${sd.title}** 에 대한 내용을 담고 있습니다.\n\n## 내용\n\n여기에 문서 내용을 작성하세요...\n\n## 태그\n\n${sd.tags.map((t) => `\`${t}\``).join(" ")}`,
    type: sd.type,
    createdAt: sd.createdAt,
    updatedAt: sd.updatedAt,
    generatedBy: sd.generatedBy,
    tags: sd.tags,
    status: sd.status,
    sizeKb: sd.sizeKb,
  };
}

const STATUS_CONFIG = {
  ready:      { label: "완료",          color: "var(--wiring-success)",  icon: CheckCircle2 },
  generating: { label: "생성 중",       color: "var(--wiring-warning)",  icon: RefreshCw },
  outdated:   { label: "업데이트 필요", color: "var(--wiring-danger)",   icon: AlertTriangle },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getDate().toString().padStart(2, "0")}`;
}

// ─── Simple toolbar action ───
function insertAt(text: string, cursor: number, insert: string): [string, number] {
  return [text.slice(0, cursor) + insert + text.slice(cursor), cursor + insert.length];
}

function wrapSelection(text: string, start: number, end: number, prefix: string, suffix: string): [string, number, number] {
  const selected = text.slice(start, end);
  const newText = text.slice(0, start) + prefix + selected + suffix + text.slice(end);
  return [newText, start + prefix.length, end + prefix.length];
}

// ─── Editor ───
function Editor({ doc, onSave, onBack }: { doc: Doc; onSave: (d: Doc) => void; onBack: () => void }) {
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    onSave({ ...doc, title, content, updatedAt: new Date().toISOString(), status: "ready" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function applyFormat(type: string) {
    const ta = document.querySelector<HTMLTextAreaElement>("#doc-editor");
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;

    let newContent = content;
    let newStart = start;
    let newEnd = end;

    if (type === "bold") {
      [newContent, newStart, newEnd] = wrapSelection(content, start, end, "**", "**");
    } else if (type === "italic") {
      [newContent, newStart, newEnd] = wrapSelection(content, start, end, "_", "_");
    } else if (type === "code") {
      [newContent, newStart, newEnd] = wrapSelection(content, start, end, "`", "`");
    } else if (type === "h2") {
      [newContent] = insertAt(content, start, "\n## ");
      newStart = start + 5; newEnd = start + 5;
    } else if (type === "list") {
      [newContent] = insertAt(content, start, "\n- ");
      newStart = start + 3; newEnd = start + 3;
    }

    setContent(newContent);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(newStart, newEnd);
    }, 0);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Editor header */}
      <div className="flex items-center gap-3 px-6 h-14 border-b border-[var(--wiring-glass-border)] shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 bg-transparent text-base font-semibold text-[var(--wiring-text-primary)] outline-none placeholder:text-[var(--wiring-text-tertiary)]"
          placeholder="문서 제목"
        />
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs text-[var(--wiring-success)] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />저장됨
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--wiring-accent)] text-white hover:opacity-90 transition-opacity"
          >
            <Save className="w-3.5 h-3.5" />저장
          </button>
        </div>
      </div>

      {/* Formatting toolbar */}
      <div className="flex items-center gap-1 px-6 py-2 border-b border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-secondary)]">
        {[
          { type: "bold", icon: Bold, label: "굵게" },
          { type: "italic", icon: Italic, label: "기울임" },
          { type: "h2", icon: Heading2, label: "제목" },
          { type: "list", icon: List, label: "목록" },
          { type: "code", icon: Code, label: "코드" },
        ].map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => applyFormat(type)}
            title={label}
            className="p-1.5 rounded text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] hover:text-[var(--wiring-text-primary)] transition-colors"
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-[10px] text-[var(--wiring-text-tertiary)]">
          <span>Markdown 지원</span>
          <span>·</span>
          <span>마지막 저장: {formatDate(doc.updatedAt)}</span>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-hidden grid grid-cols-2">
        {/* Write pane */}
        <div className="border-r border-[var(--wiring-glass-border)] flex flex-col">
          <div className="px-4 py-1.5 text-[10px] text-[var(--wiring-text-tertiary)] border-b border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-secondary)]">
            편집
          </div>
          <textarea
            id="doc-editor"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 p-5 bg-[var(--wiring-bg-primary)] text-sm text-[var(--wiring-text-primary)] font-mono leading-relaxed outline-none resize-none"
            placeholder="마크다운으로 문서를 작성하세요..."
          />
        </div>

        {/* Preview pane */}
        <div className="flex flex-col">
          <div className="px-4 py-1.5 text-[10px] text-[var(--wiring-text-tertiary)] border-b border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-secondary)]">
            미리보기
          </div>
          <ScrollArea className="flex-1">
            <div className="p-5 prose-sm text-[var(--wiring-text-secondary)] leading-relaxed space-y-3">
              {content.split("\n").map((line, i) => {
                if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold text-[var(--wiring-text-primary)] mb-2">{line.slice(2)}</h1>;
                if (line.startsWith("## ")) return <h2 key={i} className="text-base font-semibold text-[var(--wiring-text-primary)] mt-4 mb-1">{line.slice(3)}</h2>;
                if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-semibold text-[var(--wiring-text-primary)] mt-3 mb-1">{line.slice(4)}</h3>;
                if (line.startsWith("> ")) return <blockquote key={i} className="border-l-2 border-[var(--wiring-accent)] pl-3 italic text-[var(--wiring-text-tertiary)] text-xs">{line.slice(2)}</blockquote>;
                if (line.startsWith("- ")) return <li key={i} className="ml-4 text-xs list-disc">{line.slice(2)}</li>;
                if (line.startsWith("---")) return <hr key={i} className="border-[var(--wiring-glass-border)] my-3" />;
                if (line === "") return <div key={i} className="h-2" />;
                // inline bold/italic/code
                const rendered = line
                  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                  .replace(/_(.+?)_/g, "<em>$1</em>")
                  .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 rounded bg-[var(--wiring-glass-bg)] text-[var(--wiring-accent)] text-xs font-mono">$1</code>');
                return <p key={i} className="text-xs" dangerouslySetInnerHTML={{ __html: rendered }} />;
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───
export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>(() => DUMMY_SKILL_DOCUMENTS.map(toDoc));
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingDoc = editingId ? docs.find((d) => d.id === editingId) ?? null : null;

  function handleSave(updated: Doc) {
    setDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  }

  function handleNewDoc() {
    const newDoc: Doc = {
      id: `doc-${Date.now()}`,
      title: "새 문서",
      content: "# 새 문서\n\n내용을 작성하세요...",
      type: "architecture",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      generatedBy: [],
      tags: [],
      status: "ready",
      sizeKb: 0,
    };
    setDocs((prev) => [newDoc, ...prev]);
    setEditingId(newDoc.id);
  }

  function handleDelete(id: string) {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    if (editingId === id) setEditingId(null);
  }

  if (editingDoc) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <Editor
          doc={editingDoc}
          onSave={handleSave}
          onBack={() => setEditingId(null)}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-[var(--wiring-text-primary)]">문서</h1>
            <button
              onClick={handleNewDoc}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--wiring-accent)] text-white hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />새 문서
            </button>
          </div>

          {/* Document list */}
          <div className="space-y-3">
            {docs.map((doc) => {
              const stCfg = STATUS_CONFIG[doc.status];
              const StIcon = stCfg.icon;
              return (
                <div
                  key={doc.id}
                  className="glass-panel p-4 hover:border-[var(--wiring-text-tertiary)] transition-all cursor-pointer group"
                  onClick={() => setEditingId(doc.id)}
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 shrink-0 mt-0.5 text-[var(--wiring-text-tertiary)]" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className="text-sm font-medium text-[var(--wiring-text-primary)]">{doc.title}</p>
                          <p className="text-xs text-[var(--wiring-text-tertiary)] mt-0.5">
                            {DOC_TYPE_LABELS[doc.type]}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0" style={{ color: stCfg.color }}>
                          <StIcon className={`w-3.5 h-3.5 ${doc.status === "generating" ? "animate-spin" : ""}`} />
                          <span className="text-[10px]">{stCfg.label}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-[var(--wiring-text-tertiary)]">
                        {doc.status === "ready" && <span>{doc.sizeKb > 0 ? `${doc.sizeKb}KB` : "—"}</span>}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(doc.updatedAt)}
                        </div>
                        <div className="flex items-center gap-1 ml-auto">
                          {doc.generatedBy.map((id) => (
                            <Avatar key={id} className="w-4 h-4">
                              <AvatarFallback
                                className="text-[7px] font-bold text-white"
                                style={{ backgroundColor: AGENT_COLORS[id] ?? "#555" }}
                              >
                                {id}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </div>

                      {doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.tags.map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--wiring-glass-bg)] border border-[var(--wiring-glass-border)] text-[var(--wiring-text-tertiary)]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      className="p-1 rounded opacity-0 group-hover:opacity-100 text-[var(--wiring-text-tertiary)] hover:text-[var(--wiring-danger)] hover:bg-[var(--wiring-glass-hover)] transition-all"
                      onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
