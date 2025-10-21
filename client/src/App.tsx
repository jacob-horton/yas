import { Route, Router } from "@solidjs/router";
import type { ParentComponent } from "solid-js";
import { AuthProvider } from "./auth/auth-provider";
import { ProtectedRoute } from "./auth/protected-route";
import { Sidebar } from "./components/sidebar";
import { CreateGroup } from "./pages/create-group";
import { Login } from "./pages/login";
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
        <Route path="/" component={Layout}>
          <Route path="/" component={Scoreboard} />
          <Route path="/groups/create" component={CreateGroup} />
          <Route path="/settings" component={Settings} />
        </Route>

        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Router>
    </AuthProvider>
  );
}
