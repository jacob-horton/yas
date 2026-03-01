import { useNavigate, useParams } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import { Container } from "@/components/layout/container";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { ButtonSkeleton } from "@/components/ui/button.skeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import { RoleTag } from "@/components/ui/role-tag";
import { TextSkeleton } from "@/components/ui/text.skeleton";
import { useToast } from "@/context/toast-context";
import { useAuth } from "@/features/auth/context/auth-provider";
import { useAcceptInvite } from "../hooks/use-accept-invite";
import { useInvite } from "../hooks/use-invite";
import { RANK_BG_GRADIENTS } from "@/lib/rank-colours";
import { cn } from "@/lib/classname";

export const AcceptInvite = () => {
  const params = useParams<{ inviteId: string }>();
  const invite = useInvite(() => params.inviteId);
  const auth = useAuth();

  const navigate = useNavigate();
  const toast = useToast();
  const acceptInvite = useAcceptInvite();

  const handleAccept = () => {
    const i = invite.data;
    if (!i) return;

    // Already a member - skip accepting and just navigate
    if (i.is_current_user_member) {
      navigate(`/groups/${i.group_id}`);
      toast.info({
        title: "Already in group",
        description: `You are already in ${i.group_name}`,
      });

      return;
    }

    // Not a member - join then navigate
    acceptInvite.mutate(params.inviteId, {
      onSuccess: () => {
        toast.success({
          title: "Group joined",
          description: `You've successfully joined ${i.group_name}!`,
        });

        navigate(`/groups/${i.group_id}`);
      },
    });
  };

  return (
    <Page title="Accept Invite">
      <Container class="flex items-center justify-center py-10">
        <div class="w-full max-w-md overflow-hidden rounded-md border bg-white shadow-sm">
          <div
            class={cn(
              "border-b bg-gradient-to-br px-6 py-5",
              RANK_BG_GRADIENTS[3],
            )}
          >
            <h2 class="font-semibold text-white text-xl">Group Invitation</h2>
          </div>

          <div class="flex flex-col gap-6 p-6">
            <Suspense
              fallback={<TextSkeleton class="h-12 w-full rounded-md" />}
            >
              <div class="rounded-md bg-violet-50 p-3 text-sm text-violet-700">
                You are logged in as{" "}
                <strong class="font-semibold">{auth.user()?.name}</strong> (
                {auth.user()?.email})
              </div>
            </Suspense>

            <Show
              when={!invite.isError}
              fallback={
                <ErrorMessage title="Error" details="Couldn't load invite" />
              }
            >
              <div class="flex flex-col gap-5">
                <Suspense fallback={<TextSkeleton lines={3} class="gap-4" />}>
                  <div class="flex flex-col gap-3 text-sm">
                    <div class="flex items-center justify-between">
                      <span class="text-gray-500">Group</span>
                      <span class="font-semibold">
                        {invite.data?.group_name}
                      </span>
                    </div>

                    <div class="flex items-center justify-between">
                      <span class="text-gray-500">Invited by</span>
                      <span class="font-semibold">
                        {invite.data?.created_by_name}
                      </span>
                    </div>

                    <Show when={invite.data?.role}>
                      {(role) => (
                        <div class="flex items-center justify-between">
                          <span class="text-gray-500">Role</span>
                          <RoleTag role={role()} />
                        </div>
                      )}
                    </Show>
                  </div>

                  <Show when={invite.data?.is_current_user_member}>
                    <div class="rounded-md bg-violet-50 p-3 text-sm text-violet-700">
                      You are already a member of this group!
                    </div>
                  </Show>
                </Suspense>
              </div>

              <Suspense fallback={<ButtonSkeleton class="h-10 w-full" />}>
                <Button
                  class="mt-2 w-full"
                  onClick={handleAccept}
                  loading={acceptInvite.isPending}
                >
                  {invite.data?.is_current_user_member
                    ? "Go to group"
                    : "Accept invite"}
                </Button>
              </Suspense>
            </Show>
          </div>
        </div>
      </Container>
    </Page>
  );
};
