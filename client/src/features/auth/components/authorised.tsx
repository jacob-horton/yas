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
    // Check "strictlyAbove" (e.g. am I higher rank than the person I'm editing)
    if (
      props.strictlyAbove &&
      !hasPermission(group.userRole(), props.strictlyAbove, true)
    ) {
      return false;
    }

    // Check "minRole" (e.g. am I at least an Admin)
    if (
      props.minRole &&
      !hasPermission(group.userRole(), props.minRole, false)
    ) {
      return false;
    }

    // If we passed all checks (or no checks were provided), return true
    return true;
  };

  return (
    <Show when={isAuthorised()} fallback={props.fallback}>
      {props.children}
    </Show>
  );
};
