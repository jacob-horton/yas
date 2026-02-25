import type { User } from "@/features/users/types";
import { api } from "@/lib/api";

export interface AuthApiContract {
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(email: string, password: string): Promise<void>;
}

class AuthApi implements AuthApiContract {
  public async login(email: string, password: string): Promise<User> {
    return api.post("/sessions", { email, password }).then((resp) => resp.data);
  }

  public logout(): Promise<void> {
    return api.delete("/sessions");
  }

  public verifyEmail(token: string): Promise<void> {
    return api.post("/verify-email", { token });
  }

  public async forgotPassword(email: string): Promise<void> {
    return api.post("/forgot-password", { email });
  }

  public async resetPassword(token: string, password: string): Promise<void> {
    return api.post("/reset-password", { token, password });
  }
}

export const authApi = new AuthApi();
