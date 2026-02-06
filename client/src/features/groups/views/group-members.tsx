import { For, Suspense } from "solid-js";
import { Page } from "@/components/layout/page";
import { Avatar } from "@/components/ui/avatar";
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

const TABLE_HEADINGS = [
  { label: "Name" },
  { label: "Email" },
  { label: "Role" },
  { label: "Joined At" },
] as const satisfies Heading<string>[];

export const GroupMembers = () => {
  const group = useGroup();
  const members = useGroupMembers(group);

  return (
    <Page title="Group Members">
      <Table headings={TABLE_HEADINGS} caption="All members of this group">
        <Suspense fallback={<TableRowSkeleton numCols={4} />}>
          <For each={members.data}>
            {(member) => (
              <TableRow>
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
              </TableRow>
            )}
          </For>
        </Suspense>
      </Table>
    </Page>
  );
};
