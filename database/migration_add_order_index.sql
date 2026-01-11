-- Add order_index column to prerequisites table to preserve prerequisite order
ALTER TABLE prerequisites ADD COLUMN IF NOT EXISTS order_index INTEGER;

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_prerequisites_order ON prerequisites(course_id, order_index);

