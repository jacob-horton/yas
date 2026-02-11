import { useNavigate } from "@solidjs/router";
import { formatDistanceToNow } from "date-fns";
import { type Component, For, Suspense } from "solid-js";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import {
  type Heading,
  Table,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { TableRowSkeleton } from "@/components/ui/table.skeleton";
import { useConfirmation } from "@/context/confirmation-context";
import { invitesApi } from "@/features/invites/api";
import type { InviteSummary } from "@/features/invites/types/invite";
import { cn } from "@/lib/classname";
import { formatDate, formatDateTime } from "@/lib/format-date";
import { useGroup } from "../context/group-provider";
import { useGroupInvites } from "../hooks/use-group-invites";

function isExpired(expiry: string) {
  const expiryDate = new Date(expiry);
  const now = new Date();

  return now > expiryDate;
}

type ExpiryCellProps = { expiresAt: string };

const ExpiryCell: Component<ExpiryCellProps> = (props) => {
  const expired = isExpired(props.expiresAt);

  // TODO: show "in 10 days", tooltip for exact time
  return (
    <div class="flex flex-col">
      <span class={cn({ "text-red-500": expired })}>
        {formatDateTime(props.expiresAt)}
      </span>
      <span
        class={cn("text-sm", {
          "text-gray-400": !expired,
          "text-red-400": expired,
        })}
      >
        {formatDistanceToNow(props.expiresAt, { addSuffix: true })}
      </span>
    </div>
  );
};

function getInviteLink(id: string) {
  // TODO: use .env
  const site = "http://localhost:3000";
  return `${site}/invites/${id}/accept`;
}

const TABLE_HEADINGS = [
  { label: "Name" },
  { label: "Created By" },
  { label: "Uses" },
  { label: "Created On" },
  { label: "Expiry" },
  { label: "", class: "w-28" },
] as const satisfies Heading<string>[];

export const Invites = () => {
  const group = useGroup();
  const invites = useGroupInvites(group);

  const navigate = useNavigate();

  const { showConfirm } = useConfirmation();
  const handleDelete = async (invite: InviteSummary) => {
    const isConfirmed = await showConfirm({
      title: `Delete Invite`,
      description: (
        <p>
          Are you sure you would like to delete <strong>{invite.name}</strong>?
          This cannot be undone.
        </p>
      ),
      confirmText: "Delete",
      danger: true,
    });

    if (isConfirmed) {
      await invitesApi.invite(invite.id).delete();
      invites.refetch();
    }
  };

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
      <Table headings={TABLE_HEADINGS} caption="All invites for this group">
        <Suspense fallback={<TableRowSkeleton numCols={5} />}>
          <For each={invites.data}>
            {(invite) => (
              <TableRow>
                <TableCell>{invite.name}</TableCell>
                <TableCell>{invite.created_by_name}</TableCell>
                <TableCell>
                  {invite.uses}
                  {invite.max_uses && <>/{invite.max_uses}</>}
                </TableCell>
                <TableCell>{formatDate(invite.created_at)}</TableCell>
                <TableCell>
                  <ExpiryCell expiresAt={invite.expires_at} />
                </TableCell>
                <TableCell>
                  <div class="flex gap-1">
                    <Button
                      icon="copy"
                      variant="ghost"
                      class="text-gray-400"
                      onClick={() =>
                        navigator.clipboard.writeText(getInviteLink(invite.id))
                      }
                    />
                    <Button
                      danger
                      icon="delete"
                      variant="ghost"
                      class="text-gray-400"
                      onClick={() => handleDelete(invite)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </For>
        </Suspense>
      </Table>
    </Page>
  );
};
