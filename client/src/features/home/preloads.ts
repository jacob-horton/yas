import type { RoutePreloadFunc } from "@solidjs/router";
import { queryClient } from "@/lib/query-client";
import { groupKeys } from "../groups/hooks/query-keys";
import { usersApi } from "../users/api";

export const preloadHomePage: RoutePreloadFunc = () => {
  queryClient.prefetchQuery({
    queryKey: groupKeys.myGroups(),
    queryFn: () => usersApi.myGroups(),
  });
};
