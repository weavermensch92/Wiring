import { ChatMessage } from "@/types/chat";

export const DUMMY_CHAT_HISTORIES: Record<string, ChatMessage[]> = {
  "hitl-1": [
    { id: "msg-1", role: "system", agent: "PM", content: "ImageUploader 컴포넌트 코드 리뷰가 도착했습니다.", timestamp: "2026-04-03T09:00:00Z" },
    { id: "msg-2", role: "agent", agent: "FE", content: "기존 FileUploader를 확장하여 구현했습니다. 주요 변경 사항:\n1. 이미지 미리보기 추가 (base64 인코딩)\n2. 드래그앤드롭 지원 (네이티브 Drag API)\n3. 멀티 업로드 (최대 10장)\n\nSM의 권고에 따라 React DnD 대신 네이티브 API를 사용했습니다.", timestamp: "2026-04-03T09:01:00Z" },
    { id: "msg-3", role: "agent", agent: "SM", content: "네이티브 Drag API 사용은 번들 사이즈 감소 효과가 있습니다. 다만 IE 미지원이나, 현재 타깃 브라우저에는 영향 없습니다.", timestamp: "2026-04-03T09:02:00Z" },
  ],
  "hitl-2": [
    { id: "msg-4", role: "system", agent: "GM", content: "보안 승인 요청입니다.", timestamp: "2026-04-03T10:30:00Z" },
    { id: "msg-5", role: "agent", agent: "GM", content: "이미지 공유 기능에서 users 테이블의 user_id와 display_name 참조가 필요합니다. user_id는 로우 데이터로 분류되어 있어 L3 승인이 필요합니다.\n\n접근 범위: user_id, display_name 2개 컬럼\n용도: 이미지 소유자 표시\n기간: ticket-6 완료 시까지 (임시)", timestamp: "2026-04-03T10:31:00Z" },
  ],
};
