-- Start with column as nullable (so we can fill in and make not nullable later)
ALTER TABLE matches ADD COLUMN recorded_by UUID REFERENCES users(id);

-- Fill in existing match's recorded_by as owner of group
UPDATE matches m
SET recorded_by = gm.user_id
FROM games g
JOIN groups gr ON gr.id = g.group_id
JOIN group_members gm ON gm.group_id = gr.id
WHERE m.game_id = g.id
  AND gm.role = 'owner';

-- Enforce one owner in a group
CREATE UNIQUE INDEX one_owner_per_group ON group_members (group_id) WHERE role = 'owner';

-- Set column to be not nullable
ALTER TABLE matches ALTER COLUMN recorded_by SET NOT NULL;
