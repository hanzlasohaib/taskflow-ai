-- Enable RLS so Realtime clients only receive their own task rows.
ALTER TABLE "task" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "task_select_own" ON "task";
CREATE POLICY "task_select_own" ON "task"
  FOR SELECT
  TO authenticated, anon
  USING ((auth.jwt() ->> 'sub') = "userId");

GRANT SELECT ON TABLE "task" TO authenticated, anon;

-- Publish task changes to Supabase Realtime (idempotent).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'task'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "task";
  END IF;
END $$;
