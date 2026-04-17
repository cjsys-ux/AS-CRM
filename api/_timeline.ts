import type { Db } from 'mongodb';

export type TimelineEventType = 'status_change' | 'file_upload' | 'comment' | 'edit' | 'milestone';
export type TimelineIcon = 'check' | 'alert' | 'package' | 'file' | 'upload' | 'comment' | 'edit';
export type TimelineColor = 'green' | 'blue' | 'purple' | 'orange' | 'indigo' | 'red' | 'slate';

export interface TimelineEventInput {
  productId: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  user?: string;
  icon?: TimelineIcon;
  color?: TimelineColor;
}

/**
 * Insert a timeline event. Failures are swallowed: timeline logging must never
 * break the primary operation (upload, save, update, etc.).
 */
export async function logTimelineEvent(db: Db, event: TimelineEventInput): Promise<void> {
  try {
    await db.collection('pipeline_timeline').insertOne({
      productId: event.productId,
      type: event.type,
      title: event.title,
      description: event.description ?? '',
      user: event.user ?? 'User',
      icon: event.icon ?? 'edit',
      color: event.color ?? 'slate',
      timestamp: new Date().toISOString(),
      createdAt: new Date(),
    });
  } catch {
    // Non-fatal.
  }
}

const PIPELINE_ENTITY_LABELS: Record<string, string> = {
  'pipeline-file': 'Files',
  'pipeline-compliance': 'Compliance & Certifications',
  'pipeline-packaging': 'Packaging',
  'pipeline-packaging-mockup': 'Packaging Mockups',
  'pipeline-packaging-dieline': 'Packaging Dielines',
  'pipeline-packaging-spec': 'Packaging Spec Sheets',
  'pipeline-sample-file': 'Sample Files',
  'pipeline-sample-document': 'Sample Documents',
  'pipeline-sample-image': 'Sample Images',
};

export function entityTypeLabel(entityType?: string | null): string | null {
  if (!entityType) return null;
  return PIPELINE_ENTITY_LABELS[entityType] ?? null;
}

export function isPipelineEntityType(entityType?: string | null): boolean {
  if (!entityType) return false;
  return entityType in PIPELINE_ENTITY_LABELS;
}
