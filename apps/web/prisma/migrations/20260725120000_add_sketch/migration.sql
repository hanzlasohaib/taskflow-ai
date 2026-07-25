-- CreateTable
CREATE TABLE "sketch" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storagePath" TEXT,
    "dataJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sketch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sketch_taskId_key" ON "sketch"("taskId");

-- CreateIndex
CREATE INDEX "sketch_userId_idx" ON "sketch"("userId");

-- AddForeignKey
ALTER TABLE "sketch" ADD CONSTRAINT "sketch_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sketch" ADD CONSTRAINT "sketch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS so Realtime clients only receive their own sketch rows.
ALTER TABLE "sketch" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sketch_select_own" ON "sketch";
CREATE POLICY "sketch_select_own" ON "sketch"
  FOR SELECT
  TO authenticated, anon
  USING ((auth.jwt() ->> 'sub') = "userId");

GRANT SELECT ON TABLE "sketch" TO authenticated, anon;

-- Publish sketch changes to Supabase Realtime (idempotent).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'sketch'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "sketch";
  END IF;
END $$;
