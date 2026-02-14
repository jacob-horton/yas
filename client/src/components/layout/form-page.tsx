import type { JSX, ParentComponent } from "solid-js";
import { Container } from "./container";
import { Page } from "./page";

export type Props = {
  onSubmit?: JSX.EventHandler<HTMLFormElement, SubmitEvent>;
  title: string;
};

export const FormPage: ParentComponent<Props> = (props) => {
  return (
    <Page title={props.title} showBack narrow>
      <Container narrow>
        <form onSubmit={props.onSubmit} class="flex flex-col gap-6">
          {props.children}
        </form>
      </Container>
    </Page>
  );
};
