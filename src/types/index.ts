export type Language = 'qq' | 'uz' | 'ru';

export type UserRole =
  | 'hokim'          // Tuman rahbari (Hokim)
  | 'coordinator'    // Tuman muvofiqlashtiruvchisi
  | 'organization'   // Mas'ul tashkilot / Ijrochi
  | 'inspector'      // Mustaqil tekshiruvchi
  | 'statistician'   // Statistika bo'limi / Tahlilchi
  | 'admin';         // Tizim administratori

export interface User {
  id: string;
  name: string;
  role: UserRole;
  organization: string;
  title: string;
  avatar?: string;
}

export interface MFY {
  id: string;
  name: string;
  code: string;
  population: number;
  areaSqKm: number;
  centerCoords: [number, number];
  polygon: [number, number][]; // GeoJSON polygon coordinates
  leaderName: string;
  phone: string;
  activeProjectsCount: number;
  openIssuesCount: number;
}

export type ObjectType =
  | 'enterprise'          // Kárxana / Korxona
  | 'investment_project' // Investiciyalıq joybar / Investitsiya loyihasi
  | 'industrial_zone'    // Sanaat zonası / Sanoat zonasi
  | 'infrastructure'     // Infrastruktura (elektr, gaz, suw, jol)
  | 'social';            // Sociallıq obyekt (mektep, baqsha, poliklinika)

export type ObjectStatus = 'active' | 'in_progress' | 'planned' | 'paused' | 'risk';

export interface DistrictObject {
  id: string;
  name: string;
  type: ObjectType;
  mfyId: string;
  address: string;
  coords: [number, number];
  responsibleOrg: string;
  curator: string;
  status: ObjectStatus;
  source: string;
  updatedDate: string;
  description: string;
  photos: string[];
  documents: { title: string; date: string; size: string; type: string }[];
  capacity?: {
    total: number;
    used: number;
    free: number;
    unit: string;
    resourceType: string;
  };
  metrics?: {
    revenueMlnUzs?: number;
    jobs?: number;
    exportVolumeUsd?: number;
    progressPercent?: number;
  };
  relatedIssuesCount: number;
  relatedTasksCount: number;
}

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'assigned' | 'in_progress' | 'under_review' | 'resolved' | 'closed';
export type IssueCategory =
  | 'electricity'
  | 'gas'
  | 'water'
  | 'road_transport'
  | 'finance_credit'
  | 'land_permit'
  | 'labor_skills'
  | 'equipment';

export interface Issue {
  id: string;
  code: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  objectId?: string;
  objectName?: string;
  mfyId: string;
  source: 'manual' | 'auto_rule' | 'statistic_alert' | 'citizen_appeal';
  reportedDate: string;
  status: IssueStatus;
  relatedIndicator?: string;
  assignedTaskId?: string;
  reportedBy: string;
  evidenceNotes?: string;
}

export type TaskStatus =
  | 'draft'                  // Joybar / Loyiha
  | 'assigned'               // Belgilendi / Tayinlandi
  | 'in_progress'            // Islep atır / Jarayonda
  | 'under_review'           // Tekseriwde / Tekshiruvda
  | 'accepted'               // Qabıl etildi / Qabul qilindi
  | 'returned_for_revision'  // Qayta islewge / Qayta ishlashga
  | 'cancelled';             // Biykar etildi / Bekor qilindi

export interface TaskEvidence {
  submittedAt: string;
  submittedBy: string;
  comment: string;
  numericResult?: number;
  unit?: string;
  photos: string[];
  documents: { name: string; size: string; type: string }[];
}

export interface TaskReview {
  reviewedAt: string;
  reviewedBy: string;
  accepted: boolean;
  rejectionReason?: string;
  inspectorNotes?: string;
}

export interface DeadlineExtension {
  id: string;
  oldDeadline: string;
  newDeadline: string;
  reason: string;
  approvedBy: string;
  approvedDate: string;
}

export interface Task {
  id: string;
  code: string;
  issueId?: string;
  objectId?: string;
  objectName?: string;
  mfyId: string;
  title: string;
  actionDescription: string;
  mainExecutorOrg: string;
  executorPerson: string;
  inspectorOrg: string;
  inspectorPerson: string;
  status: TaskStatus;
  priority: IssuePriority;
  createdDate: string;
  deadline: string; // ISO format (Asia/Tashkent)
  completedDate?: string;
  expectedResult: string;
  verificationMethod: string;
  evidence?: TaskEvidence;
  review?: TaskReview;
  extensions: DeadlineExtension[];
  isOverdue: boolean;
  postExecutionMeasurement?: {
    baselineValue: number;
    targetValue: number;
    actualMeasuredValue?: number;
    unit: string;
    measurementPeriod: string;
    responsiblePerson: string;
    measuredDate?: string;
    verified: boolean;
  };
}

export interface InvestmentMilestone {
  id: string;
  title: string;
  weightPercent: number; // Sum of all milestones = 100%
  plannedDate: string;
  actualDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  docEvidence?: string;
}

export interface InvestmentProject {
  id: string;
  name: string;
  investorName: string;
  directionSector: string;
  objectId: string;
  mfyId: string;
  totalCostMlnUzs: number;
  foreignInvestThousandUsd: number;
  stage: 'planned' | 'construction' | 'equipment_installation' | 'launch_ready' | 'operational' | 'delayed';
  plannedLaunchDate: string;
  actualLaunchDate?: string;
  plannedJobs: number;
  reportedJobs: number;
  verifiedJobs: number;
  financialProgressPercent: number; // Moliya o'zlashtirish %
  physicalProgressPercent: number;  // Fizik tayyorgarlik %
  milestones: InvestmentMilestone[];
  infrastructureNeeds: {
    electricityKva: number;
    gasM3PerHour: number;
    waterM3PerDay: number;
    landHa: number;
    status: 'satisfied' | 'in_process' | 'deficit_risk';
  };
  exportPotentialThousandUsd: number;
  annualTaxPotentialMlnUzs: number;
  relatedTasksCount: number;
}

export interface IndustrialZone {
  id: string;
  name: string;
  type: 'KSZ' | 'Agrologistika' | 'Texnopark';
  mfyId: string;
  totalAreaHa: number;
  occupiedAreaHa: number;
  freeAreaHa: number;
  activeCompaniesCount: number;
  totalInvestmentMlnUzs: number;
  totalJobs: number;
  capacities: {
    electricityMwt: { total: number; used: number; free: number };
    gasM3H: { total: number; used: number; free: number };
    waterM3Day: { total: number; used: number; free: number };
    sewageAvailable: boolean;
    railwayConnected: boolean;
    asphaltRoad: boolean;
  };
  coords: [number, number];
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'task' | 'issue' | 'object' | 'investment' | 'indicator' | 'import';
  entityId: string;
  entityName: string;
  changes: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  reason?: string;
  ipAddress: string;
}

export interface SectorIndicator {
  id: string;
  code: string;
  name: { qq: string; uz: string; ru: string };
  sectorKey: string;
  sectorName: { qq: string; uz: string; ru: string };
  unit: string;
  historical: {
    [year: string]: number;
  };
  trendPercent: number;
  isPositiveTrend: boolean;
}
