import { useContext, type ParentComponent } from 'solid-js';
import { Menu } from 'lucide-solid';
import { SidebarContext } from './sidebar';

type Props = {
  title: string;
};

export const Page: ParentComponent<Props> = (props) => {
  const { setShowSidebar } = useContext(SidebarContext)!;

  return (
    <div class="px-4 mx-auto max-w-6xl w-full h-full">
      <span class="flex gap-4 ps-2 items-center text-gray-800">
        <button
          class="p-1 hover:cursor-pointer rounded-md hover:bg-gray-100"
          onClick={(e) => {
            e.preventDefault();
            setShowSidebar(true);
          }}
        >
          <Menu />
        </button>
        <h1 class="text-3xl py-6 font-semibold">{props.title}</h1>
      </span>
      <div>{props.children}</div>
    </div>
  );
};
