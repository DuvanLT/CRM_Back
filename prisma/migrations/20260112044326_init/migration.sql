-- CreateEnum
CREATE TYPE "company_status" AS ENUM ('demo', 'active', 'suspended');

-- CreateEnum
CREATE TYPE "user_rol" AS ENUM ('owner', 'agent');

-- CreateTable
CREATE TABLE "licenses" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "max_users" INTEGER NOT NULL,
    "max_messages_month" INTEGER NOT NULL,
    "max_campaigns_month" INTEGER NOT NULL,
    "max_storage_mb" INTEGER NOT NULL,
    "price_monthly" DECIMAL(10,2),
    "price_yearly" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "tax_id" VARCHAR(50),
    "email" VARCHAR(120),
    "phone" VARCHAR(30),
    "country" VARCHAR(50),
    "license_id" UUID NOT NULL,
    "status" "company_status" NOT NULL DEFAULT 'demo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "user_rol",
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_company_id_email_key" ON "users"("company_id", "email");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_license_id_fkey" FOREIGN KEY ("license_id") REFERENCES "licenses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
