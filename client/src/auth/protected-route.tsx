import { useNavigate } from "@solidjs/router";
import { createEffect, Show, type ParentComponent } from "solid-js";
import { useAuth } from "./auth-provider";

export const ProtectedRoute: ParentComponent = (props) => {
  const navigate = useNavigate();
  const { loading, user } = useAuth()!;

  createEffect(() => {
    if (!loading() && !user()) {
      navigate("/login", { replace: true });
    }
  });

  // TODO: fallback?
  return <Show when={!!user()}>{props.children}</Show>;
};
