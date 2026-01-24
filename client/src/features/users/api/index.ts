import { api } from "@/lib/api";
import type { CreateUserRequest, User } from "../types";
import type { Group } from "@/features/groups/types";

export interface UserApiContract {
  create(payload: CreateUserRequest): Promise<User>;
  me(): Promise<User>;
}

class UsersApi implements UserApiContract {
  public async create(payload: CreateUserRequest): Promise<User> {
    return api.post("/users", payload).then((resp) => resp.data);
  }

  public async me(): Promise<User> {
    return api.get("/users/me").then((resp) => resp.data);
  }

  public async myGroups(): Promise<Group[]> {
    return api.get("/users/me/groups").then((resp) => resp.data);
  }
}

export const usersApi = new UsersApi();
