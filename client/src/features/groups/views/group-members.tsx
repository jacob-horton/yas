import { createSignal, For, Suspense } from "solid-js";
import { Page } from "@/components/layout/page";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Role } from "@/components/ui/role";
import {
  type Heading,
  type Sort,
  Table,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { TableRowSkeleton } from "@/components/ui/table.skeleton";
import { useAuth } from "@/features/auth/context/auth-provider";
import { cn } from "@/lib/classname";
import { formatDate } from "@/lib/format-date";
import { groupsApi } from "../api";
import { useGroup } from "../context/group-provider";
import { useGroupMembers } from "../hooks/use-group-members";
import { useConfirmation } from "@/context/confirmation-context";
import type { GroupMember } from "../types";

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
  const members = useGroupMembers(group, sort);

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
      await groupsApi.group(group()).member(member.id).delete();
      members.refetch();
    }
  };

  return (
    <Page title="Group Members">
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
                  <Role role={member.role} />
                </TableCell>
                <TableCell>{formatDate(member.joined_at)}</TableCell>
                <TableCell class="w-14">
                  <Button
                    class="text-gray-400"
                    variant="ghost"
                    icon="delete"
                    danger
                    onClick={() => handleRemove(member)}
                  />
                </TableCell>
              </TableRow>
            )}
          </For>
        </Suspense>
      </Table>
    </Page>
  );
};
