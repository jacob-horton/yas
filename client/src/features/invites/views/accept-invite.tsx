import { useNavigate, useParams } from "@solidjs/router";
import { Suspense } from "solid-js";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/auth-provider";
import { invitesApi } from "../api";
import { useInvite } from "../hooks/use-invite";
import { ButtonSkeleton } from "@/components/ui/button.skeleton";
import { TextSkeleton } from "@/components/ui/text.skeleton";

export const AcceptInvite = () => {
  const params = useParams<{ inviteId: string }>();
  const invite = useInvite(() => params.inviteId);
  const auth = useAuth();

  const navigate = useNavigate();

  const handleAccept = async () => {
    const i = invite.data;
    if (!i) {
      return;
    }

    if (!i.is_current_user_member) {
      await invitesApi.invite(params.inviteId).accept();
    }

    navigate(`/groups/${i.group_id}`);
  };

  return (
    <Page title="Accept Invite">
      <div class="flex flex-col gap-2">
        <Suspense fallback={<TextSkeleton />}>
          <div>
            You are currently logged in as{" "}
            <strong>
              {auth.user()?.name} ({auth.user()?.email})
            </strong>
          </div>
        </Suspense>

        <div>
          <h2>Invite Details</h2>
          <Suspense fallback={<TextSkeleton lines={3} />}>
            <p>
              Group: <strong>{invite.data?.group_name}</strong>
            </p>
            <p>
              Invited by: <strong>{invite.data?.created_by_name}</strong>
            </p>
            {invite.data?.is_current_user_member && (
              <p>You are already a member of this group!</p>
            )}
          </Suspense>
        </div>

        <Suspense
          fallback={<ButtonSkeleton class="w-42">Loading...</ButtonSkeleton>}
        >
          <Button onClick={handleAccept}>
            {invite.data?.is_current_user_member
              ? "Go to group"
              : "Accept invite"}
          </Button>
        </Suspense>
      </div>
    </Page>
  );
};
