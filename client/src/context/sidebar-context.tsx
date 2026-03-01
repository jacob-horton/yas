import {
  type Accessor,
  createContext,
  createSignal,
  onCleanup,
  onMount,
  type ParentComponent,
  type Setter,
  useContext,
} from "solid-js";

type SidebarContextType = {
  isOpen: Accessor<boolean>;
  setIsOpen: Setter<boolean>;
  isDesktop: Accessor<boolean>; // Expose the breakpoint state
};

const SidebarContext = createContext<SidebarContextType>();

export const SidebarProvider: ParentComponent = (props) => {
  const [isSidebarOpen, setIsSidebarOpen] = createSignal(false);
  const [isDesktop, setIsDesktop] = createSignal(true);

  onMount(() => {
    const mediaQuery = window.matchMedia("(min-width: 1280px)");
    setIsDesktop(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
      if (e.matches) setIsSidebarOpen(false);
    };

    mediaQuery.addEventListener("change", handler);
    onCleanup(() => mediaQuery.removeEventListener("change", handler));
  });

  return (
    <SidebarContext.Provider
      value={{
        isOpen: isSidebarOpen,
        setIsOpen: setIsSidebarOpen,
        isDesktop,
      }}
    >
      {props.children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }

  return ctx;
};

// Returns sidebar if it's available
export const useOptionalSidebar = () => {
  return useContext(SidebarContext);
};
