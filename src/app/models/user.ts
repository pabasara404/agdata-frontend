export interface User {
  id?: number;
  username: string;
  email: string;
  isAdmin?: boolean;
}

export interface UserCreate {
  username: string;
  email: string;
}

export interface UserUpdate {
  email: string;
}
