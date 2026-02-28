import InfoIcon from "lucide-solid/icons/info";
import { type JSX, type ParentComponent, Show } from "solid-js";
import { Checkbox } from "../ui/checkbox";
import { Tooltip } from "../ui/tooltip";
import { Container } from "./container";
import { type Action, Page } from "./page";

export type Props = {
  onSubmit?: JSX.EventHandler<HTMLFormElement, SubmitEvent>;
  title: string;
  actions?: Action[];
};

export const FormPage: ParentComponent<Props> = (props) => {
  return (
    <Page title={props.title} actions={props.actions} showBack narrow>
      <Container narrow>
        <form onSubmit={props.onSubmit} class="flex flex-col gap-6" novalidate>
          {props.children}
        </form>
      </Container>
    </Page>
  );
};

type FormSectionProps = {
  title: string;
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  tooltip?: string;
};

export const FormSection: ParentComponent<FormSectionProps> = (props) => {
  return (
    <section class="flex flex-col gap-2">
      <span class="inline-flex gap-2">
        <Show when={props.enabled !== undefined}>
          <Checkbox checked={props.enabled} onCheckedChange={props.onToggle} />
        </Show>
        <h2 class="inline-flex justify-center gap-1.5 font-semibold">
          <span>{props.title}</span>

          <Show when={props.tooltip}>
            {(tooltip) => (
              <Tooltip tooltip={tooltip()}>
                <InfoIcon size={16} />
              </Tooltip>
            )}
          </Show>
        </h2>
      </span>

      <Show when={props.enabled === undefined || props.enabled}>
        <div class="flex flex-col gap-6">{props.children}</div>
      </Show>
    </section>
  );
};
