import { createAsync, query } from "@solidjs/router";
import { For, Suspense } from "solid-js";
import { api } from "../api";
import { Page } from "../components/page";
import { useGroup } from "../group-provider";

const getMembers = query(async (id) => {
  // TODO: try/catch
  const res = await api.get(`/groups/${id}/members`);
  return res.data as {
    id: string;
    created_at: string;
    email: string;
    name: string;
  }[];
}, "groupMembers");

export const GroupMembers = () => {
  const group = useGroup();
  const members = createAsync(async () => getMembers(group));

  return (
    <Page title="Group Members">
      <Suspense>
        <For each={members()}>
          {(member) => (
            <div class="flex gap-3">
              <p>{member.id}</p>
              <p>{member.name}</p>
              <p>{member.created_at}</p>
              <p>{member.email}</p>
            </div>
          )}
        </For>
      </Suspense>
    </Page>
  );
};
