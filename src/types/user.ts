export enum USER_STATUS {
  ACTIVE = 1,
  INACTIVE = 0,
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  avatar: string;
  banner: string;
  bio: string;
  isAdmin: boolean;
  isVerified: boolean;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
  wallet: {
    balance: number;
  };
}
