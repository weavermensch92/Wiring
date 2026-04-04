"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X } from "lucide-react";

interface ShortcutGroup {
  label: string;
  shortcuts: { keys: string[]; desc: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    label: "전역",
    shortcuts: [
      { keys: ["⌘", "K"], desc: "커맨드 팔레트 열기" },
      { keys: ["⌘", "N"], desc: "새 티켓 생성" },
      { keys: ["⌘", "B"], desc: "사이드바 접기/펼치기" },
      { keys: ["⌘", "J"], desc: "채팅 패널 토글" },
      { keys: ["?"], desc: "단축키 도움말 열기" },
      { keys: ["ESC"], desc: "현재 패널/모달 닫기" },
    ],
  },
  {
    label: "커맨드 팔레트",
    shortcuts: [
      { keys: [">"], desc: "페이지 이동 모드" },
      { keys: ["#"], desc: "티켓 검색 모드" },
      { keys: ["@"], desc: "에이전트 검색 모드" },
      { keys: ["↑", "↓"], desc: "항목 탐색" },
      { keys: ["Enter"], desc: "선택한 항목으로 이동" },
    ],
  },
  {
    label: "채팅 패널",
    shortcuts: [
      { keys: ["/"], desc: "슬래시 커맨드 목록" },
      { keys: ["Enter"], desc: "메시지 전송" },
      { keys: ["Shift", "Enter"], desc: "줄바꿈" },
      { keys: ["ESC"], desc: "커맨드 드롭다운 닫기" },
    ],
  },
  {
    label: "칸반 보드",
    shortcuts: [
      { keys: ["클릭"], desc: "티켓 상세 열기" },
      { keys: ["드래그"], desc: "티켓 상태 변경" },
    ],
  },
];

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-[var(--wiring-glass-border)] bg-[var(--wiring-bg-tertiary)] text-[var(--wiring-text-secondary)] text-[10px] font-mono min-w-[1.5rem] justify-center">
      {children}
    </kbd>
  );
}

export function KeyboardHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
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
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[12%] -translate-x-1/2 z-50 w-full max-w-2xl max-h-[76vh] flex flex-col"
          >
            <div
              className="rounded-2xl overflow-hidden border border-[var(--wiring-glass-border)] flex flex-col"
              style={{ backgroundColor: "var(--wiring-bg-secondary)", boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--wiring-glass-border)]">
                <div className="flex items-center gap-2.5">
                  <Keyboard className="w-4 h-4 text-[var(--wiring-accent)]" />
                  <h2 className="text-sm font-semibold text-[var(--wiring-text-primary)]">키보드 단축키</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[var(--wiring-text-tertiary)] hover:bg-[var(--wiring-glass-hover)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto p-5">
                <div className="grid grid-cols-2 gap-5">
                  {SHORTCUT_GROUPS.map((group) => (
                    <div key={group.label}>
                      <p className="text-xs font-semibold text-[var(--wiring-text-tertiary)] uppercase tracking-wider mb-3">
                        {group.label}
                      </p>
                      <div className="space-y-2">
                        {group.shortcuts.map((s, i) => (
                          <div key={i} className="flex items-center justify-between gap-3">
                            <p className="text-xs text-[var(--wiring-text-secondary)]">{s.desc}</p>
                            <div className="flex items-center gap-1 shrink-0">
                              {s.keys.map((k, j) => (
                                <span key={j} className="flex items-center gap-1">
                                  <Kbd>{k}</Kbd>
                                  {j < s.keys.length - 1 && <span className="text-[10px] text-[var(--wiring-text-tertiary)]">+</span>}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-[var(--wiring-glass-border)] flex items-center justify-between">
                <p className="text-xs text-[var(--wiring-text-tertiary)]">Windows/Linux에서는 ⌘ 대신 Ctrl을 사용하세요</p>
                <button onClick={onClose} className="text-xs text-[var(--wiring-accent)] hover:underline">닫기</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
