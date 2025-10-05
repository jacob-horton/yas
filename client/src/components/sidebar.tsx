import { A, useLocation } from '@solidjs/router';
import { createContext, For, useContext, type Component } from 'solid-js';
import type { Accessor, Setter } from 'solid-js';
import { HouseIcon, SettingsIcon } from 'lucide-solid';

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
      class="absolute z-30 inset-0 flex transition-all"
      classList={{
        '-translate-x-56 invisible': !showSidebar(),
        'translate-x-0': showSidebar(),
      }}
    >
      <nav class="w-56 min-w-56 bg-gray-50 shadow-lg border-gray-200 border-r h-full p-2 text-gray-800 flex flex-col gap-2">
        <h1 class="font-semibold text-xl">Scoreboard</h1>
        <ul class="flex flex-col gap-1">
          <For each={routes}>
            {(route) => (
              <li>
                <A
                  href={route.href}
                  class="px-2 py-1 rounded-md flex gap-2 items-center hover:bg-gray-200"
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
