import { A } from "@solidjs/router";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/auth-provider";

export const UserSettings = () => {
  const auth = useAuth();

  return (
    <Page title="User Settings" showBack narrow>
      <div class="flex flex-col gap-4">
        <A
          href="/me/edit"
          class="h-8 w-fit rounded-md bg-violet-500 px-6 py-1 font-medium text-white"
        >
          Edit Details
        </A>
        <Button onClick={auth.logout}>Logout</Button>
      </div>
    </Page>
  );
};
