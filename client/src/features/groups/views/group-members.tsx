import { For, Suspense } from "solid-js";
import { Page } from "@/components/layout/page";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Role } from "@/components/ui/role";
import {
  type Heading,
  Table,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { TableRowSkeleton } from "@/components/ui/table.skeleton";
import { formatDate } from "@/lib/format-date";
import { useGroup } from "../context/group-provider";
import { useGroupMembers } from "../hooks/use-group-members";
import { groupsApi } from "../api";
import { cn } from "@/lib/classname";
import { useAuth } from "@/features/auth/context/auth-provider";

const TABLE_HEADINGS = [
  { label: "Name" },
  { label: "Email" },
  { label: "Role" },
  { label: "Joined On" },
  { label: "", class: "w-18" },
] as const satisfies Heading<string>[];

export const GroupMembers = () => {
  const auth = useAuth();
  const group = useGroup();
  const members = useGroupMembers(group);

  return (
    <Page title="Group Members">
      <Table headings={TABLE_HEADINGS} caption="All members of this group">
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
                    onClick={async () => {
                      await groupsApi.group(group()).member(member.id).delete();
                      members.refetch();
                    }}
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
