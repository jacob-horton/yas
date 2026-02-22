import { Navigate, useParams } from "@solidjs/router";
import { type ParentComponent, Show } from "solid-js";
import { useAuth } from "@/features/auth/context/auth-provider";
import { useGroup } from "@/features/groups/context/group-provider";
import { hasPermission, type MemberRole } from "@/features/groups/types";

type Props = {
  minRole: MemberRole;
  requireVerification?: boolean;
};

export const AuthorisedRoute: ParentComponent<Props> = (props) => {
  const auth = useAuth();
  const group = useGroup();
  const params = useParams();

  const isAuthorised = () => {
    return hasPermission(
      group.userRole(),
      props.minRole,
      auth.user()?.email_verified,
    );
  };

  return (
    // While loading, we render nothing to prevent early redirects.
    <Show when={!group.groupQuery.isLoading || !auth.user()} fallback={null}>
      {/* Once loaded, check permissions */}
      <Show
        when={isAuthorised()}
        // If loaded but not authorised, redirect
        fallback={<Navigate href={`/groups/${params.groupId}`} />}
      >
        {props.children}
      </Show>
    </Show>
  );
};
export const requireRole = (role: MemberRole): ParentComponent => {
  return (props) => (
    <AuthorisedRoute minRole={role}>{props.children}</AuthorisedRoute>
  );
};
