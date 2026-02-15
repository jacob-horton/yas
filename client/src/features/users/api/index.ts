import type { Group } from "@/features/groups/types";
import { api } from "@/lib/api";
import type { CreateUserRequest, User } from "../types";
import { UserApi, type UserApiContract } from "./user-api";

export interface UsersApiContract {
  create(payload: CreateUserRequest): Promise<User>;
  me(): Promise<User>;
  myGroups(): Promise<Group[]>;
  updateMe(
    name: string,
    email: string,
    avatar: string,
    avatarColour: string,
  ): Promise<User>;
  updateMyPassword(currentPassword: string, newPassword: string): Promise<void>;

  user(id: string): UserApiContract;
}

class UsersApi implements UsersApiContract {
  public async create(payload: CreateUserRequest): Promise<User> {
    return api.post("/users", payload).then((resp) => resp.data);
  }

  // TODO: combine me functions into some Me contract or smth?
  public async me(): Promise<User> {
    return api.get("/users/me").then((resp) => resp.data);
  }

  public async updateMe(
    name: string,
    email: string,
    avatar: string,
    avatar_colour: string,
  ): Promise<User> {
    return api
      .patch("/users/me", { name, email, avatar, avatar_colour })
      .then((resp) => resp.data);
  }

  public async updateMyPassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    return api.put(`/users/me/password`, {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  public async myGroups(): Promise<Group[]> {
    return api.get("/users/me/groups").then((resp) => resp.data);
  }

  public user(id: string): UserApiContract {
    return new UserApi(id);
  }
}

export const usersApi: UsersApiContract = new UsersApi();
