import { useNavigate } from "@solidjs/router";
import { createEffect, Show } from "solid-js";
import HelloSvg from "@/assets/empty-states/hello.svg";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useMyGroups } from "@/features/users/hooks/use-my-groups";
import { LS_LAST_GROUP_ID } from "../constants";

export const HomePage = () => {
  const navigate = useNavigate();
  const groups = useMyGroups();

  createEffect(() => {
    // Check local storage for last viewed group
    const lastGroupId = localStorage.getItem(LS_LAST_GROUP_ID);

    // If we have a saved ID, view it
    if (lastGroupId) {
      navigate(`/groups/${lastGroupId}`, { replace: true });
      return;
    }

    // If user is in at least one group, load the first one
    const list = groups.data;

    if (list && list.length > 0) {
      navigate(`/groups/${list[0].id}`, { replace: true });
    }
  });

  // Once checked groups - if none, show welcome page
  return (
    <Show
      when={groups.data?.length === 0}
      fallback={<div class="p-10">Loading...</div>}
    >
      <div class="flex h-full flex-col items-center justify-center">
        <EmptyState title="Welcome!" img={HelloSvg} class="flex flex-col gap-8">
          <p class="w-2/3 text-center">
            You aren't in any groups yet. Get started by creating your own group
            or using an invite to join another group
          </p>
          <Button href="/groups/create">Create your first group</Button>
        </EmptyState>
      </div>
    </Show>
  );
};
