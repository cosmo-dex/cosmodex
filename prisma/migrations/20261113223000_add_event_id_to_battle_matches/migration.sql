-- AlterTable
ALTER TABLE "battle_matches" ADD COLUMN "event_id" UUID;

-- AlterTable
ALTER TABLE "battle_mcq_matches" ADD COLUMN "event_id" UUID;

-- CreateIndex
CREATE INDEX "battle_matches_event_id_idx" ON "battle_matches"("event_id");

-- CreateIndex
CREATE INDEX "battle_mcq_matches_event_id_idx" ON "battle_mcq_matches"("event_id");

-- AddForeignKey
ALTER TABLE "battle_matches" ADD CONSTRAINT "battle_matches_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_mcq_matches" ADD CONSTRAINT "battle_mcq_matches_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
