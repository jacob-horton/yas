import { Route, Router } from "@solidjs/router";
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

const Layout: ParentComponent = (props) => {
  return (
    <div class="flex h-screen max-h-screen min-h-screen">
      <ProtectedRoute>
        <Sidebar />
        <main class="h-full w-full">{props.children}</main>
      </ProtectedRoute>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Protected routes */}
        <Route path="/" component={Layout}>
          {/* TODO: home/welcome page */}
          <Route path="/" component={Settings} />
          <Route path="/games/:id/scoreboard" component={Scoreboard} />
          <Route path="/games/:id/record" component={RecordGame} />

          <Route path="/games/create" component={CreateGame} />
          <Route path="/groups/create" component={CreateGroup} />
          <Route path="/settings" component={Settings} />
        </Route>

        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Router>
    </AuthProvider>
  );
}
