import CircleAlertIcon from "lucide-solid/icons/circle-alert";
import type { Component } from "solid-js";

type Props = {
  title: string;
  details?: string;
};

export const ErrorMessage: Component<Props> = (props) => {
  return (
    <div class="flex min-h-96 w-full flex-col items-center justify-center gap-4 px-16 py-16">
      <CircleAlertIcon size={90} class="text-red-600" />
      <div class="flex flex-col items-center gap-1 text-red-600">
        <h2 class="font-semibold text-5xl">{props.title}</h2>
        <p>{props.details}</p>
      </div>
    </div>
  );
};
