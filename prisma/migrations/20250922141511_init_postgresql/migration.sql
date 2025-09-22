-- CreateTable
CREATE TABLE "public"."carddefault" (
    "id_card_default" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "carddefault_pkey" PRIMARY KEY ("id_card_default")
);

-- CreateTable
CREATE TABLE "public"."coment" (
    "id_comment" SERIAL NOT NULL,
    "id_card" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coment_pkey" PRIMARY KEY ("id_comment")
);

-- CreateTable
CREATE TABLE "public"."password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trip" (
    "id_trip" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "thumb" VARCHAR(200),
    "description" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "user_id" INTEGER,

    CONSTRAINT "trip_pkey" PRIMARY KEY ("id_trip")
);

-- CreateTable
CREATE TABLE "public"."tripcard" (
    "id_trip_card" SERIAL NOT NULL,
    "id_trip" INTEGER NOT NULL,
    "id_card_default" INTEGER NOT NULL,
    "title" VARCHAR(200),
    "description" TEXT,

    CONSTRAINT "tripcard_pkey" PRIMARY KEY ("id_trip_card")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id_user" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "thumb" VARCHAR(200),
    "password" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "public"."usertrips" (
    "id_user_trips" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_trip" INTEGER NOT NULL,

    CONSTRAINT "usertrips_pkey" PRIMARY KEY ("id_user_trips")
);

-- CreateIndex
CREATE INDEX "coment_id_card_idx" ON "public"."coment"("id_card");

-- CreateIndex
CREATE INDEX "coment_id_user_idx" ON "public"."coment"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "public"."password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "public"."password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "public"."password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "trip_user_id_idx" ON "public"."trip"("user_id");

-- CreateIndex
CREATE INDEX "tripcard_id_card_default_idx" ON "public"."tripcard"("id_card_default");

-- CreateIndex
CREATE INDEX "tripcard_id_trip_idx" ON "public"."tripcard"("id_trip");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE INDEX "usertrips_id_trip_idx" ON "public"."usertrips"("id_trip");

-- CreateIndex
CREATE INDEX "usertrips_id_user_idx" ON "public"."usertrips"("id_user");

-- AddForeignKey
ALTER TABLE "public"."coment" ADD CONSTRAINT "coment_id_card_fk" FOREIGN KEY ("id_card") REFERENCES "public"."tripcard"("id_trip_card") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coment" ADD CONSTRAINT "coment_id_user_fk" FOREIGN KEY ("id_user") REFERENCES "public"."user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trip" ADD CONSTRAINT "trip_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tripcard" ADD CONSTRAINT "tripcard_card_default_fk" FOREIGN KEY ("id_card_default") REFERENCES "public"."carddefault"("id_card_default") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tripcard" ADD CONSTRAINT "tripcard_trip_fk" FOREIGN KEY ("id_trip") REFERENCES "public"."trip"("id_trip") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usertrips" ADD CONSTRAINT "usertrips_trip_fk" FOREIGN KEY ("id_trip") REFERENCES "public"."trip"("id_trip") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usertrips" ADD CONSTRAINT "usertrips_user_fk" FOREIGN KEY ("id_user") REFERENCES "public"."user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
