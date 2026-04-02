import { User } from "@/types/user";

export const DUMMY_USERS: User[] = [
  { id: "user-1", name: "김CTO", email: "cto@company.com", level: "L3", team: "Engineering", role: "CTO", avatar: "KC" },
  { id: "user-2", name: "이시니어", email: "senior@company.com", level: "L2", team: "Backend", role: "Senior Developer", avatar: "LS" },
  { id: "user-3", name: "김주니어", email: "junior@company.com", level: "L1", team: "Frontend", role: "Junior Developer", avatar: "KJ" },
  { id: "user-4", name: "박디자이너", email: "designer@company.com", level: "L1", team: "Design", role: "Designer", avatar: "PD" },
  { id: "user-5", name: "정PM", email: "pm@company.com", level: "L2", team: "Product", role: "Product Manager", avatar: "JP" },
];

export const CURRENT_USER = DUMMY_USERS[0];
