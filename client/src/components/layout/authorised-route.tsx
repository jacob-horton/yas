import { Navigate, useParams } from "@solidjs/router";
import { type ParentComponent, Show } from "solid-js";
import { useGroup } from "@/features/groups/context/group-provider";
import { hasPermission, type MemberRole } from "@/features/groups/types";

type Props = {
  minRole: MemberRole;
};

export const AuthorisedRoute: ParentComponent<Props> = (props) => {
  const group = useGroup();
  const params = useParams();

  const isAuthorised = () => {
    return hasPermission(group.userRole(), props.minRole);
  };

  return (
    // While loading, we render nothing to prevent early redirects.
    <Show when={!group.groupQuery.isLoading} fallback={null}>
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
