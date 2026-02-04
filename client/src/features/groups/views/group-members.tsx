import { For, Suspense } from "solid-js";
import { Page } from "@/components/layout/page";
import {
  Table,
  TableCell,
  TableRow,
  type Heading,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format-date";
import { useGroup } from "../context/group-provider";
import { useGroupMembers } from "../hooks/use-group-members";

const TABLE_HEADINGS = [
  { label: "Name" },
  { label: "Email" },
  { label: "Created On" },
] as const satisfies Heading<string>[];

export const GroupMembers = () => {
  const group = useGroup();
  const members = useGroupMembers(group);

  return (
    <Page title="Group Members">
      <Table headings={TABLE_HEADINGS} caption="All members of this group">
        <Suspense>
          <For each={members.data}>
            {(member) => (
              <TableRow>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{formatDate(member.created_at)}</TableCell>
              </TableRow>
            )}
          </For>
        </Suspense>
      </Table>
    </Page>
  );
};
