import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/auth-provider";

export function UserSettings() {
  const auth = useAuth();

  return (
    <Page title="User Settings" showBack narrow>
      <Button onClick={auth.logout}>Logout</Button>
    </Page>
  );
}
