import { Menu } from "@ark-ui/solid";
import CheckIcon from "lucide-solid/icons/check";
import ChevronDownIcon from "lucide-solid/icons/chevron-down";
import { Show } from "solid-js";
import { Portal } from "solid-js/web";
import type { MemberRole } from "@/features/groups/types";
import { cn } from "@/lib/classname";

type RolePickerProps = {
  possibleRoles: MemberRole[];
  currentRole: MemberRole;
  onChange: (newRole: MemberRole) => void;
  disabled?: boolean;
};

const ROLE_CONFIG: Record<MemberRole, { label: string; colour: string }> = {
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

export const RolePicker = (props: RolePickerProps) => {
  return (
    <Menu.Root onSelect={(item) => props.onChange(item.value as MemberRole)}>
      <Menu.Trigger
        disabled={props.disabled}
        class={cn(
          "flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-sm transition-colors",
          ROLE_CONFIG[props.currentRole].colour,
          props.disabled
            ? "cursor-default opacity-100"
            : "cursor-pointer hover:opacity-80",
        )}
      >
        {ROLE_CONFIG[props.currentRole].label}
        <Show when={!props.disabled}>
          <ChevronDownIcon size={12} />
        </Show>
      </Menu.Trigger>

      <Portal>
        <Menu.Positioner>
          <Menu.Content class="z-50 min-w-44 rounded-lg border border-gray-200 bg-white p-1 shadow-xl focus-visible:outline-none">
            {props.possibleRoles.map((role) => (
              <Menu.Item
                value={role}
                class="flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-sm data-[highlighted]:bg-gray-100"
              >
                <Menu.ItemText
                  class={cn(
                    "rounded-full border px-2 py-0.5 text-sm",
                    ROLE_CONFIG[role].colour,
                  )}
                >
                  {ROLE_CONFIG[role].label}
                </Menu.ItemText>
                <Show when={props.currentRole === role}>
                  <CheckIcon size={14} />
                </Show>
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};
