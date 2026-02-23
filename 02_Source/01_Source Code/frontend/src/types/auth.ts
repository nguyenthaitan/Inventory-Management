export type UserRole = 'manager' | 'operator' | 'qc' | 'it_admin';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}