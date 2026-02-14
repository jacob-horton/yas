import { A, useNavigate } from "@solidjs/router";
import GamePadIcon from "lucide-solid/icons/gamepad-2";
import MailPlusIcon from "lucide-solid/icons/mail-plus";
import NotebookTextIcon from "lucide-solid/icons/notebook-text";
import PlusIcon from "lucide-solid/icons/plus";
import SettingsIcon from "lucide-solid/icons/settings";
import SlidersHorizontalIcon from "lucide-solid/icons/sliders-horizontal";
import UsersIcon from "lucide-solid/icons/users";
import { type Component, For, Index, Show, Suspense } from "solid-js";
import { Authorised } from "@/features/auth/components/authorised";
import { useAuth } from "@/features/auth/context/auth-provider";
import { useGroup } from "@/features/groups/context/group-provider";
import { useGroupGames } from "@/features/groups/hooks/use-group-games";
import { useMyGroups } from "@/features/users/hooks/use-my-groups";
import { Avatar } from "../ui/avatar";
import { AvatarSkeleton } from "../ui/avatar.skeleton";
import { Button } from "../ui/button";
import { Dropdown } from "../ui/dropdown";
import { NavItem } from "../ui/nav-item";
import { NavItemSkeleton } from "../ui/nav-item.skeleton";

export const Sidebar: Component = () => {
  const { user } = useAuth();
  const groups = useMyGroups();

  const group = useGroup();
  const games = useGroupGames(group.groupId);

  const navigate = useNavigate();

  return (
    <nav class="flex h-full w-80 min-w-80 shrink-0 flex-col gap-4 border-gray-200 border-r bg-white p-4 dark:border-gray-600 dark:bg-gray-900">
      <div class="flex items-center gap-3 px-2 py-4">
        <div class="flex size-10 min-h-10 min-w-10 items-center justify-center rounded-full border p-1">
          <Suspense fallback={<AvatarSkeleton />}>
            <Show when={user()}>
              {(user) => (
                <Avatar
                  avatar={user()?.avatar}
                  colour={user()?.avatar_colour}
                />
              )}
            </Show>
          </Suspense>
        </div>
        <div class="flex flex-col">
          <p class="font-semibold text-xl leading-tight">{user()?.name}</p>
          <p class="font-semibold text-gray-300 text-xs leading-tight">
            {user()?.email}
          </p>
        </div>
        <A
          href="/settings"
          class="ml-auto rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-500 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-400"
        >
          <SettingsIcon />
        </A>
      </div>

      <div class="flex items-center gap-2">
        <Dropdown
          label="Group"
          // TODO: default value
          value={group.groupId() ?? ""}
          onChange={(group) => navigate(`/groups/${group}`)}
          options={
            groups.data?.map((g) => ({ label: g.name, value: g.id })) ?? []
          }
          class="w-full"
        />

        <Button
          variant="ghost"
          icon="plus"
          onClick={() => navigate("/groups/create")}
        />
      </div>

      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-1">
          <span class="flex items-center gap-3 px-2 text-gray-400 text-sm dark:text-gray-500">
            <SlidersHorizontalIcon size={18} />
            <p class="font-semibold">MANAGE GROUP</p>
            <div class="flex-grow border-gray-200 border-t" />
          </span>

          <NavItem name="Details" href="" icon={NotebookTextIcon} end />
          <NavItem name="Members" href="members" icon={UsersIcon} />
          <NavItem name="Invites" href="invites" icon={MailPlusIcon} />
        </div>

        <div class="flex flex-col gap-1">
          <span class="flex items-center gap-3 px-2 text-gray-400 text-sm dark:text-gray-500">
            <GamePadIcon size={18} />
            <p class="font-semibold">GAMES</p>
            <div class="flex-grow border-gray-200 border-t" />
          </span>

          <Suspense
            fallback={
              <Index each={Array.from({ length: 3 })}>
                {() => <NavItemSkeleton />}
              </Index>
            }
          >
            <For each={games.data}>
              {(game) => <NavItem href={`games/${game.id}`} name={game.name} />}
            </For>
          </Suspense>

          <Authorised minRole="admin">
            <NavItem href="games/create" icon={PlusIcon} name="Create game" />
          </Authorised>
        </div>
      </div>
    </nav>
  );
};
