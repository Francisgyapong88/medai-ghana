export interface User {
  user_id: number;
  role_id: number;
  gender_id: number | null;

  first_name: string;
  last_name: string;
  other_names: string | null;

  username: string;
  email: string;
  phone_number: string | null;

  password_hash: string;

  profile_image: string | null;

  is_active: boolean;
  email_verified: boolean;

  last_login: Date | null;

  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}