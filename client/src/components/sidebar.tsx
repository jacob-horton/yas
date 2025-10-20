import { A, createAsync, query, useLocation } from '@solidjs/router';
import { For, type Component } from 'solid-js';

import type { LucideProps } from 'lucide-solid';
import HouseIcon from 'lucide-solid/icons/house';
import SettingsIcon from 'lucide-solid/icons/settings';
import UsersIcon from 'lucide-solid/icons/users';
import type { JSX } from 'solid-js/jsx-runtime';
import { api } from '../api';
import { useAuth } from '../auth/auth-provider';

export const getGroups = query(async () => {
  // TODO: try/catch
  const res = await api.get('/me/groups');
  return res.data as { id: number; name: string; created_at: string }[];
}, 'myGroups');

type Route = {
  href: string;
  name: string;
  icon: (props: LucideProps) => JSX.Element;
};

const NavItem: Component<Route> = (props) => {
  const location = useLocation();
  return (
    <A
      href={props.href}
      class="flex items-center gap-2 rounded-md px-2 py-1 transition hover:bg-gray-200"
      classList={{
        'bg-violet-300 text-violet-800 hover:bg-violet-200':
          location.pathname === props.href,
      }}
    >
      <props.icon size={18} />
      {props.name}
    </A>
  );
};

export const Sidebar: Component = () => {
  const { user } = useAuth()!;
  const groups = createAsync(() => getGroups());

  return (
    <nav class="flex h-full w-80 min-w-80 flex-col gap-4 border-r border-gray-200 p-4 text-gray-800">
      <span class="flex items-center gap-3 px-2 py-4">
        <div class="flex size-10 min-h-10 min-w-10 items-center justify-center rounded-full border">
          <div class="size-5 rounded-full bg-gray-300" />
        </div>
        <div class="flex flex-col">
          <p class="text-xl leading-tight font-semibold">{user()?.name}</p>
          <p class="text-xs leading-tight font-semibold text-gray-300">
            {user()?.email}
          </p>
        </div>
      </span>
      <div class="flex h-full flex-col justify-between">
        <div class="flex flex-col gap-2">
          <span class="flex items-center gap-3 text-sm text-gray-300">
            <UsersIcon size={18} />
            <p class="font-semibold">GROUPS</p>
            <div class="flex-grow border-t" />
          </span>
          <ul class="flex flex-col gap-1">
            <For each={groups()}>
              {(group) => (
                <li>
                  <NavItem
                    href={`/groups/${group.id}`}
                    icon={HouseIcon}
                    name={group.name}
                  />
                </li>
              )}
            </For>
          </ul>
        </div>

        <NavItem name="Settings" href="/settings" icon={SettingsIcon} />
      </div>
    </nav>
  );
};
