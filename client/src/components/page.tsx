import type { ParentComponent } from 'solid-js';

type Props = {
  title: string;
};

export const Page: ParentComponent<Props> = (props) => {
  return (
    <>
      <h1>{props.title}</h1>
      <div class="px-4">{props.children}</div>
    </>
  );
};
