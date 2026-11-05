ALTER TABLE "users" ADD COLUMN "referral_code" TEXT;

CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");

CREATE TABLE "referrals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referrer_id" UUID NOT NULL,
    "referred_user_id" UUID NOT NULL,
    "referral_code" TEXT NOT NULL,
    "points_awarded" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'credited',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "referrals_referred_user_id_key" ON "referrals"("referred_user_id");
CREATE INDEX "referrals_referrer_id_idx" ON "referrals"("referrer_id");
CREATE INDEX "referrals_referral_code_idx" ON "referrals"("referral_code");

CREATE TABLE "referral_point_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referral_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "referral_point_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "referral_point_events_referral_id_reason_key" ON "referral_point_events"("referral_id", "reason");
CREATE INDEX "referral_point_events_user_id_idx" ON "referral_point_events"("user_id");

ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_user_id_fkey" FOREIGN KEY ("referred_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "referral_point_events" ADD CONSTRAINT "referral_point_events_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "referrals"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "referral_point_events" ADD CONSTRAINT "referral_point_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
