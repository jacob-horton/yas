import { useParams } from "@solidjs/router";
import {
  keepPreviousData,
  type UseQueryResult,
  useQuery,
} from "@tanstack/solid-query";
import {
  type Accessor,
  createContext,
  createEffect,
  createMemo,
  type ParentComponent,
  useContext,
} from "solid-js";
import { groupsApi } from "@/features/groups/api";
import { LS_LAST_GROUP_ID } from "@/pages/home-page";
import { groupKeys } from "../hooks/query-keys";
import type { Group, MemberRole } from "../types";
import type { GroupRouteParams } from "../types/params";

type GroupContextState = {
  groupId: Accessor<string>;
  groupQuery: UseQueryResult<Group, Error>;
  userRole: Accessor<MemberRole | undefined>;
};

const GroupContext = createContext<GroupContextState>();

export const GroupProvider: ParentComponent = (props) => {
  const params = useParams<GroupRouteParams>();
  const groupId = () => params.groupId;

  const groupQuery = useQuery(() => ({
    queryKey: groupKeys.detail(groupId()),
    queryFn: () => groupsApi.group(groupId()).get(),
    enabled: !!groupId(),
    placeholderData: keepPreviousData,
  }));

  createEffect(() => {
    if (groupId()) localStorage.setItem(LS_LAST_GROUP_ID, groupId());
  });

  const userRole = createMemo(() => groupQuery.data?.my_role);

  return (
    <GroupContext.Provider value={{ groupId, groupQuery, userRole }}>
      {props.children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => {
  const group = useContext(GroupContext);
  if (!group) {
    throw new Error("useGroup must be used within GroupProvider");
  }

  return group;
};
