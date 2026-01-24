import { Route, Router } from "@solidjs/router";
import type { ParentComponent } from "solid-js";
import { Sidebar } from "@/components/layout/sidebar";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { AuthProvider } from "@/features/auth/context/auth-provider";
import { Login } from "@/features/auth/views/login";
import { Register } from "@/features/auth/views/register";
import { CreateGame } from "@/features/games/views/create-game";
import { Scoreboard } from "@/features/games/views/scoreboard";
import { GroupProvider } from "@/features/groups/context/group-provider";
import { CreateGroup } from "@/features/groups/views/create-group";
import { GroupDetails } from "@/features/groups/views/group-details";
import { Invites } from "@/features/groups/views/group-invites";
import { GroupMembers } from "@/features/groups/views/group-members";
import { AcceptInvite } from "@/features/invites/views/accept-invite";
import { CreateInvite } from "@/features/invites/views/create-invite";
import { RecordGame } from "@/features/matches/views/record-match";
import { UserSettings } from "@/features/users/views/settings";
import { HomePage } from "@/pages/home-page";

const WithSidebar: ParentComponent = (props) => {
  return (
    <div class="flex h-screen max-h-screen min-h-screen">
      <GroupProvider>
        <Sidebar />
        <main class="h-full w-full">{props.children}</main>
      </GroupProvider>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Protected routes */}
        <Route path="/" component={ProtectedRoute}>
          <Route path="/groups/:groupId" component={WithSidebar}>
            <Route path="/" component={GroupDetails} />
            <Route path="/members" component={GroupMembers} />

            <Route path="/games/:gameId" component={Scoreboard} />
            <Route path="/games/:gameId/record" component={RecordGame} />
            <Route path="/games/create" component={CreateGame} />

            <Route path="/invites" component={Invites} />
            <Route path="/invites/create" component={CreateInvite} />
          </Route>

          <Route path="/" component={HomePage} />
          <Route path="/groups/create" component={CreateGroup} />
          <Route path="/settings" component={UserSettings} />

          <Route path="/invites/:inviteId/accept" component={AcceptInvite} />
        </Route>

        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Router>
    </AuthProvider>
  );
}
