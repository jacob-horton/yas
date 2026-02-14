import { useQueryClient } from "@tanstack/solid-query";
import CalendarIcon from "lucide-solid/icons/calendar-1";
import UserStarIcon from "lucide-solid/icons/user-star";
import UsersIcon from "lucide-solid/icons/users";
import { type ParentComponent, Show, Suspense } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Page } from "@/components/layout/page";
import { Avatar } from "@/components/ui/avatar";
import { QK_MY_GROUPS } from "@/features/users/constants";
import { formatDate } from "@/lib/format-date";
import { groupsApi } from "../api";
import { useGroup } from "../context/group-provider";
import { useGroupMembers } from "../hooks/use-group-members";
import { hasPermission } from "../types";

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
    <div class="flex min-h-32 min-w-76 flex-1 flex-col justify-between gap-6 whitespace-nowrap rounded-md border px-6 py-4 text-gray-800">
      <div class="flex items-center justify-between gap-2">
        <p class="font-semibold text-2xl">{props.title}</p>
        <Dynamic component={ICON_MAP[props.icon]} size={32} />
      </div>
      <div class="font-semibold text-4xl">{props.children}</div>
    </div>
  );
};

export const GroupDetails = () => {
  const queryClient = useQueryClient();
  const group = useGroup();
  const members = useGroupMembers(group.groupId);

  return (
    <Page
      title={group.groupQuery.data?.name ?? "Loading..."}
      actions={
        hasPermission(group.userRole(), "admin")
          ? [
              {
                text: "Delete group",
                onAction: async () => {
                  await groupsApi.group(group.groupId()).delete();
                  queryClient.invalidateQueries({ queryKey: [QK_MY_GROUPS] });
                },
                variant: "secondary",
                danger: true,
              },
            ]
          : []
      }
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
              <Show when={group.groupQuery.data}>
                {(groupData) => {
                  const member = members.data?.find(
                    (m) => m.id === groupData().created_by,
                  );
                  if (!member) {
                    return null;
                  }

                  return (
                    <div class="flex items-center gap-4">
                      <div class="rounded-full border p-2">
                        <Avatar
                          avatar={member.avatar}
                          colour={member.avatar_colour}
                          class="size-12"
                        />
                      </div>
                      {member.name}
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
