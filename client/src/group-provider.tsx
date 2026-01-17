import {
  type Accessor,
  createContext,
  createSignal,
  type ParentComponent,
  type Setter,
  useContext,
} from "solid-js";

const GroupContext = createContext<{
  group: Accessor<string | undefined>;
  setGroup: Setter<string | undefined>;
}>();

export const GroupProvider: ParentComponent = (props) => {
  const [group, setGroup] = createSignal<string | undefined>(undefined);

  return (
    <GroupContext.Provider value={{ group, setGroup }}>
      {props.children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => {
  const group = useContext(GroupContext);

  if (!group) {
    throw new Error("useGroup must be used within GroupContext");
  }

  return group;
};
