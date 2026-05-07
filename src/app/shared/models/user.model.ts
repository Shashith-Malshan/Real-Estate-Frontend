/**
 * User and Authentication Models
 */

export interface UserResponseDTO {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  nic: string;
  activeRoleId: number;
  roleName: string;
}

export interface UserRegistrationDTO {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  nic: string;
  roleId: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponseDTO;
  token?: string;
}

export enum UserRole {
  ADMIN = 1,
  BUYER = 3,
  SELLER = 4
}

export const RoleNames: Record<number, string> = {
  1: 'ADMIN',
  3: 'BUYER',
  4: 'SELLER'
};
