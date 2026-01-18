import { useNavigate } from "@solidjs/router";
import { createEffect, createResource, Show } from "solid-js";
import { api } from "../api";
import { Button } from "../components/button";

export const getGroups = async () => {
  // TODO: try/catch
  const res = await api.get("/users/me/groups");
  return res.data as {
    id: string;
    name: string;
    created_at: string;
  }[];
};

export const HomePage = () => {
  const navigate = useNavigate();
  const [groups] = createResource(getGroups);

  createEffect(() => {
    // Check local storage for last viewed group
    const lastGroupId = localStorage.getItem("lastGroupId");

    // If we have a saved ID, view it
    if (lastGroupId) {
      navigate(`/groups/${lastGroupId}`, { replace: true });
      return;
    }

    // If user is in at least one group, load the first one
    if (groups.state === "ready") {
      const list = groups();

      if (list && list.length > 0) {
        navigate(`/groups/${list[0].id}`, { replace: true });
      }
    }
  });

  // Once checked groups - if none, show welcome page
  return (
    <Show
      when={groups.state === "ready" && groups()?.length === 0}
      fallback={<div class="p-10">Loading...</div>}
    >
      <div class="flex h-full flex-col items-center justify-center space-y-4">
        <h1 class="font-bold text-2xl">Welcome!</h1>
        <p>You aren't in any groups yet.</p>
        <Button onClick={() => navigate("/groups/create")}>
          Create a Group
        </Button>
      </div>
    </Show>
  );
};
