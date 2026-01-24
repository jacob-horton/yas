import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/auth-provider";

export function Settings() {
  const auth = useAuth();

  return (
    <Page title="Settings">
      <Button onClick={auth.logout}>Logout</Button>
    </Page>
  );
}
