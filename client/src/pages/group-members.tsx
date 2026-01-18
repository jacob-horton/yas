import { createAsync, query } from "@solidjs/router";
import { For, Suspense } from "solid-js";
import { api } from "../api";
import { Page } from "../components/page";
import { useGroup } from "../group-provider";
import { Table } from "../components/table";

const getMembers = query(async (id) => {
  // TODO: try/catch
  const res = await api.get(`/groups/${id}/members`);
  return res.data as {
    id: string;
    created_at: string;
    email: string;
    name: string;
  }[];
}, "groupMembers");

export const GroupMembers = () => {
  const group = useGroup();
  const members = createAsync(async () => getMembers(group()));

  return (
    <Page title="Group Members">
      <Table
        headings={["ID", "Name", "Email", "Created At"]}
        caption="All members of this group"
      >
        <Suspense>
          <For each={members()}>
            {(member) => (
              <Table.Row>
                <Table.Cell>{member.id}</Table.Cell>
                <Table.Cell>{member.name}</Table.Cell>
                <Table.Cell>{member.email}</Table.Cell>
                <Table.Cell>{member.created_at}</Table.Cell>
              </Table.Row>
            )}
          </For>
        </Suspense>
      </Table>
    </Page>
  );
};
