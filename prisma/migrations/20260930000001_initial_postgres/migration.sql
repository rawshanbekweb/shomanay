-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "issueId" TEXT,
    "objectId" TEXT,
    "objectName" TEXT,
    "mfyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "actionDescription" TEXT NOT NULL,
    "mainExecutorOrg" TEXT NOT NULL,
    "executorPerson" TEXT NOT NULL,
    "inspectorOrg" TEXT NOT NULL,
    "inspectorPerson" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "createdDate" TEXT NOT NULL,
    "deadline" TEXT NOT NULL,
    "completedDate" TEXT,
    "expectedResult" TEXT NOT NULL,
    "verificationMethod" TEXT NOT NULL,
    "isOverdue" BOOLEAN NOT NULL DEFAULT false,
    "evidence" TEXT,
    "review" TEXT,
    "extensions" TEXT NOT NULL DEFAULT '[]',
    "postExecutionMeasurement" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "objectId" TEXT,
    "objectName" TEXT,
    "mfyId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "reportedDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "relatedIndicator" TEXT,
    "assignedTaskId" TEXT,
    "reportedBy" TEXT NOT NULL,
    "evidenceNotes" TEXT,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistrictObject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mfyId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "coordsLat" DOUBLE PRECISION NOT NULL,
    "coordsLng" DOUBLE PRECISION NOT NULL,
    "responsibleOrg" TEXT NOT NULL,
    "curator" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "updatedDate" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photos" TEXT NOT NULL DEFAULT '[]',
    "documents" TEXT NOT NULL DEFAULT '[]',
    "capacity" TEXT,
    "metrics" TEXT,
    "relatedIssuesCount" INTEGER NOT NULL DEFAULT 0,
    "relatedTasksCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DistrictObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MFY" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "population" INTEGER NOT NULL,
    "areaSqKm" DOUBLE PRECISION NOT NULL,
    "centerLat" DOUBLE PRECISION NOT NULL,
    "centerLng" DOUBLE PRECISION NOT NULL,
    "leaderName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "activeProjectsCount" INTEGER NOT NULL DEFAULT 0,
    "openIssuesCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MFY_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Indicator" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "changePercent" DOUBLE PRECISION NOT NULL,
    "plan" DOUBLE PRECISION NOT NULL,
    "fact" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "period" TEXT NOT NULL,

    CONSTRAINT "Indicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "investor" TEXT NOT NULL,
    "costMlnUzs" DOUBLE PRECISION NOT NULL,
    "createdJobs" INTEGER NOT NULL,
    "mfyId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "completionPercent" INTEGER NOT NULL,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dataset" (
    "key" TEXT NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "Dataset_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Task_code_key" ON "Task"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_code_key" ON "Issue"("code");
