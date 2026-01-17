import { useAuth } from "../auth/auth-provider";
import { Button } from "../components/button";
import { Page } from "../components/page";

export function Settings() {
  const auth = useAuth();

  return (
    <Page title="Settings">
      <Button onClick={auth.logout}>Logout</Button>
    </Page>
  );
}
