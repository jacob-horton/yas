import ChevronDownIcon from "lucide-solid/icons/chevron-down";
import { Show } from "solid-js";
import type { MemberRole } from "@/features/groups/types";
import { cn } from "@/lib/classname";

export const ROLE_CONFIG: Record<
  MemberRole,
  { label: string; colour: string }
> = {
  viewer: {
    label: "Viewer",
    colour: "bg-gray-100 text-gray-700 border-gray-200",
  },
  member: {
    label: "Member",
    colour: "bg-gray-100 text-gray-700 border-gray-200",
  },
  admin: {
    label: "Admin",
    colour: "bg-blue-100 text-blue-700 border-blue-200",
  },
  owner: {
    label: "Owner",
    colour: "bg-violet-100 text-violet-700 border-violet-200",
  },
};

type RoleTagProps = {
  role: MemberRole;
  showChevron?: boolean;
  class?: string;
};

export const RoleTag = (props: RoleTagProps) => {
  return (
    <span
      class={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-sm transition-colors",
        ROLE_CONFIG[props.role].colour,
        props.class,
      )}
    >
      {ROLE_CONFIG[props.role].label}
      <Show when={props.showChevron}>
        <ChevronDownIcon size={12} />
      </Show>
    </span>
  );
};
