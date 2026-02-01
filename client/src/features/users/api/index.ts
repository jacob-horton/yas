import type { Group } from "@/features/groups/types";
import { api } from "@/lib/api";
import type { CreateUserRequest, User } from "../types";
import { UserApi, type UserApiContract } from "./user-api";

export interface UsersApiContract {
  create(payload: CreateUserRequest): Promise<User>;
  me(): Promise<User>;
  myGroups(): Promise<Group[]>;
  updateMe(name: string, email: string): Promise<User>;

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

  public async updateMe(name: string, email: string): Promise<User> {
    return api.patch("/users/me", { name, email }).then((resp) => resp.data);
  }

  public async myGroups(): Promise<Group[]> {
    return api.get("/users/me/groups").then((resp) => resp.data);
  }

  public user(id: string): UserApiContract {
    return new UserApi(id);
  }
}

export const usersApi: UsersApiContract = new UsersApi();
