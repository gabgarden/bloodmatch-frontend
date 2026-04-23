export type UserRole = "DONOR" | "REQUESTER" | "ORGANIZATION" | "SYSTEM_ADMIN";

export type LoginResponse = {
  tokenType: string;
  accessToken: string;
  expiresIn?: number;
  partyId: string;
  userId?: string;
  roles: string[];
};

export type AuthSession = {
  tokenType: string;
  accessToken: string;
  expiresAt: number;
  partyId: string;
  userId: string | null;
  roles: string[];
};

export type LoginCredentials = {
  email: string;
  password: string;
};
