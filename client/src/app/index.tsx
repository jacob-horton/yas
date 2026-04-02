import { Route, Router } from "@solidjs/router";
import { QueryClientProvider } from "@tanstack/solid-query";
import { lazy, type ParentComponent } from "solid-js";
import { Sidebar } from "@/components/layout/sidebar";
import { ConfirmationProvider } from "@/context/confirmation-context";
import { SidebarProvider } from "@/context/sidebar-context";
import { ToastProvider } from "@/context/toast-context";
import { requireRole } from "@/features/auth/components/authorised-route";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { AuthProvider } from "@/features/auth/context/auth-provider";
import { preloadEditGame, preloadScoreboard } from "@/features/games/preloads";
import { GroupProvider } from "@/features/groups/context/group-provider";
import {
  preloadGroupDetails,
  preloadGroupInvites,
  preloadGroupMembers,
} from "@/features/groups/preloads";
import { preloadHomePage } from "@/features/home/preloads";
import { preloadRecordMatch } from "@/features/matches/preloads";
import { preloadPlayerStats } from "@/features/stats/preloads";
import { queryClient } from "@/lib/query-client";

// Auth Views
const ForgotPassword = lazy(() =>
  import("@/features/auth/views/forgot-password").then((m) => ({
    default: m.ForgotPassword,
  })),
);
const Login = lazy(() =>
  import("@/features/auth/views/login").then((m) => ({ default: m.Login })),
);
const Register = lazy(() =>
  import("@/features/auth/views/register").then((m) => ({
    default: m.Register,
  })),
);
const ResetPassword = lazy(() =>
  import("@/features/auth/views/reset-password").then((m) => ({
    default: m.ResetPassword,
  })),
);
const VerifyEmail = lazy(() =>
  import("@/features/auth/views/verify-email").then((m) => ({
    default: m.VerifyEmail,
  })),
);

// Game Views
const CreateGame = lazy(() =>
  import("@/features/games/views/create-game").then((m) => ({
    default: m.CreateGame,
  })),
);
const EditGame = lazy(() =>
  import("@/features/games/views/edit-game").then((m) => ({
    default: m.EditGame,
  })),
);
const Scoreboard = lazy(() =>
  import("@/features/games/views/scoreboard").then((m) => ({
    default: m.Scoreboard,
  })),
);

// Group Views
const CreateGroup = lazy(() =>
  import("@/features/groups/views/create-group").then((m) => ({
    default: m.CreateGroup,
  })),
);
const EditGroup = lazy(() =>
  import("@/features/groups/views/edit-group").then((m) => ({
    default: m.EditGroup,
  })),
);
const GroupDetails = lazy(() =>
  import("@/features/groups/views/group-details").then((m) => ({
    default: m.GroupDetails,
  })),
);
const Invites = lazy(() =>
  import("@/features/groups/views/group-invites").then((m) => ({
    default: m.Invites,
  })),
);
const GroupMembers = lazy(() =>
  import("@/features/groups/views/group-members").then((m) => ({
    default: m.GroupMembers,
  })),
);

// Home & Invites
const HomePage = lazy(() =>
  import("@/features/home/views/home-page").then((m) => ({
    default: m.HomePage,
  })),
);
const AcceptInvite = lazy(() =>
  import("@/features/invites/views/accept-invite").then((m) => ({
    default: m.AcceptInvite,
  })),
);
const CreateInvite = lazy(() =>
  import("@/features/invites/views/create-invite").then((m) => ({
    default: m.CreateInvite,
  })),
);

// Matches, Stats, Users
const RecordMatch = lazy(() =>
  import("@/features/matches/views/record-match").then((m) => ({
    default: m.RecordMatch,
  })),
);
const PlayerStats = lazy(() =>
  import("@/features/stats/views/player-stats").then((m) => ({
    default: m.PlayerStats,
  })),
);
const EditEmail = lazy(() =>
  import("@/features/users/views/edit-email").then((m) => ({
    default: m.EditEmail,
  })),
);
const EditPassword = lazy(() =>
  import("@/features/users/views/edit-password").then((m) => ({
    default: m.EditPassword,
  })),
);
const EditUser = lazy(() =>
  import("@/features/users/views/edit-user").then((m) => ({
    default: m.EditUser,
  })),
);
const UserSettings = lazy(() =>
  import("@/features/users/views/settings").then((m) => ({
    default: m.UserSettings,
  })),
);

const WithSidebar: ParentComponent = (props) => {
  return (
    <div class="flex h-full">
      <GroupProvider>
        <SidebarProvider>
          <Sidebar />
          <main class="h-full min-w-0 flex-1">{props.children}</main>
        </SidebarProvider>
      </GroupProvider>
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ConfirmationProvider>
          <ToastProvider>
            <div class="flex h-screen max-h-screen min-h-screen w-full flex-col overflow-hidden bg-white dark:bg-gray-900">
              <Router>
                {/* Protected routes - must be logged in */}
                <Route path="/" component={ProtectedRoute}>
                  <Route path="/groups/:groupId" component={WithSidebar}>
                    <Route
                      path="/"
                      component={GroupDetails}
                      preload={preloadGroupDetails}
                    />
                    <Route
                      path="/members"
                      component={GroupMembers}
                      preload={preloadGroupMembers}
                    />
                    <Route
                      path="/invites"
                      component={Invites}
                      preload={preloadGroupInvites}
                    />
                    <Route
                      path="/games/:gameId"
                      component={Scoreboard}
                      preload={preloadScoreboard}
                    />
                    <Route
                      path="/games/:gameId/player/:playerId"
                      component={PlayerStats}
                      preload={preloadPlayerStats}
                    />

                    {/* Admin routes */}
                    <Route component={requireRole("admin")}>
                      <Route path="/edit" component={EditGroup} />
                      <Route path="/games/create" component={CreateGame} />
                      <Route
                        path="/games/:gameId/edit"
                        component={EditGame}
                        preload={preloadEditGame}
                      />
                      <Route path="/invites/create" component={CreateInvite} />
                    </Route>

                    {/* Member routes */}
                    <Route component={requireRole("member")}>
                      <Route
                        path="/games/:gameId/record"
                        component={RecordMatch}
                        preload={preloadRecordMatch}
                      />
                    </Route>
                  </Route>

                  <Route
                    path="/"
                    component={HomePage}
                    preload={preloadHomePage}
                  />
                  <Route path="/settings" component={UserSettings} />

                  <Route path="/groups/create" component={CreateGroup} />

                  <Route path="/me/edit" component={EditUser} />
                  <Route path="/me/password" component={EditPassword} />
                  <Route path="/me/email" component={EditEmail} />

                  <Route
                    path="/invites/:inviteId/accept"
                    component={AcceptInvite}
                  />
                </Route>

                <Route path="/verify-email/:token" component={VerifyEmail} />

                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
                <Route path="/forgot-password" component={ForgotPassword} />
                <Route
                  path="/reset-password/:token"
                  component={ResetPassword}
                />
              </Router>
            </div>
          </ToastProvider>
        </ConfirmationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
