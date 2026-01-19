export type Group = {
  id: string;
  name: string;
  created_at: string;
};

// TODO: make into created_at and user props
export type GroupMember = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export type CreateGroupRequest = {
  name: string;
};
