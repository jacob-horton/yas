import { useNavigate, useParams } from "@solidjs/router";
import { Suspense } from "solid-js";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/auth-provider";
import { invitesApi } from "../api";
import { useInvite } from "../hooks/use-invite";

export const AcceptInvite = () => {
  const params = useParams<{ inviteId: string }>();
  const invite = useInvite(() => params.inviteId);
  const auth = useAuth();

  const navigate = useNavigate();

  const handleAccept = async () => {
    const i = invite();
    if (!i) {
      return;
    }

    if (!i.is_current_user_member) {
      await invitesApi.invite(params.inviteId).accept();
    }

    navigate(`/groups/${i.group_id}`);
  };

  // TODO: show who logged in as
  return (
    <Page title="Accept Invite">
      <Suspense>
        <div class="flex flex-col gap-2">
          <div>
            You are currently logged in as{" "}
            <strong>
              {auth.user()?.name} ({auth.user()?.email})
            </strong>
          </div>

          <div>
            <h2>Invite Details</h2>
            <p>
              Group: <strong>{invite()?.group_name}</strong>
            </p>
            <p>
              Invited by: <strong>{invite()?.created_by_name}</strong>
            </p>
            {invite()?.is_current_user_member && (
              <p>You are already a member of this group!</p>
            )}
          </div>

          <Button onClick={handleAccept}>
            {invite()?.is_current_user_member ? "Go to group" : "Accept invite"}
          </Button>
        </div>
      </Suspense>
    </Page>
  );
};
