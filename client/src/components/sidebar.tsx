import { A, createAsync, query, useLocation } from "@solidjs/router";
import { createSignal, For, Show, type Component } from "solid-js";

import type { LucideProps } from "lucide-solid";
import ChevronRightIcon from "lucide-solid/icons/chevron-right";
import HouseIcon from "lucide-solid/icons/house";
import PlusIcon from "lucide-solid/icons/plus";
import SettingsIcon from "lucide-solid/icons/settings";
import UsersIcon from "lucide-solid/icons/users";
import type { JSX } from "solid-js/jsx-runtime";
import { api } from "../api";
import { useAuth } from "../auth/auth-provider";

export const SCOREBOARD_QUERY_KEY = "myScoreboards";

export const getGroups = query(async () => {
  // TODO: try/catch
  const res = await api.get("/me/scoreboards");
  return res.data as {
    group: { id: number; name: string; created_at: string };
    scoreboards: { id: number; name: string; players_per_game: number }[];
  }[];
}, SCOREBOARD_QUERY_KEY);

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
      class="flex items-center gap-2 rounded-md px-2 py-1 transition hover:bg-gray-100"
      classList={{
        "bg-violet-300 text-violet-800 hover:bg-violet-200":
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

  // Toggle states - if in set, it's open
  const [openGroups, setOpenGroups] = createSignal<Set<number>>(new Set());

  function toggleGroup(id: number) {
    setOpenGroups((prev) => {
      const newSet = new Set(prev); // copy to trigger reactivity
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  return (
    <nav class="flex h-full w-80 min-w-80 flex-col gap-4 border-gray-200 border-r p-4 text-gray-800">
      <span class="flex items-center gap-3 px-2 py-4">
        <div class="flex size-10 min-h-10 min-w-10 items-center justify-center rounded-full border">
          <div class="size-5 rounded-full bg-gray-300" />
        </div>
        <div class="flex flex-col">
          <p class="font-semibold text-xl leading-tight">{user()?.name}</p>
          <p class="font-semibold text-gray-300 text-xs leading-tight">
            {user()?.email}
          </p>
        </div>
      </span>
      <div class="flex h-full flex-col justify-between">
        <div class="flex flex-col gap-2">
          <span class="flex items-center gap-3 text-gray-300 text-sm">
            <UsersIcon size={18} />
            <p class="font-semibold">GROUPS</p>
            <div class="flex-grow border-t" />
          </span>
          <ul class="flex flex-col gap-2">
            <For each={groups()}>
              {(group) => (
                <li>
                  <div class="flex items-center text-gray-300">
                    <button
                      class="flex w-full items-center gap-2 hover:cursor-pointer"
                      type="button"
                      onclick={() => toggleGroup(group.group.id)}
                    >
                      <ChevronRightIcon
                        stroke-width={1.5}
                        classList={{
                          "rotate-90": openGroups().has(group.group.id),
                        }}
                        class="rotate-0 transition"
                      />
                      <p>{group.group.name}</p>
                    </button>
                    <A
                      href={`/scoreboards/create?group=${group.group.id}`}
                      class="rounded-sm transition hover:cursor-pointer hover:bg-gray-50"
                    >
                      <PlusIcon stroke-width={1.5} size={18} />
                    </A>
                  </div>
                  <Show when={openGroups().has(group.group.id)}>
                    <ul class="my-2 ms-6 flex flex-col gap-1">
                      <For
                        each={group.scoreboards}
                        fallback={
                          <span class="text-gray-300">No scoreboards yet</span>
                        }
                      >
                        {(scoreboard) => (
                          <li>
                            <NavItem
                              href={`/scoreboards/${scoreboard.id}`}
                              icon={HouseIcon}
                              name={scoreboard.name}
                            />
                          </li>
                        )}
                      </For>
                    </ul>
                  </Show>
                </li>
              )}
            </For>
          </ul>

          <span class="flex items-center gap-3 text-gray-300 text-sm">
            <SettingsIcon size={18} />
            <p class="font-semibold">CONFIGURATION</p>
            <div class="flex-grow border-t" />
          </span>
          <ul class="flex flex-col gap-1">
            <li>
              <NavItem
                href="/groups/create"
                icon={PlusIcon}
                name="Create group"
              />
            </li>
            <li>
              <NavItem
                href="/scoreboards/create"
                icon={PlusIcon}
                name="Create scoreboard"
              />
            </li>
          </ul>
        </div>

        <NavItem name="Settings" href="/settings" icon={SettingsIcon} />
      </div>
    </nav>
  );
};
