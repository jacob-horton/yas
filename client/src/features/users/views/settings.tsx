import { A } from "@solidjs/router";
import { Container } from "@/components/layout/container";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/auth-provider";

export const UserSettings = () => {
  const auth = useAuth();

  return (
    <Page title="User Settings" showBack>
      <Container narrow class="flex flex-col gap-4">
        <A
          href="/me/edit"
          class="h-8 w-fit rounded-md bg-violet-500 px-6 py-1 font-semibold text-white"
        >
          Edit Details
        </A>
        <Button onClick={auth.logout}>Logout</Button>
      </Container>
    </Page>
  );
};
