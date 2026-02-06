import { Suspense } from "solid-js";
import { Page } from "@/components/layout/page";
import { TextSkeleton } from "@/components/ui/text.skeleton";
import { formatDate } from "@/lib/format-date";
import { useGroup } from "../context/group-provider";
import { useGroupDetails } from "../hooks/use-group-details";

export const GroupDetails = () => {
  const group = useGroup();
  const groupDetails = useGroupDetails(group);

  return (
    <Page title="Group Details">
      <Suspense fallback={<TextSkeleton lines={3} />}>
        <p>{groupDetails.data?.id}</p>
        <p>{groupDetails.data?.name}</p>
        <p>{formatDate(groupDetails.data?.created_at ?? "")}</p>
      </Suspense>
    </Page>
  );
};
