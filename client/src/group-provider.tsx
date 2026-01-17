import { useParams } from "@solidjs/router";
import { createContext, type ParentComponent, useContext } from "solid-js";

const GroupContext = createContext<string>();

export const GroupProvider: ParentComponent = (props) => {
  const params = useParams();

  return (
    <GroupContext.Provider value={params.groupId}>
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
