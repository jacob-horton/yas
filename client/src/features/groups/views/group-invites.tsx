import { formatDistanceToNow } from "date-fns";
import { type Component, For, Show, Suspense } from "solid-js";
import LetterSvg from "@/assets/empty-states/letter.svg";
import { Container } from "@/components/layout/container";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { RoleTag } from "@/components/ui/role-tag";
import {
  type Heading,
  Table,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { TableRowSkeleton } from "@/components/ui/table.skeleton";
import { useConfirmation } from "@/context/confirmation-context";
import { useToast } from "@/context/toast-context";
import { Authorised } from "@/features/auth/components/authorised";
import { useAuth } from "@/features/auth/context/auth-provider";
import { useDeleteInvite } from "@/features/invites/hooks/use-delete-invite";
import type { InviteSummary } from "@/features/invites/types/invite";
import { cn } from "@/lib/classname";
import { isExpired } from "@/lib/expiry";
import { formatDate } from "@/lib/format-date";
import { useGroup } from "../context/group-provider";
import { useGroupInvites } from "../hooks/use-group-invites";
import { hasPermission } from "../types";

type ExpiryCellProps = { expiresAt: string };

const ExpiryCell: Component<ExpiryCellProps> = (props) => {
  const expired = isExpired(props.expiresAt);

  // TODO: show "in 10 days", tooltip for exact time
  return (
    <div class="flex flex-col">
      <span class={cn({ "text-red-500": expired })}>
        {formatDate(props.expiresAt)}
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
  { label: "Uses" },
  { label: "Role" },
  { label: "# Whitelisted Emails" },
  { label: "Created By" },
  { label: "Created On" },
  { label: "Expiry" },
  { label: "", class: "w-28" },
] as const satisfies Heading<string>[];

export const Invites = () => {
  const auth = useAuth();
  const group = useGroup();
  const invites = useGroupInvites(group.groupId);

  const deleteInvite = useDeleteInvite(group.groupId);
  const toast = useToast();

  const { showConfirm } = useConfirmation();
  const handleDelete = async (invite: InviteSummary) => {
    const isConfirmed = await showConfirm({
      title: "Delete Invite",
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
      deleteInvite.mutate(invite.id, {
        onSuccess: () => {
          toast.success({
            title: "Invite deleted",
            description: "Invite deleted successfully",
          });
        },
      });
    }
  };

  return (
    <Page
      title="Invites"
      actions={
        hasPermission(group.userRole(), "admin", auth.user()?.email_verified)
          ? [
              {
                text: "Create",
                variant: "primary",
                href: "create",
                icon: "plus",
              },
            ]
          : []
      }
    >
      <Container>
        <Show
          when={!invites.isError}
          fallback={
            <ErrorMessage title="Error" details="Couldn't load invites" />
          }
        >
          <Show
            when={invites.data?.length !== 0}
            fallback={
              <EmptyState title="No invites yet!" img={LetterSvg}>
                Your invites will show here once you create one
              </EmptyState>
            }
          >
            <div class="overflow-x-auto">
              <Table
                headings={TABLE_HEADINGS}
                caption="All invites for this group"
              >
                <Suspense fallback={<TableRowSkeleton numCols={5} />}>
                  <For each={invites.data}>
                    {(invite) => (
                      <TableRow>
                        <TableCell>{invite.name}</TableCell>
                        <TableCell>
                          {invite.uses}
                          <Show when={invite.max_uses}>{invite.max_uses}</Show>
                        </TableCell>
                        <TableCell>
                          <RoleTag role={invite.role} />
                        </TableCell>
                        <TableCell>
                          {invite.email_whitelist.length > 0
                            ? invite.email_whitelist.length
                            : "All emails allowed"}
                        </TableCell>
                        <TableCell>{invite.created_by_name}</TableCell>
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
                                navigator.clipboard.writeText(
                                  getInviteLink(invite.id),
                                )
                              }
                            />
                            <Authorised
                              minRole="admin"
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
                                danger
                                icon="delete"
                                variant="ghost"
                                class="text-gray-400"
                                onClick={() => handleDelete(invite)}
                              />
                            </Authorised>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </For>
                </Suspense>
              </Table>
            </div>
          </Show>
        </Show>
      </Container>
    </Page>
  );
};
