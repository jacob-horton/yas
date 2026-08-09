import AtSignIcon from "lucide-solid/icons/at-sign";
import LockKeyholeIcon from "lucide-solid/icons/lock-keyhole";
import LogOutIcon from "lucide-solid/icons/log-out";
import EditIcon from "lucide-solid/icons/square-pen";
import { Container } from "@/components/layout/container";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/auth-provider";

export const UserSettings = () => {
  const auth = useAuth();

  return (
    <Page title="User Settings" showBack narrow>
      <Container narrow class="flex flex-col gap-4">
        <Button href="/me/edit" variant="secondary" icon={EditIcon}>
          Edit details
        </Button>
        <Button href="/me/email" variant="secondary" icon={AtSignIcon}>
          Change email
        </Button>
        <Button href="/me/password" variant="secondary" icon={LockKeyholeIcon}>
          Change password
        </Button>
        <Button
          onClick={auth.logout}
          icon={LogOutIcon}
          variant="secondary"
          danger
        >
          Logout
        </Button>
      </Container>
    </Page>
  );
};
