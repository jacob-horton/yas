import type { JSX, ParentComponent } from "solid-js";
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
        <form onSubmit={props.onSubmit} class="flex flex-col gap-6">
          {props.children}
        </form>
      </Container>
    </Page>
  );
};
