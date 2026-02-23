import { useNavigate } from "@solidjs/router";
import { isAxiosError } from "axios";
import {
  createEffect,
  createMemo,
  type ParentComponent,
  Show,
  Suspense,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { type Action, Page } from "@/components/layout/page";
import { Avatar } from "@/components/ui/avatar";
import { ErrorMessage } from "@/components/ui/error-message";
import { useConfirmation } from "@/context/confirmation-context";
import { useToast } from "@/context/toast-context";
import { useAuth } from "@/features/auth/context/auth-provider";
import { LS_LAST_GROUP_ID } from "@/features/home/constants";
import { formatDate } from "@/lib/format-date";
import { ICON_MAP, type Icon } from "@/lib/icons";
import { useGroup } from "../context/group-provider";
import { useGroupMembers } from "../hooks/use-group-members";
import { useRemoveMember } from "../hooks/use-remove-member";
import { hasPermission } from "../types";

type DetailCardProps = {
  title: string;
  icon: Icon;
};

const DetailCard: ParentComponent<DetailCardProps> = (props) => {
  return (
    <div class="flex min-h-32 min-w-76 flex-1 flex-col justify-between gap-6 whitespace-nowrap rounded-md border px-6 py-4">
      <div class="flex items-center justify-between gap-2">
        <p class="font-semibold text-2xl">{props.title}</p>
        <Dynamic component={ICON_MAP[props.icon]} size={32} />
      </div>
      <div class="font-semibold text-4xl">{props.children}</div>
    </div>
  );
};

export const GroupDetails = () => {
  const navigate = useNavigate();
  const group = useGroup();
  const members = useGroupMembers(group.groupId);
  const auth = useAuth();

  const removeMember = useRemoveMember();
  const toast = useToast();

  const { showConfirm } = useConfirmation();

  // Return to home page if group not found
  createEffect(() => {
    if (!group.groupQuery.isError) {
      return;
    }

    const error = group.groupQuery.error;
    if (isAxiosError(error) && error.response?.status === 404) {
      localStorage.removeItem(LS_LAST_GROUP_ID);
      navigate("/");
    }
  });

  const handleLeave = async () => {
    const isConfirmed = await showConfirm({
      title: "Leave Group",
      description: (
        <p>
          Are you sure you would like to leave{" "}
          <strong>{group.groupQuery.data?.name}</strong>? This cannot be undone.
        </p>
      ),
      confirmText: "Leave",
      danger: true,
    });

    if (isConfirmed) {
      removeMember.mutate(
        { groupId: group.groupId(), memberId: auth.user()?.id ?? "" },
        {
          onSuccess: () => {
            toast.success({
              title: "Left group",
              description: "Successfully left group",
            });
          },
        },
      );
    }
  };

  const actions = createMemo(() => {
    const actions: Action[] = [];

    if (hasPermission(group.userRole(), "admin", auth.user()?.email_verified)) {
      actions.push({
        text: "Edit",
        href: "edit",
        variant: "secondary",
        icon: "edit",
      });
    }

    actions.push({
      text: "Leave",
      onAction: handleLeave,
      variant: "secondary",
      danger: true,
      icon: "logOut",
    });

    return actions;
  });

  const createdBy = createMemo(() => {
    const groupData = group.groupQuery.data;
    const list = members.data;
    if (!groupData || !list) return undefined;
    return list.find((m) => m.id === groupData.created_by);
  });

  return (
    <Page
      title={group.groupQuery.data?.name ?? "Loading..."}
      actions={actions()}
    >
      <div class="no-scrollbar flex snap-x overflow-x-auto px-6">
        <div class="flex w-full flex-nowrap gap-4">
          <Show
            when={!members.isError && !group.groupQuery.isError}
            fallback={
              <ErrorMessage
                title="Error"
                details="Couldn't load group details"
              />
            }
          >
            <DetailCard icon="users" title="Members">
              <Suspense>{members.data?.length ?? 0}</Suspense>
            </DetailCard>
            <DetailCard icon="calendar" title="Created On">
              <Suspense>
                {formatDate(group.groupQuery.data?.created_at ?? "")}
              </Suspense>
            </DetailCard>
            <DetailCard icon="userStar" title="Created By">
              <Suspense>
                <Show when={createdBy()}>
                  {(createdBy) => {
                    return (
                      <div class="flex items-center gap-4">
                        <div class="rounded-full border p-2">
                          <Avatar
                            avatar={createdBy().avatar}
                            colour={createdBy().avatar_colour}
                            class="size-12"
                          />
                        </div>
                        {createdBy().name}
                      </div>
                    );
                  }}
                </Show>
              </Suspense>
            </DetailCard>
          </Show>
        </div>
      </div>
    </Page>
  );
};
