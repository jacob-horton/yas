import { Navigate, Route, Router } from "@solidjs/router";
import type { ParentComponent } from "solid-js";
import { AuthProvider } from "./auth/auth-provider";
import { ProtectedRoute } from "./auth/protected-route";
import { Sidebar } from "./components/sidebar";
import { CreateGroup } from "./pages/create-group";
import { CreateGame } from "./pages/create-game";
import { Login } from "./pages/login";
import { RecordGame } from "./pages/record-game";
import { Register } from "./pages/register";
import { Scoreboard } from "./pages/scoreboard";
import { Settings } from "./pages/settings";
import { GroupProvider } from "./group-provider";
import { GroupDetails } from "./pages/group-details";
import { GroupMembers } from "./pages/group-members";
import { HomePage } from "./pages/home-page";

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
  // TODO: fix creating group and group provider wrapper
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
            <Route path="/settings" component={Settings} />
          </Route>

          {/* TODO: home/welcome page */}
          <Route path="/" component={HomePage} />
          <Route path="/groups/create" component={CreateGroup} />
        </Route>

        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Router>
    </AuthProvider>
  );
}
