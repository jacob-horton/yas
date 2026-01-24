BEGIN;

-- Add name to invites, defaulting to "Untitled"
ALTER TABLE invites
ADD COLUMN name TEXT NOT NULL DEFAULT 'Untitled';

-- Remove default in future
ALTER TABLE invites
ALTER COLUMN name DROP DEFAULT;

COMMIT;
