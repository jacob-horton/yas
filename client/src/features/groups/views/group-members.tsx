import { createMemo, createSignal, For, Suspense } from "solid-js";
import { Container } from "@/components/layout/container";
import { Page } from "@/components/layout/page";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RolePicker } from "@/components/ui/role-picker";
import {
  type Heading,
  type Sort,
  Table,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { TableRowSkeleton } from "@/components/ui/table.skeleton";
import { useConfirmation } from "@/context/confirmation-context";
import { Authorised } from "@/features/auth/components/authorised";
import { useAuth } from "@/features/auth/context/auth-provider";
import { cn } from "@/lib/classname";
import { formatDate } from "@/lib/format-date";
import { groupsApi } from "../api";
import { useGroup } from "../context/group-provider";
import { useGroupMembers } from "../hooks/use-group-members";
import {
  type GroupMember,
  hasPermission,
  MEMBER_ROLES,
  type MemberRole,
} from "../types";

type SortProp = "name" | "email" | "role" | "joined_at";
const DEFAULT_SORT: Sort<SortProp> = {
  property: "name",
  direction: "ascending",
};

const TABLE_HEADINGS = [
  { label: "Name", sortProp: "name" },
  { label: "Email", sortProp: "email" },
  { label: "Role", sortProp: "role", defaultDirection: "descending" },
  { label: "Joined On", sortProp: "joined_at" },
  { label: "", class: "w-18" },
] as const satisfies Heading<SortProp>[];

export const GroupMembers = () => {
  const auth = useAuth();
  const group = useGroup();

  const [sort, setSort] = createSignal<Sort<SortProp>>(DEFAULT_SORT);
  const members = useGroupMembers(group.groupId, sort);

  const { showConfirm } = useConfirmation();
  const handleRemove = async (member: GroupMember) => {
    const isConfirmed = await showConfirm({
      title: "Remove User From Group",
      description: (
        <p>
          Are you sure you would like to remove <strong>{member.name}</strong>{" "}
          from this group? This cannot be undone.
        </p>
      ),
      confirmText: "Delete",
      danger: true,
    });

    if (isConfirmed) {
      await groupsApi.group(group.groupId()).member(member.id).delete();
      members.refetch();
    }
  };

  const handleUpdateRole = async (member: GroupMember, role: MemberRole) => {
    await groupsApi.group(group.groupId()).member(member.id).updateRole(role);
    members.refetch();
  };

  // Allow promoting people up to (and including) your role
  const selectableRoles = createMemo(() =>
    MEMBER_ROLES.filter(
      (role) => role !== "owner" && hasPermission(group.userRole(), role),
    ),
  );

  return (
    <Page title="Group Members">
      <Container>
        <Table
          headings={TABLE_HEADINGS}
          caption="All members of this group"
          sortedBy={sort()}
          onSort={setSort}
        >
          <Suspense fallback={<TableRowSkeleton numCols={5} />}>
            <For each={members.data}>
              {(member) => (
                <TableRow
                  class={cn({
                    "font-semibold": member.id === auth.user()?.id,
                  })}
                >
                  <TableCell class="flex items-center gap-3">
                    <Avatar
                      class="size-7"
                      avatar={member.avatar}
                      colour={member.avatar_colour}
                    />
                    {member.name}
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <RolePicker
                      possibleRoles={selectableRoles()}
                      currentRole={member.role}
                      onChange={(role) => handleUpdateRole(member, role)}
                      // Only allow changing people below your role, and you must be admin or above
                      disabled={
                        // Can change people below your role
                        !hasPermission(group.userRole(), member.role, true) ||
                        // Can only change if admin or above
                        !hasPermission(group.userRole(), "admin") ||
                        // Cannot change owner role (owner can demote themselves otherwise)
                        member.role === "owner"
                      }
                    />
                  </TableCell>
                  <TableCell>{formatDate(member.joined_at)}</TableCell>
                  <TableCell class="w-14">
                    <Authorised
                      strictlyAbove={member.role}
                      fallback={
                        <Button
                          class="text-gray-200"
                          variant="ghost"
                          icon="delete"
                          disabled
                        />
                      }
                    >
                      <Button
                        class="text-gray-400 dark:text-gray-500"
                        variant="ghost"
                        icon="delete"
                        danger
                        onClick={() => handleRemove(member)}
                      />
                    </Authorised>
                  </TableCell>
                </TableRow>
              )}
            </For>
          </Suspense>
        </Table>
      </Container>
    </Page>
  );
};
