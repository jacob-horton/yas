import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import AuthenticationSvg from "@/assets/empty-states/authentication.svg";
import HelloSvg from "@/assets/empty-states/hello.svg";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/context/toast-context";
import { useAuth } from "@/features/auth/context/auth-provider";
import { useMyGroups } from "@/features/users/hooks/use-my-groups";
import { useResendVerification } from "@/features/users/hooks/use-resend-verification";
import { LS_LAST_GROUP_ID } from "../constants";

const WAIT_TIME = 60;

export const HomePage = () => {
  const navigate = useNavigate();
  const groups = useMyGroups();
  const auth = useAuth();

  const toast = useToast();
  const resendVerification = useResendVerification();

  const [timeLeft, setTimeLeft] = createSignal(WAIT_TIME);
  createEffect(() => {
    if (timeLeft() > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      onCleanup(() => clearTimeout(timer));
    }
  });

  const submitReverification = () => {
    resendVerification.mutate(undefined, {
      onSuccess: () => {
        setTimeLeft(WAIT_TIME);
        toast.success({
          title: "Sent",
          description: "Email successfully sent!",
        });
      },
    });
  };

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

  const getButtonText = () => {
    if (resendVerification.isPending) return "Sending...";
    if (timeLeft() > 0) return `Resend in ${timeLeft()}s`;
    return "Resend email";
  };

  // Once checked groups - if none, show welcome page
  return (
    <Show
      when={groups.data?.length === 0}
      fallback={<div class="p-10">Loading...</div>}
    >
      <div class="flex h-full flex-col items-center justify-center">
        <Show
          when={auth.user()?.email_verified}
          fallback={
            <EmptyState
              title="Welcome!"
              img={AuthenticationSvg}
              class="flex flex-col gap-8"
            >
              <p class="w-2/3 text-center">
                Your email isn't verified yet. Please verify it to continue. If
                you haven't received the email by now, please first check your
                spam. If it's not there, you can request a new verification
                email
                <Show when={timeLeft() > 0} fallback={<span> below.</span>}>
                  <span>
                    {" "}
                    in{" "}
                    <span class="font-mono font-semibold">{timeLeft()}s</span>.
                  </span>
                </Show>
              </p>

              <Button
                onClick={submitReverification}
                disabled={timeLeft() > 0 || resendVerification.isPending}
              >
                {getButtonText()}
              </Button>
            </EmptyState>
          }
        >
          <EmptyState
            title="Welcome!"
            img={HelloSvg}
            class="flex flex-col gap-8"
          >
            <p class="w-2/3 text-center">
              You aren't in any groups yet. Get started by creating your own
              group or using an invite to join another group
            </p>
            <Button href="/groups/create">Create your first group</Button>
          </EmptyState>
        </Show>
      </div>
    </Show>
  );
};
