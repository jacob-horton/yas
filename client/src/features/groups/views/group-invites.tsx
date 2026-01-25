import { useNavigate } from "@solidjs/router";
import { formatDistanceToNow } from "date-fns";
import { type Component, For, Suspense } from "solid-js";
import { Page } from "@/components/layout/page";
import { Table } from "@/components/ui/table";
import { cn } from "@/lib/classname";
import { formatDate, formatDateTime } from "@/lib/format-date";
import { useGroup } from "../context/group-provider";
import { useGroupInvites } from "../hooks/use-group-invites";
import { Button } from "@/components/ui/button";

function isExpired(expiry: string) {
  const expiryDate = new Date(expiry);
  const now = new Date();

  return now > expiryDate;
}

type ExpiryCellProps = { expiresAt: string };

const ExpiryCell: Component<ExpiryCellProps> = ({ expiresAt }) => {
  const expired = isExpired(expiresAt);

  return (
    <div class="flex flex-col">
      <span class={cn({ "text-red-500": expired })}>
        {formatDateTime(expiresAt)}
      </span>
      <span
        class={cn("text-sm", {
          "text-gray-400": !expired,
          "text-red-400": expired,
        })}
      >
        {formatDistanceToNow(expiresAt, { addSuffix: true })}
      </span>
    </div>
  );
};

function getInviteLink(id: string) {
  // TODO: use .env
  const site = "http://localhost:3000";
  return `${site}/invites/${id}/accept`;
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
        headings={["Name", "Created By", "Uses", "Created On", "Expiry", ""]}
        caption="All invites for this group"
      >
        <Suspense>
          <For each={invites()}>
            {(invite) => (
              <Table.Row>
                <Table.Cell>{invite.name}</Table.Cell>
                <Table.Cell>{invite.created_by_name}</Table.Cell>
                <Table.Cell>
                  {invite.uses}
                  {invite.max_uses && <>/{invite.max_uses}</>}
                </Table.Cell>
                <Table.Cell>{formatDate(invite.created_at)}</Table.Cell>
                <Table.Cell>
                  <ExpiryCell expiresAt={invite.expires_at} />
                </Table.Cell>
                <Table.Cell>
                  <Button
                    icon="copy"
                    variant="ghost"
                    onClick={() =>
                      navigator.clipboard.writeText(getInviteLink(invite.id))
                    }
                  />
                </Table.Cell>
              </Table.Row>
            )}
          </For>
        </Suspense>
      </Table>
    </Page>
  );
};
