import { Suspense } from "solid-js";
import { Page } from "@/components/layout/page";
import { formatDate } from "@/lib/format-date";
import { useGroup } from "../context/group-provider";
import { useGroupDetails } from "../hooks/use-group-details";

export const GroupDetails = () => {
  const group = useGroup();
  const groupDetails = useGroupDetails(group);

  return (
    <Page title="Group Details">
      <Suspense>
        <p>{groupDetails.data?.id}</p>
        <p>{groupDetails.data?.name}</p>
        <p>{formatDate(groupDetails.data?.created_at ?? "")}</p>
      </Suspense>
    </Page>
  );
};
