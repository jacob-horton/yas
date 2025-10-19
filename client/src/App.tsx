import { Route, Router } from '@solidjs/router';
import { createSignal, type ParentComponent } from 'solid-js';
import { AuthProvider } from './auth/auth-provider';
import { ProtectedRoute } from './auth/protected-route';
import { Sidebar, SidebarContext } from './components/sidebar';
import { Login } from './pages/login';
import { Register } from './pages/register';
import { Scoreboard } from './pages/scoreboard';
import { Settings } from './pages/settings';

const Layout: ParentComponent = (props) => {
  const [showSidebar, setShowSidebar] = createSignal(false);

  return (
    <div class="flex h-screen max-h-screen min-h-screen">
      <ProtectedRoute>
        <SidebarContext.Provider value={{ showSidebar, setShowSidebar }}>
          <Sidebar />
          <main class="h-full w-full">{props.children}</main>
        </SidebarContext.Provider>
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
          <Route path="/settings" component={Settings} />
        </Route>

        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Router>
    </AuthProvider>
  );
}
