import { Route, Router } from '@solidjs/router';
import { Scoreboard } from './pages/scoreboard';
import { Settings } from './pages/settings';

export default function App() {
  return (
    <Router>
      <Route path="/" component={Scoreboard} />
      <Route path="/settings" component={Settings} />
    </Router>
  );
}
