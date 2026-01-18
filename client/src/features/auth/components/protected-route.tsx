import { useNavigate } from "@solidjs/router";
import { createEffect, type ParentComponent, Show } from "solid-js";
import { useAuth } from "../context/auth-provider";

export const ProtectedRoute: ParentComponent = (props) => {
  const navigate = useNavigate();
  const { loading, user } = useAuth();

  createEffect(() => {
    if (!loading() && !user()) {
      navigate("/login", { replace: true });
    }
  });

  // TODO: fallback?
  return <Show when={!!user()}>{props.children}</Show>;
};
