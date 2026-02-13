import { type JSX, type ParentComponent, Show } from "solid-js";
import { useGroup } from "@/features/groups/context/group-provider";
import { hasPermission, type MemberRole } from "@/features/groups/types";

type Props = {
  fallback?: JSX.Element;

  minRole?: MemberRole;
  strictlyAbove?: MemberRole;
};

export const Authorised: ParentComponent<Props> = (props) => {
  const group = useGroup();

  const isAuthorised = () => {
    if (props.strictlyAbove) {
      return hasPermission(group.userRole(), props.strictlyAbove, true);
    }

    if (props.minRole) {
      return hasPermission(group.userRole(), props.minRole, false);
    }

    return false;
  };

  return (
    <Show when={isAuthorised()} fallback={props.fallback}>
      {props.children}
    </Show>
  );
};
