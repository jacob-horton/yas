import { useQueryClient } from "@tanstack/solid-query";
import { Suspense } from "solid-js";
import { Container } from "@/components/layout/container";
import { Page } from "@/components/layout/page";
import { TextSkeleton } from "@/components/ui/text.skeleton";
import { QK_MY_GROUPS } from "@/features/users/constants";
import { formatDate } from "@/lib/format-date";
import { groupsApi } from "../api";
import { useGroup } from "../context/group-provider";
import { hasPermission } from "../types";

export const GroupDetails = () => {
  const queryClient = useQueryClient();
  const group = useGroup();

  return (
    <Page
      title="Group Details"
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
      <Container>
        <Suspense fallback={<TextSkeleton lines={3} />}>
          <p>{group.groupQuery.data?.id}</p>
          <p>{group.groupQuery.data?.name}</p>
          <p>{formatDate(group.groupQuery.data?.created_at ?? "")}</p>
        </Suspense>
      </Container>
    </Page>
  );
};
