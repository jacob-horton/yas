import { A, useLocation } from '@solidjs/router';
import type { Accessor, Setter } from 'solid-js';
import { createContext, For, useContext, type Component } from 'solid-js';

import HouseIcon from 'lucide-solid/icons/house';
import SettingsIcon from 'lucide-solid/icons/settings';

export const SidebarContext = createContext<{
  showSidebar: Accessor<boolean>;
  setShowSidebar: Setter<boolean>;
}>();

export const Sidebar: Component = () => {
  const { showSidebar, setShowSidebar } = useContext(SidebarContext)!;

  const location = useLocation();

  const routes = [
    {
      name: 'Home',
      href: '/',
      icon: HouseIcon,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: SettingsIcon,
    },
  ];

  return (
    <div
      class="absolute inset-0 z-30 flex transition-all"
      classList={{
        '-translate-x-56 invisible': !showSidebar(),
        'translate-x-0': showSidebar(),
      }}
    >
      <nav class="flex h-full w-56 min-w-56 flex-col gap-2 border-r border-gray-200 bg-gray-50 p-2 text-gray-800 shadow-lg">
        <h1 class="text-xl font-semibold">Scoreboard</h1>
        <ul class="flex flex-col gap-1">
          <For each={routes}>
            {(route) => (
              <li>
                <A
                  href={route.href}
                  class="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-200 transition"
                  classList={{
                    'bg-violet-300 text-violet-800 hover:bg-violet-200':
                      location.pathname === route.href,
                  }}
                  onClick={() => setShowSidebar(false)}
                >
                  <route.icon size={18} />
                  {route.name}
                </A>
              </li>
            )}
          </For>
        </ul>
      </nav>
      <div class="h-full w-full" onClick={() => setShowSidebar(false)} />
    </div>
  );
};
