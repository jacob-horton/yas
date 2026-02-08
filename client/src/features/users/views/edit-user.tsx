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
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/context/auth-provider";
import { cn } from "@/lib/classname";
import { usersApi } from "../api";
import { capitaliseFirstLetter } from "@/lib/capitalise";

const COLOURS = Object.keys(COLOUR_MAP) as AvatarColour[];
const AVATARS = Object.keys(AVATAR_SVGS) as AvatarIcon[];

export const EditUser = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const [colour, setColour] = createSignal(
    auth.user()?.avatar_colour ?? COLOURS[0],
  );
  const [avatar, setAvatar] = createSignal(auth.user()?.avatar ?? AVATARS[0]);
  const [name, setName] = createSignal(auth.user()?.name ?? "");
  const [email, setEmail] = createSignal(auth.user()?.email ?? "");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    await usersApi.updateMe(name(), email(), avatar(), colour());
    await auth.revalidate();
    navigate("/");
  };

  return (
    <FormPage title="Edit User" onSubmit={handleSubmit}>
      <Input
        label="Name"
        value={name()}
        onChange={setName}
        placeholder="User"
      />
      <Input
        label="Email"
        value={email()}
        onChange={setEmail}
        placeholder="user@email.com"
      />

      <Dropdown
        label="Colour"
        value={colour()}
        onChange={setColour}
        options={COLOURS.map((col) => ({
          label: capitaliseFirstLetter(col),
          value: col,
        }))}
      />

      <div class="flex flex-wrap gap-2">
        <For each={AVATARS}>
          {(a) => (
            <button
              type="button"
              onClick={() => setAvatar(a)}
              class={cn(
                "cursor-pointer rounded-md border bg-gray-100 p-4 hover:bg-gray-200",
                { "border-transparent": a !== avatar() },
              )}
            >
              <Avatar avatar={a} colour={colour()} class="size-20" />
            </button>
          )}
        </For>
      </div>

      <div class="flex gap-4">
        <Button type="submit">Save</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>
    </FormPage>
  );
};
