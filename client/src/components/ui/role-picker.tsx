import { Menu } from "@ark-ui/solid";
import CheckIcon from "lucide-solid/icons/check";
import { createMemo, Show } from "solid-js";
import { Portal } from "solid-js/web";
import type { MemberRole } from "@/features/groups/types";
import { cn } from "@/lib/classname";
import { RoleTag } from "./role-tag";

type RolePickerProps = {
  possibleRoles: MemberRole[];
  currentRole: MemberRole;
  onChange: (newRole: MemberRole) => void;
  disabled?: boolean;
};

export const RolePicker = (props: RolePickerProps) => {
  const disabled = createMemo(
    () => props.disabled || props.possibleRoles.length <= 1,
  );

  return (
    <Menu.Root onSelect={(item) => props.onChange(item.value as MemberRole)}>
      <Menu.Trigger disabled={disabled()} class="focus-visible:outline-none">
        <RoleTag
          role={props.currentRole}
          showChevron={!props.disabled}
          class={cn(
            disabled()
              ? "cursor-default opacity-100"
              : "cursor-pointer hover:opacity-80",
          )}
        />
      </Menu.Trigger>

      <Portal>
        <Menu.Positioner>
          <Menu.Content class="z-50 min-w-44 rounded-md border border-gray-200 bg-white p-1 shadow-lg focus-visible:outline-none">
            {props.possibleRoles.map((role) => (
              <Menu.Item
                value={role}
                class="flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-sm data-[highlighted]:bg-gray-100"
              >
                <Menu.ItemText>
                  <RoleTag role={role} class="px-2" />
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
