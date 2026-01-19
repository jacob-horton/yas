import { useParams } from "@solidjs/router";
import {
  type Accessor,
  createContext,
  createEffect,
  type ParentComponent,
  useContext,
} from "solid-js";

const GroupContext = createContext<Accessor<string>>();

export const GroupProvider: ParentComponent = (props) => {
  const params = useParams();
  const groupId = () => params.groupId;

  createEffect(() => {
    localStorage.setItem("lastGroupId", groupId());
  });

  return (
    <GroupContext.Provider value={groupId}>
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
