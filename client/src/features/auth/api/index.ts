import type { User } from "@/features/users/types";
import { api } from "@/lib/api";

export interface AuthApiContract {
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
}

class AuthApi implements AuthApiContract {
  public async login(email: string, password: string): Promise<User> {
    return api.post("/sessions", { email, password }).then((resp) => resp.data);
  }

  public logout(): Promise<void> {
    return api.delete("/sessions");
  }
}

export const authApi = new AuthApi();
