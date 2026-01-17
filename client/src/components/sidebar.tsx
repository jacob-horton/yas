import { A, createAsync, query, useLocation } from "@solidjs/router";
import type { LucideProps } from "lucide-solid";
import PlusIcon from "lucide-solid/icons/plus";
import SlidersHorizontalIcon from "lucide-solid/icons/sliders-horizontal";
import NotebookTextIcon from "lucide-solid/icons/notebook-text";
import UsersIcon from "lucide-solid/icons/users";
import GamePadIcon from "lucide-solid/icons/gamepad-2";
import { type Component, createSignal, For } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { api } from "../api";
import { useAuth } from "../auth/auth-provider";
import { Dropdown } from "./dropdown";

export const GROUPS_QUERY_KEY = "myGroups";
export const GAMES_QUERY_KEY = "games";

export const getGroups = query(async () => {
  // TODO: try/catch
  const res = await api.get("/users/me/groups");
  return res.data as {
    id: string;
    name: string;
    created_at: string;
  }[];
}, GROUPS_QUERY_KEY);

type Game = {
  id: string;
  name: string;
  group_id: string;
  created_at: string;
  players_per_match: number;
};

export const getGames = query(async (id: string) => {
  // TODO: try/catch
  const res = await api.get(`/groups/${id}/games`);
  return res.data as Game[];
}, GAMES_QUERY_KEY);

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
      class="flex items-center gap-2 rounded-md px-2 py-1 transition hover:bg-gray-50"
      classList={{
        "bg-violet-50 text-violet-800 hover:bg-violet-100":
          location.pathname === props.href,
      }}
    >
      <props.icon size={18} />
      {props.name}
    </A>
  );
};

export const Sidebar: Component = () => {
  const { user } = useAuth();
  const groups = createAsync(() => getGroups());

  const [currentGroup, setCurrentGroup] = createSignal<string | null>(null);

  // TODO: suspense properly
  const games = createAsync(async () => {
    const group = currentGroup();
    if (!group) {
      return [];
    }

    return getGames(group);
  });

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
      <Dropdown
        label="Group"
        // TODO: default value
        value={currentGroup() ?? ""}
        onChange={setCurrentGroup}
        options={groups()?.map((g) => ({ label: g.name, value: g.id })) ?? []}
      />

      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-1">
          <span class="flex items-center gap-3 px-2 text-gray-300 text-sm">
            <SlidersHorizontalIcon size={18} />
            <p class="font-semibold">MANAGE GROUP</p>
            <div class="flex-grow border-t" />
          </span>

          <NavItem name="Details" href="/details" icon={NotebookTextIcon} />
          <NavItem name="Members" href="/members" icon={UsersIcon} />
        </div>

        <div class="flex flex-col gap-1">
          <span class="flex items-center gap-3 px-2 text-gray-300 text-sm">
            <GamePadIcon size={18} />
            <p class="font-semibold">GAMES</p>
            <div class="flex-grow border-t" />
          </span>

          <For each={games()}>
            {(game) => (
              <NavItem
                href={`/games/${game.id}`}
                icon={PlusIcon}
                name={game.name}
              />
            )}
          </For>

          <NavItem href="/games/create" icon={PlusIcon} name="Create game" />
        </div>
      </div>
    </nav>
  );
};
