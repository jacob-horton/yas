import { Route, Router } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import type { ParentComponent } from "solid-js";
import { requireRole } from "@/components/layout/authorised-route";
import { Sidebar } from "@/components/layout/sidebar";
import { ConfirmationProvider } from "@/context/confirmation-context";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { AuthProvider } from "@/features/auth/context/auth-provider";
import { Login } from "@/features/auth/views/login";
import { Register } from "@/features/auth/views/register";
import { VerifyEmail } from "@/features/auth/views/verify-email";
import { CreateGame } from "@/features/games/views/create-game";
import { EditGame } from "@/features/games/views/edit-game";
import { Scoreboard } from "@/features/games/views/scoreboard";
import { GroupProvider } from "@/features/groups/context/group-provider";
import { CreateGroup } from "@/features/groups/views/create-group";
import { EditGroup } from "@/features/groups/views/edit-group";
import { GroupDetails } from "@/features/groups/views/group-details";
import { Invites } from "@/features/groups/views/group-invites";
import { GroupMembers } from "@/features/groups/views/group-members";
import { AcceptInvite } from "@/features/invites/views/accept-invite";
import { CreateInvite } from "@/features/invites/views/create-invite";
import { RecordGame } from "@/features/matches/views/record-match";
import { PlayerStats } from "@/features/stats/views/player-stats";
import { EditPassword } from "@/features/users/views/edit-password";
import { EditUser } from "@/features/users/views/edit-user";
import { UserSettings } from "@/features/users/views/settings";
import { HomePage } from "@/pages/home-page";

const queryClient = new QueryClient();

const WithSidebar: ParentComponent = (props) => {
  return (
    <div class="flex h-full">
      <GroupProvider>
        <Sidebar />
        <main class="h-full min-w-0 flex-1">{props.children}</main>
      </GroupProvider>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ConfirmationProvider>
          <div class="flex h-screen max-h-screen min-h-screen w-full flex-col overflow-hidden bg-white dark:bg-gray-900">
            <Router>
              {/* Protected routes - must be logged in */}
              <Route path="/" component={ProtectedRoute}>
                <Route path="/groups/:groupId" component={WithSidebar}>
                  <Route path="/" component={GroupDetails} />
                  <Route path="/members" component={GroupMembers} />
                  <Route path="/invites" component={Invites} />
                  <Route path="/games/:gameId" component={Scoreboard} />
                  <Route
                    path="/games/:gameId/player/:playerId"
                    component={PlayerStats}
                  />

                  {/* Admin routes */}
                  <Route component={requireRole("admin")}>
                    <Route path="/edit" component={EditGroup} />
                    <Route path="/games/create" component={CreateGame} />
                    <Route path="/games/:gameId/edit" component={EditGame} />
                    <Route path="/invites/create" component={CreateInvite} />
                  </Route>

                  {/* Member routes */}
                  <Route component={requireRole("member")}>
                    <Route
                      path="/games/:gameId/record"
                      component={RecordGame}
                    />
                  </Route>
                </Route>

                <Route path="/" component={HomePage} />
                <Route path="/settings" component={UserSettings} />

                <Route path="/groups/create" component={CreateGroup} />

                <Route path="/me/edit" component={EditUser} />
                <Route path="/me/password" component={EditPassword} />

                <Route
                  path="/invites/:inviteId/accept"
                  component={AcceptInvite}
                />
              </Route>

              <Route path="/verify-email/:token" component={VerifyEmail} />

              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
            </Router>
          </div>
        </ConfirmationProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
