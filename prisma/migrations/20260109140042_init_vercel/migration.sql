-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMINISTRATIVE',
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "classCode" TEXT NOT NULL,
    "hub" TEXT NOT NULL,
    "saleDate" TIMESTAMP(3) NOT NULL,
    "fullValue" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "contractValue" DOUBLE PRECISION,
    "commissionValue" DOUBLE PRECISION,
    "dueDate" TIMESTAMP(3),
    "installments" INTEGER,
    "installmentValue" DOUBLE PRECISION,
    "discountValue" DOUBLE PRECISION,
    "discountAuthorized" BOOLEAN,
    "registrationFee" DOUBLE PRECISION,
    "leadOrigin" TEXT,
    "isDisabledPerson" BOOLEAN,
    "hasMobilityRestriction" BOOLEAN,
    "mobilityDetails" TEXT,
    "foodRestrictions" TEXT,
    "shirtSize" TEXT,
    "pantsSize" TEXT,
    "postSaleStatus" TEXT,
    "contractSignedStatus" TEXT,
    "studentStatus" TEXT,
    "classStatus" TEXT,
    "boletoEmissionStatus" TEXT,
    "boletosGenerated" BOOLEAN,
    "portalAccess" BOOLEAN,
    "docRg" TEXT,
    "docCpf" TEXT,
    "docDiploma" TEXT,
    "docHistory" TEXT,
    "docBirthCert" TEXT,
    "docAddressProof" TEXT,
    "docCrmv" TEXT,
    "docProfilePic" TEXT,
    "docMecCert" TEXT,
    "docFacultyIssuer" TEXT,
    "isTransfer" BOOLEAN,
    "generalObservations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
