export interface User {
  id: string;
  name: string;
  email: string;
  level: string;
  teamIds: string[]; // user can belong to multiple teams
  role: string;
  avatar: string;
}
