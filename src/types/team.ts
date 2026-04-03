export interface Team {
  id: string;
  name: string;
  abbreviation: string; // 2-letter abbreviation for avatar
  color: string; // team accent color
  description: string;
  memberIds: string[];
  projectIds: string[];
}
