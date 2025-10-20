import { type ParentComponent } from 'solid-js';

type Props = {
  title: string;
};

export const Page: ParentComponent<Props> = (props) => {
  return (
    <div class="mx-auto h-full w-full max-w-6xl px-4">
      <h1 class="py-6 text-3xl font-semibold text-gray-800">{props.title}</h1>
      <div>{props.children}</div>
    </div>
  );
};
