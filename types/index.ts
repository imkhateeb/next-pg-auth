export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
  role: "user" | "admin";
  is_active: boolean;
  refresh_token: string | null;
};
