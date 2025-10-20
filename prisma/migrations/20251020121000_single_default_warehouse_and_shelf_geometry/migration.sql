-- Add isDefault flag to Warehouse with default false
ALTER TABLE "Warehouse"
ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- Ensure only a single default warehouse can exist using a partial unique index (PostgreSQL)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = ANY (current_schemas(false))
      AND indexname = 'unique_default_warehouse'
  ) THEN
    CREATE UNIQUE INDEX "unique_default_warehouse"
      ON "Warehouse" ("isDefault")
      WHERE "isDefault" = true;
  END IF;
END $$;

-- Add shelf geometry fields: position (X,Y,Z) and dimensions (width, depth, height)
ALTER TABLE "Shelf"
ADD COLUMN IF NOT EXISTS "positionX" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "positionY" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "positionZ" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "width" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS "depth" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS "height" INTEGER NOT NULL DEFAULT 1;

-- Validation constraints for shelf geometry
ALTER TABLE "Shelf"
  ADD CONSTRAINT "shelf_width_positive" CHECK ("width" > 0),
  ADD CONSTRAINT "shelf_depth_positive" CHECK ("depth" > 0),
  ADD CONSTRAINT "shelf_height_positive" CHECK ("height" > 0),
  ADD CONSTRAINT "shelf_positionX_non_negative" CHECK ("positionX" >= 0),
  ADD CONSTRAINT "shelf_positionY_non_negative" CHECK ("positionY" >= 0),
  ADD CONSTRAINT "shelf_positionZ_non_negative" CHECK ("positionZ" >= 0);
