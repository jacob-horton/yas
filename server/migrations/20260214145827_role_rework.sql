-- Re-order user_role and add viewer role (want first in enum to be lowest privilege, for easier sorting)

BEGIN;

-- Drop default value constraint
ALTER TABLE group_members ALTER COLUMN role DROP DEFAULT;

-- Rename the existing type
ALTER TYPE user_role RENAME TO user_role_old;

-- Create the new type in ascending order
CREATE TYPE user_role AS ENUM ('viewer', 'member', 'admin', 'owner');

-- Update table to use the new type
ALTER TABLE group_members
  ALTER COLUMN role TYPE user_role
  USING role::text::user_role;

ALTER TABLE group_members
  ALTER COLUMN role SET DEFAULT 'member'::user_role;

-- Drop the old type
DROP TYPE user_role_old;

COMMIT;
