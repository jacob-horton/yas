import type { AvatarColour, AvatarIcon } from "@/components/ui/avatar";

export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
};

export type User = {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: AvatarIcon;
  avatar_colour: AvatarColour;
  email_verified: boolean;
};
