-- CreateTable
CREATE TABLE "public"."seed_parameters" (
    "id" SERIAL NOT NULL,
    "generation_name" TEXT NOT NULL,
    "seeds_per_kg_min" INTEGER,
    "seeds_per_kg_max" INTEGER,
    "price_per_unit_min" INTEGER NOT NULL,
    "price_per_unit_max" INTEGER NOT NULL,
    "price_unit" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seed_parameters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seed_parameters_generation_name_key" ON "public"."seed_parameters"("generation_name");
