import { api } from "@/lib/api";
import type { User } from "../types";

export interface UserApiContract {
  get(): Promise<User>;
}

export class UserApi implements UserApiContract {
  constructor(private userId: string) {}

  public async get(): Promise<User> {
    return api.get(`/users/${this.userId}`).then((resp) => resp.data);
  }
}
