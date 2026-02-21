import { useNavigate, useParams } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import { type Component, createSignal, onMount, Show } from "solid-js";
import { Button } from "@/components/ui/button";
import { userKeys } from "@/features/users/hooks/query-keys";
import { authApi } from "../api";

export const VerifyEmail: Component = () => {
  const queryClient = useQueryClient();
  const params = useParams();
  const navigate = useNavigate();

  const [error, setError] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      await authApi.verifyEmail(params.token);
      await queryClient.invalidateQueries({ queryKey: userKeys.all });

      setLoading(false);

      setTimeout(() => navigate("/", { replace: true }), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  });

  return (
    <main class="flex min-h-screen flex-col items-center justify-center p-4">
      <Show when={loading()}>
        <div class="text-center">
          <p class="font-semibold text-xl">Verifying your email...</p>
          <p class="text-gray-500">
            Please wait while we finish setting up your account.
          </p>
        </div>
      </Show>

      <Show when={!loading() && !error()}>
        <div class="text-center text-green-600">
          <h2 class="font-bold text-2xl">Success!</h2>
          <p>Your email has been verified. Redirecting you home...</p>
        </div>
      </Show>

      <Show when={error()}>
        <div class="flex flex-col items-center gap-4 text-center">
          <div>
            <h2 class="font-bold text-2xl text-red-600">Verification Failed</h2>
            <p class="mt-2 text-gray-700">{error()}</p>
          </div>

          <Button type="button" onClick={() => navigate("/login")}>
            Back to Login
          </Button>
        </div>
      </Show>
    </main>
  );
};
