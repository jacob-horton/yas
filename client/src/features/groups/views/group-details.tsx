import { useQueryClient } from "@tanstack/solid-query";
import CalendarIcon from "lucide-solid/icons/calendar-1";
import UserStarIcon from "lucide-solid/icons/user-star";
import UsersIcon from "lucide-solid/icons/users";
import { createMemo, type ParentComponent, Show, Suspense } from "solid-js";
import { Dynamic } from "solid-js/web";
import { type Action, Page } from "@/components/layout/page";
import { Avatar } from "@/components/ui/avatar";
import { useConfirmation } from "@/context/confirmation-context";
import { useAuth } from "@/features/auth/context/auth-provider";
import { formatDate } from "@/lib/format-date";
import { groupsApi } from "../api";
import { useGroup } from "../context/group-provider";
import { groupKeys } from "../hooks/query-keys";
import { useGroupMembers } from "../hooks/use-group-members";
import { hasPermission } from "../types";
import { useNavigate } from "@solidjs/router";

// TODO: one full icon map
const ICON_MAP = {
  calendar: CalendarIcon,
  users: UsersIcon,
  user: UserStarIcon,
} as const;

type Icon = keyof typeof ICON_MAP;

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
  const queryClient = useQueryClient();
  const group = useGroup();
  const members = useGroupMembers(group.groupId);
  const auth = useAuth();

  const { showConfirm } = useConfirmation();
  const handleDelete = async () => {
    const isConfirmed = await showConfirm({
      title: "Delete Group",
      description: (
        <p>
          Are you sure you would like to delete{" "}
          <strong>{group.groupQuery.data?.name}</strong>? This cannot be undone.
        </p>
      ),
      confirmText: "Delete",
      danger: true,
    });

    if (isConfirmed) {
      await groupsApi.group(group.groupId()).delete();
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
    }
  };

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
      await groupsApi
        .group(group.groupId())
        .member(auth.user()?.id ?? "")
        .delete();
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
    }
  };

  const actions = createMemo(() => {
    const actions: Action[] = [
      {
        text: "Leave",
        onAction: handleLeave,
        variant: "secondary",
      },
    ];

    if (hasPermission(group.userRole(), "admin")) {
      actions.push({
        text: "Edit",
        onAction: () => navigate("edit"),
        variant: "secondary",
      });
    }

    if (hasPermission(group.userRole(), "admin")) {
      actions.push({
        text: "Delete",
        onAction: handleDelete,
        variant: "secondary",
        danger: true,
      });
    }

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
          <DetailCard icon="users" title="Members">
            <Suspense>{members.data?.length ?? 0}</Suspense>
          </DetailCard>
          <DetailCard icon="calendar" title="Created On">
            <Suspense>
              {formatDate(group.groupQuery.data?.created_at ?? "")}
            </Suspense>
          </DetailCard>
          <DetailCard icon="user" title="Created By">
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
        </div>
      </div>
    </Page>
  );
};
