import type { RoutePreloadFunc } from "@solidjs/router";
import { queryClient } from "@/lib/query-client";
import { groupsApi } from "./api";
import { groupKeys } from "./hooks/query-keys";
import { DEFAULT_MEMBERS_SORT } from "./views/group-members";

export const preloadGroupDetails: RoutePreloadFunc = ({ params }) => {
  queryClient.prefetchQuery({
    queryKey: groupKeys.members(params.groupId),
    queryFn: () => groupsApi.group(params.groupId).members(),
  });
};

export const preloadGroupMembers: RoutePreloadFunc = ({ params }) => {
  queryClient.prefetchQuery({
    queryKey: groupKeys.members(params.groupId, DEFAULT_MEMBERS_SORT),
    queryFn: () =>
      groupsApi.group(params.groupId).members(DEFAULT_MEMBERS_SORT),
  });
};

export const preloadGroupInvites: RoutePreloadFunc = ({ params }) => {
  queryClient.prefetchQuery({
    queryKey: groupKeys.invites(params.groupId),
    queryFn: () => groupsApi.group(params.groupId).invites(),
  });
};
