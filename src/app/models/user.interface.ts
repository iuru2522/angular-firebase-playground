import { UserRole } from './user-role.enum';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  displayName: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  displayName?: string;
  role?: UserRole;
  isActive?: boolean;
}