import { A, useNavigate } from "@solidjs/router";
import type { LucideProps } from "lucide-solid";
import GamePadIcon from "lucide-solid/icons/gamepad-2";
import MailPlusIcon from "lucide-solid/icons/mail-plus";
import NotebookTextIcon from "lucide-solid/icons/notebook-text";
import PlusIcon from "lucide-solid/icons/plus";
import SettingsIcon from "lucide-solid/icons/settings";
import SlidersHorizontalIcon from "lucide-solid/icons/sliders-horizontal";
import UsersIcon from "lucide-solid/icons/users";
import { type Component, For, Show } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { useAuth } from "@/features/auth/context/auth-provider";
import { useGroup } from "@/features/groups/context/group-provider";
import { useGroupGames } from "@/features/groups/hooks/use-group-games";
import { useMyGroups } from "@/features/users/hooks/use-my-groups";
import { Dropdown } from "../ui/dropdown";

type Route = {
  href: string;
  name: string;
  icon?: (props: LucideProps) => JSX.Element;
  end?: boolean; // Whether path has to be exact
};

const NavItem: Component<Route> = (props) => {
  return (
    <A
      href={props.href}
      end={props.end}
      class="flex items-center gap-2 rounded-md px-2 py-1 transition hover:bg-gray-50"
      activeClass="bg-violet-50 text-violet-800 hover:bg-violet-100"
    >
      <Show when={props.icon}>{props.icon?.({ size: 18 })}</Show>
      {props.name}
    </A>
  );
};

export const Sidebar: Component = () => {
  // TODO: what if no group - types say it's always defined
  const { user } = useAuth();
  const groups = useMyGroups();

  const group = useGroup();
  const games = useGroupGames(group);

  const navigate = useNavigate();

  return (
    <nav class="flex h-full w-80 min-w-80 flex-col gap-4 border-gray-200 border-r p-4 text-gray-800">
      <div class="flex items-center gap-3 px-2 py-4">
        <div class="flex size-10 min-h-10 min-w-10 items-center justify-center rounded-full border">
          <div class="size-5 rounded-full bg-gray-300" />
        </div>
        <div class="flex flex-col">
          <p class="font-semibold text-xl leading-tight">{user()?.name}</p>
          <p class="font-semibold text-gray-300 text-xs leading-tight">
            {user()?.email}
          </p>
        </div>
        <A
          href="/settings"
          class="ml-auto rounded-md px-2 py-1 text-gray-300 transition hover:bg-gray-50 hover:text-gray-400"
        >
          <SettingsIcon />
        </A>
      </div>
      <Dropdown
        label="Group"
        // TODO: default value
        value={group() ?? ""}
        onChange={(group) => navigate(`/groups/${group}`)}
        options={groups()?.map((g) => ({ label: g.name, value: g.id })) ?? []}
      />

      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-1">
          <span class="flex items-center gap-3 px-2 text-gray-300 text-sm">
            <SlidersHorizontalIcon size={18} />
            <p class="font-semibold">MANAGE GROUP</p>
            <div class="flex-grow border-t" />
          </span>

          <NavItem name="Details" href="" icon={NotebookTextIcon} end />
          <NavItem name="Members" href="members" icon={UsersIcon} />
          <NavItem name="Invites" href="invites" icon={MailPlusIcon} />
        </div>

        <div class="flex flex-col gap-1">
          <span class="flex items-center gap-3 px-2 text-gray-300 text-sm">
            <GamePadIcon size={18} />
            <p class="font-semibold">GAMES</p>
            <div class="flex-grow border-t" />
          </span>

          <For each={games()}>
            {(game) => <NavItem href={`games/${game.id}`} name={game.name} />}
          </For>

          <NavItem href="games/create" icon={PlusIcon} name="Create game" />
        </div>
      </div>
    </nav>
  );
};
