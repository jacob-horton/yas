import type { AvatarColour, AvatarIcon } from "@/components/ui/avatar";

export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  avatar: AvatarIcon;
  avatar_colour: AvatarColour;
};
