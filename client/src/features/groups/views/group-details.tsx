import { api } from "@/lib/api";
import { createAsync, query } from "@solidjs/router";
import { Suspense } from "solid-js";
import { useGroup } from "../context/group-provider";
import { Page } from "@/components/layout/page";

const getGroupDetails = query(async (id) => {
  // TODO: try/catch
  const res = await api.get(`/groups/${id}`);
  return res.data as { id: string; created_at: string; name: string };
}, "groupDetails");

export const GroupDetails = () => {
  const group = useGroup();
  const groupDetails = createAsync(async () => getGroupDetails(group()));

  return (
    <Page title="Group Details">
      <Suspense>
        <p>{groupDetails()?.id}</p>
        <p>{groupDetails()?.name}</p>
        <p>{groupDetails()?.created_at}</p>
      </Suspense>
    </Page>
  );
};
