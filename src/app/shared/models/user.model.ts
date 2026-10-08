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
  token?: string;
  sellerId?: number;
  customerId?: number;
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



export enum UserRole {
  BUYER = 1,
  ADMIN = 2,
  SELLER = 3
}

export const RoleNames: Record<number, string> = {
  1: 'BUYER',
  2: 'ADMIN',
  3: 'SELLER'
};
