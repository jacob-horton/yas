import type { MemberRole } from "@/features/groups/types";
import { cn } from "@/lib/classname";
import type { Component, ParentComponent } from "solid-js";

type Props = {
  role: MemberRole;
};

const ROLE_MAP: Record<MemberRole, string> = {
  member: "bg-gray-100 border-gray-200",
  admin: "bg-blue-100 text-blue-800 border-blue-200",
  owner: "bg-violet-100 text-violet-800 border-violet-200",
};

export const Role: Component<Props> = (props) => {
  return (
    <div
      class={cn(
        "flex w-fit justify-center rounded-full border px-3 py-0.5",
        ROLE_MAP[props.role],
      )}
    >
      {props.role}
    </div>
  );
};
