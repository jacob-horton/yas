BEGIN;

-- GROUP MEMBERS
-- Handle user deletion - remove user from all groups automatically
ALTER TABLE group_members
DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;

ALTER TABLE group_members
ADD CONSTRAINT group_members_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Handle group deletion - remove all members associated with the group
ALTER TABLE group_members
DROP CONSTRAINT IF EXISTS group_members_group_id_fkey;

ALTER TABLE group_members
ADD CONSTRAINT group_members_group_id_fkey
FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;


-- INVITES
-- Handle group deletion - remove outstanding invites for that group
ALTER TABLE invites
DROP CONSTRAINT IF EXISTS invites_group_id_fkey;

ALTER TABLE invites
ADD CONSTRAINT invites_group_id_fkey
FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;

-- Handle user deletion - remove invites created by this user
ALTER TABLE invites
DROP CONSTRAINT IF EXISTS invites_created_by_fkey;

ALTER TABLE invites
ADD CONSTRAINT invites_created_by_fkey
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

COMMIT;
