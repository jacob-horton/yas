import { useNavigate } from "@solidjs/router";
import { createEffect, type ParentComponent } from "solid-js";
import { useAuth } from "../context/auth-provider";

export const ProtectedRoute: ParentComponent = (props) => {
  const navigate = useNavigate();
  const auth = useAuth();

  createEffect(() => {
    if (!auth.loading() && !auth.user()) {
      navigate("/login", { replace: true });
    }
  });

  // TODO: fallback?
  return props.children;
};
