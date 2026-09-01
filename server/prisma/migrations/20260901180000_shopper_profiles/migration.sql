-- First-party shopper profiles and interaction events.

CREATE TABLE IF NOT EXISTS "shopper_profiles" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "userId" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "deviceType" TEXT,
    "affinity" JSONB NOT NULL DEFAULT '{}',
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shopper_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "shopper_profiles_visitorId_key" ON "shopper_profiles"("visitorId");
CREATE INDEX IF NOT EXISTS "shopper_profiles_userId_idx" ON "shopper_profiles"("userId");
CREATE INDEX IF NOT EXISTS "shopper_profiles_lastSeenAt_idx" ON "shopper_profiles"("lastSeenAt");

CREATE TABLE IF NOT EXISTS "shopper_events" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "query" TEXT,
    "productId" TEXT,
    "storeId" TEXT,
    "category" TEXT,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shopper_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "shopper_events_profileId_createdAt_idx" ON "shopper_events"("profileId", "createdAt");
CREATE INDEX IF NOT EXISTS "shopper_events_type_createdAt_idx" ON "shopper_events"("type", "createdAt");

ALTER TABLE "shopper_events"
    ADD CONSTRAINT "shopper_events_profileId_fkey"
    FOREIGN KEY ("profileId") REFERENCES "shopper_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
