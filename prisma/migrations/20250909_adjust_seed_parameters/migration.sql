ALTER TABLE "seed_parameters"
  ALTER COLUMN "price_per_unit_min" DROP NOT NULL,
  ALTER COLUMN "price_per_unit_max" DROP NOT NULL;

ALTER TABLE "seed_parameters"
  ALTER COLUMN "seeds_per_kg_min" DROP NOT NULL,
  ALTER COLUMN "seeds_per_kg_max" DROP NOT NULL;

DELETE FROM "seed_parameters"
WHERE UPPER("generation_name") = 'KONSUMSI';

DROP TABLE IF EXISTS "articles";
