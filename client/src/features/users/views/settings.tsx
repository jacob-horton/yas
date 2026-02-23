import { Container } from "@/components/layout/container";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/auth-provider";

export const UserSettings = () => {
  const auth = useAuth();

  return (
    <Page title="User Settings" showBack narrow>
      <Container narrow class="flex flex-col gap-4">
        <Button href="/me/edit" variant="secondary" icon="edit">
          Edit details
        </Button>
        <Button href="/me/email" variant="secondary" icon="atSign">
          Change email
        </Button>
        <Button href="/me/password" variant="secondary" icon="lockKeyhole">
          Change password
        </Button>
        <Button onClick={auth.logout} icon="logOut" variant="secondary" danger>
          Logout
        </Button>
      </Container>
    </Page>
  );
};
