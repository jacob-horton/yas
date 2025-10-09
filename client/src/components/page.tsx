import MenuIcon from 'lucide-solid/icons/menu';
import { useContext, type ParentComponent } from 'solid-js';
import { SidebarContext } from './sidebar';

type Props = {
  title: string;
};

export const Page: ParentComponent<Props> = (props) => {
  const { setShowSidebar } = useContext(SidebarContext)!;

  return (
    <div class="mx-auto h-full w-full max-w-6xl px-4">
      <span class="flex items-center gap-4 ps-2 text-gray-800">
        <button
          class="rounded-md p-1 transition hover:cursor-pointer hover:bg-gray-100"
          onClick={(e) => {
            e.preventDefault();
            setShowSidebar(true);
          }}
        >
          <MenuIcon />
        </button>
        <h1 class="py-6 text-3xl font-semibold">{props.title}</h1>
      </span>
      <div>{props.children}</div>
    </div>
  );
};
