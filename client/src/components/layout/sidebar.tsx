import { A, useLocation, useNavigate } from "@solidjs/router";
import GamePadIcon from "lucide-solid/icons/gamepad-2";
import MailPlusIcon from "lucide-solid/icons/mail-plus";
import NotebookTextIcon from "lucide-solid/icons/notebook-text";
import PlusIcon from "lucide-solid/icons/plus";
import SettingsIcon from "lucide-solid/icons/settings";
import SlidersHorizontalIcon from "lucide-solid/icons/sliders-horizontal";
import UsersIcon from "lucide-solid/icons/users";
import XIcon from "lucide-solid/icons/x";
import {
  type Component,
  createEffect,
  For,
  Index,
  on,
  Show,
  Suspense,
} from "solid-js";
import { useSidebar } from "@/context/sidebar-context";
import { Authorised } from "@/features/auth/components/authorised";
import { useAuth } from "@/features/auth/context/auth-provider";
import { useGroup } from "@/features/groups/context/group-provider";
import { useGroupGames } from "@/features/groups/hooks/use-group-games";
import { useMyGroups } from "@/features/users/hooks/use-my-groups";
import { cn } from "@/lib/classname";
import { Avatar } from "../ui/avatar";
import { AvatarSkeleton } from "../ui/avatar.skeleton";
import { Button } from "../ui/button";
import { Dropdown } from "../ui/dropdown";
import { NavItem } from "../ui/nav-item";
import { NavItemSkeleton } from "../ui/nav-item.skeleton";
import { PreloadLink } from "../ui/preload-link";

export const Sidebar: Component = () => {
  const { user } = useAuth();
  const groups = useMyGroups();

  const group = useGroup();
  const games = useGroupGames(group.groupId);

  const navigate = useNavigate();
  const location = useLocation();

  const { isOpen, setIsOpen, isDesktop } = useSidebar();

  // Close sidebar when route changes
  createEffect(
    on(
      () => location.pathname,
      () => {
        if (!isDesktop() && isOpen()) {
          setIsOpen(false);
        }
      },
      { defer: true },
    ),
  );

  return (
    <>
      <Show when={isOpen() && !isDesktop()}>
        <button
          type="button"
          tabindex="-1"
          class="fixed inset-0 z-20 h-full w-full cursor-default border-none bg-black/50 outline-none transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar overlay"
        />
      </Show>

      <nav
        class={cn(
          // max-w-[calc(100vw-4rem)] to ensure room for the close button
          "flex h-full w-80 max-w-[calc(100vw-4rem)] shrink-0 flex-col gap-4 border-gray-200 border-r bg-white p-4 dark:border-gray-600 dark:bg-gray-900",
          "transition-transform duration-300 ease-in-out",
          isDesktop() ? "static translate-x-0" : "fixed inset-y-0 left-0 z-30",
          !isDesktop() && !isOpen() && "-translate-x-full",
        )}
      >
        <Show when={!isDesktop()}>
          <button
            type="button"
            class={cn(
              "-right-12 absolute top-4 flex items-center justify-center p-2 text-white transition-all duration-300 hover:text-gray-200 dark:text-gray-400 dark:hover:text-white",
              isOpen() ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <XIcon size={24} />
          </button>
        </Show>

        <div class="flex items-center gap-3 overflow-clip px-2 py-4">
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
          <div class="flex min-w-0 flex-col">
            <p class="truncate font-semibold text-lg leading-tight">
              {user()?.name}
            </p>
            <span class="inline-flex min-w-0 max-w-full items-center font-semibold text-gray-300 text-xs leading-tight">
              <span class="min-w-0 max-w-max flex-1 truncate">
                {user()?.email?.split("@")[0]}
              </span>
              <span class="flex-none">@</span>
              <span class="min-w-0 max-w-max flex-1 truncate">
                {user()?.email?.split("@")[1]}
              </span>
            </span>
          </div>
          <PreloadLink
            href="/settings"
            class="ml-auto rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-500 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-400"
          >
            <SettingsIcon />
          </PreloadLink>
        </div>

        <div class="flex shrink-0 items-center gap-2 overflow-clip">
          <Dropdown
            label="Group"
            value={group.groupId() ?? ""}
            onChange={(group) => navigate(`/groups/${group}`)}
            options={
              groups.data?.map((g) => ({ label: g.name, value: g.id })) ?? []
            }
            class="w-full"
          />

          <Button variant="ghost" icon="plus" href="/groups/create" />
        </div>

        <div class="flex flex-col gap-6 overflow-clip whitespace-nowrap">
          <div class="flex flex-col gap-1">
            <span class="flex items-center gap-3 px-2 text-gray-400 text-sm dark:text-gray-500">
              <SlidersHorizontalIcon size={18} />
              <p class="font-semibold">MANAGE GROUP</p>
              <div class="flex-grow border-gray-200 border-t" />
            </span>

            <NavItem name="Details" href="" icon={NotebookTextIcon} end />
            <NavItem name="Members" href="members" icon={UsersIcon} />
            <Authorised minRole="admin">
              <NavItem name="Invites" href="invites" icon={MailPlusIcon} />
            </Authorised>
          </div>

          <div class="flex flex-col gap-1 overflow-clip whitespace-nowrap">
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
                {(game) => (
                  <NavItem href={`games/${game.id}`} name={game.name} />
                )}
              </For>
            </Suspense>

            <Authorised minRole="admin">
              <NavItem href="games/create" icon={PlusIcon} name="Create game" />
            </Authorised>
          </div>
        </div>
      </nav>
    </>
  );
};
