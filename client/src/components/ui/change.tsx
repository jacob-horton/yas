import ChevronDownIcon from "lucide-solid/icons/chevron-down";
import ChevronUpIcon from "lucide-solid/icons/chevron-up";
import MinusIcon from "lucide-solid/icons/minus";
import { type Component, Match, Switch } from "solid-js";

type Props = {
  value: number;
};

export const Change: Component<Props> = (props) => {
  return (
    <Switch fallback={<MinusIcon size={14} class="text-gray-500" />}>
      <Match when={props.value < 0}>
        <ChevronDownIcon size={14} class="text-red-500" />
      </Match>
      <Match when={props.value > 0}>
        <ChevronUpIcon size={14} class="text-green-500" />
      </Match>
    </Switch>
  );
};
