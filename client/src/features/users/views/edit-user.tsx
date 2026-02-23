import { useNavigate } from "@solidjs/router";
import { createSignal, For } from "solid-js";
import { FormPage } from "@/components/layout/form-page";
import {
  AVATAR_SVGS,
  Avatar,
  type AvatarColour,
  type AvatarIcon,
  COLOUR_MAP,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/toast-context";
import { useAuth } from "@/features/auth/context/auth-provider";
import { cn } from "@/lib/classname";
import { useUpdateUser } from "../hooks/use-update-user";

const COLOURS = Object.keys(COLOUR_MAP) as AvatarColour[];
const AVATARS = Object.keys(AVATAR_SVGS) as AvatarIcon[];

export const EditUser = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const toast = useToast();
  const updateUser = useUpdateUser();

  const [colour, setColour] = createSignal(
    auth.user()?.avatar_colour ?? COLOURS[0],
  );
  const [avatar, setAvatar] = createSignal(auth.user()?.avatar ?? AVATARS[0]);
  const [name, setName] = createSignal(auth.user()?.name ?? "");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    updateUser.mutate(
      {
        name: name(),
        avatar: avatar(),
        avatarColour: colour(),
      },
      {
        onSuccess: () => {
          toast.success({
            title: "User updated",
            description: "User updated successfully",
          });

          navigate("/");
        },
      },
    );
  };

  return (
    <FormPage title="Edit User" onSubmit={handleSubmit}>
      <Input
        label="Name"
        value={name()}
        onChange={setName}
        placeholder="User"
      />

      <div class="flex flex-wrap gap-2">
        <For each={COLOURS}>
          {(col) => (
            <button
              type="button"
              onClick={() => setColour(col)}
              class={cn(
                "size-12 cursor-pointer rounded-md border hover:border-black/15",
                { "border-transparent": col !== colour() },
                COLOUR_MAP[col].bg,
              )}
            />
          )}
        </For>
      </div>

      <div class="flex flex-wrap gap-2">
        <For each={AVATARS}>
          {(a) => (
            <button
              type="button"
              onClick={() => setAvatar(a)}
              class={cn(
                "cursor-pointer rounded-md border bg-gray-100 p-4 transition hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700",
                { "border-transparent": a !== avatar() },
              )}
            >
              <Avatar avatar={a} colour={colour()} class="size-20" />
            </button>
          )}
        </For>
      </div>

      <div class="flex gap-4">
        <Button type="submit" loading={updateUser.isPending}>
          Save
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          loading={updateUser.isPending}
        >
          Cancel
        </Button>
      </div>
    </FormPage>
  );
};
