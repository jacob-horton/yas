import { For, Suspense } from "solid-js";
import { Page } from "@/components/layout/page";
import { Table } from "@/components/ui/table";
import { formatDate } from "@/lib/format-date";
import { useGroup } from "../context/group-provider";
import { useGroupMembers } from "../hooks/use-group-members";

export const GroupMembers = () => {
  const group = useGroup();
  const members = useGroupMembers(group);

  return (
    <Page title="Group Members">
      <Table
        headings={["Name", "Email", "Created On"]}
        caption="All members of this group"
      >
        <Suspense>
          <For each={members()}>
            {(member) => (
              <Table.Row>
                <Table.Cell>{member.name}</Table.Cell>
                <Table.Cell>{member.email}</Table.Cell>
                <Table.Cell>{formatDate(member.created_at)}</Table.Cell>
              </Table.Row>
            )}
          </For>
        </Suspense>
      </Table>
    </Page>
  );
};
