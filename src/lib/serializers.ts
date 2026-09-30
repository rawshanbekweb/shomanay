import type { Task as DbTask, Issue as DbIssue, DistrictObject as DbDistrictObject } from '@prisma/client';
import type { Task, Issue, DistrictObject } from '@/types';

export function parseTask(t: DbTask): Task {
  return {
    id: t.id,
    code: t.code,
    issueId: t.issueId || undefined,
    objectId: t.objectId || undefined,
    objectName: t.objectName || undefined,
    mfyId: t.mfyId,
    title: t.title,
    actionDescription: t.actionDescription,
    mainExecutorOrg: t.mainExecutorOrg,
    executorPerson: t.executorPerson,
    inspectorOrg: t.inspectorOrg,
    inspectorPerson: t.inspectorPerson,
    status: t.status as Task["status"],
    priority: t.priority as Task["priority"],
    createdDate: t.createdDate,
    deadline: t.deadline,
    completedDate: t.completedDate || undefined,
    expectedResult: t.expectedResult,
    verificationMethod: t.verificationMethod,
    isOverdue: !['accepted', 'cancelled'].includes(t.status) && Date.parse(t.deadline) < Date.now(),
    evidence: t.evidence ? JSON.parse(t.evidence) : undefined,
    review: t.review ? JSON.parse(t.review) : undefined,
    extensions: t.extensions ? JSON.parse(t.extensions) : [],
    postExecutionMeasurement: t.postExecutionMeasurement
      ? JSON.parse(t.postExecutionMeasurement)
      : undefined,
  };
}


export function parseIssue(i: DbIssue): Issue {
  return {
    id: i.id,
    code: i.code,
    title: i.title,
    description: i.description,
    category: i.category as Issue["category"],
    priority: i.priority as Issue["priority"],
    objectId: i.objectId || undefined,
    objectName: i.objectName || undefined,
    mfyId: i.mfyId,
    source: i.source as Issue["source"],
    reportedDate: i.reportedDate,
    status: i.status as Issue["status"],
    relatedIndicator: i.relatedIndicator || undefined,
    assignedTaskId: i.assignedTaskId || undefined,
    reportedBy: i.reportedBy,
    evidenceNotes: i.evidenceNotes || undefined,
  };
}


export function parseObject(o: DbDistrictObject): DistrictObject {
  return {
    id: o.id,
    name: o.name,
    type: o.type as DistrictObject["type"],
    mfyId: o.mfyId,
    address: o.address,
    coords: [o.coordsLat, o.coordsLng],
    responsibleOrg: o.responsibleOrg,
    curator: o.curator,
    status: o.status as DistrictObject["status"],
    source: o.source,
    updatedDate: o.updatedDate,
    description: o.description,
    photos: o.photos ? JSON.parse(o.photos) : [],
    documents: o.documents ? JSON.parse(o.documents) : [],
    capacity: o.capacity ? JSON.parse(o.capacity) : undefined,
    metrics: o.metrics ? JSON.parse(o.metrics) : undefined,
    relatedIssuesCount: o.relatedIssuesCount,
    relatedTasksCount: o.relatedTasksCount,
  };
}

