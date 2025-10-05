import { Route, Router } from '@solidjs/router';
import { createSignal, type ParentComponent } from 'solid-js';
import { Sidebar, SidebarContext } from './components/sidebar';
import { Scoreboard } from './pages/scoreboard';
import { Settings } from './pages/settings';

const Layout: ParentComponent = (props) => {
  const [showSidebar, setShowSidebar] = createSignal(false);

  return (
    <div class="flex h-screen max-h-screen min-h-screen">
      <SidebarContext.Provider value={{ showSidebar, setShowSidebar }}>
        <Sidebar />
        <main class="h-full w-full">{props.children}</main>
      </SidebarContext.Provider>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Route path="/" component={Layout}>
        <Route path="/" component={Scoreboard} />
        <Route path="/settings" component={Settings} />
      </Route>
    </Router>
  );
}
