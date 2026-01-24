import { useNavigate } from "@solidjs/router";
import { For, Suspense } from "solid-js";
import { Page } from "@/components/layout/page";
import { Table } from "@/components/ui/table";
import { cn } from "@/lib/classname";
import { useGroup } from "../context/group-provider";
import { useGroupInvites } from "../hooks/use-group-invites";

function isExpired(expiry: string) {
  const expiryDate = new Date(expiry);
  const now = new Date();

  return now > expiryDate;
}

export const Invites = () => {
  const group = useGroup();
  const invites = useGroupInvites(group);

  const navigate = useNavigate();

  return (
    <Page
      title="Invites"
      actions={[
        {
          text: "Create Invite",
          variant: "primary",
          onAction: () => navigate("create"),
        },
      ]}
    >
      <Table
        headings={["Name", "Created By", "Uses", "Created At", "Expires At"]}
        caption="All invites for this group"
      >
        <Suspense>
          <For each={invites()}>
            {(invite) => (
              <Table.Row>
                <Table.Cell>{invite.name}</Table.Cell>
                <Table.Cell>{invite.created_by}</Table.Cell>
                <Table.Cell>
                  {invite.uses}
                  {invite.max_uses && <>/{invite.max_uses}</>}
                </Table.Cell>
                <Table.Cell>{invite.created_at}</Table.Cell>
                <Table.Cell>
                  <span
                    class={cn({ "text-red-500": isExpired(invite.expires_at) })}
                  >
                    {invite.expires_at}
                  </span>
                </Table.Cell>
              </Table.Row>
            )}
          </For>
        </Suspense>
      </Table>
    </Page>
  );
};
