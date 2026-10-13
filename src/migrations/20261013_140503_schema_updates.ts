import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_markup_type" AS ENUM('percentage', 'fixed');
  CREATE TYPE "public"."enum_activity_logs_action" AS ENUM('create', 'pricing', 'stock', 'visibility');
  CREATE TABLE "activity_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"action" "enum_activity_logs_action" NOT NULL,
  	"product_id" integer,
  	"summary" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "products" ADD COLUMN "markup_type" "enum_products_markup_type" DEFAULT 'percentage' NOT NULL;
  ALTER TABLE "products" ADD COLUMN "markup_value" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE "orders_items" ADD COLUMN "cost_price" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "activity_logs_id" integer;
  ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "activity_logs_user_idx" ON "activity_logs" USING btree ("user_id");
  CREATE INDEX "activity_logs_product_idx" ON "activity_logs" USING btree ("product_id");
  CREATE INDEX "activity_logs_updated_at_idx" ON "activity_logs" USING btree ("updated_at");
  CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_activity_logs_fk" FOREIGN KEY ("activity_logs_id") REFERENCES "public"."activity_logs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_activity_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("activity_logs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "activity_logs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "activity_logs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_activity_logs_fk";
  
  DROP INDEX "payload_locked_documents_rels_activity_logs_id_idx";
  ALTER TABLE "products" DROP COLUMN "markup_type";
  ALTER TABLE "products" DROP COLUMN "markup_value";
  ALTER TABLE "orders_items" DROP COLUMN "cost_price";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "activity_logs_id";
  DROP TYPE "public"."enum_products_markup_type";
  DROP TYPE "public"."enum_activity_logs_action";`)
}
