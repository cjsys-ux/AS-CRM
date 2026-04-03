import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { ObjectId } from 'mongodb';
import { getDb } from '../_mongodb';
import { getS3Client, getS3Bucket } from '../_s3';

type MongoProject = {
  _id?: ObjectId;
  id?: string;
  // Name variants
  name?: string;
  productName?: string;
  title?: string;
  // Client variants
  client?: string;
  customer?: string;
  // Vendor variants
  vendor?: string;
  supplier?: string;
  description?: string;
  status?: string;
  // Type variants
  type?: string;
  itemType?: string;
  yearlyQty?: number | string;
  yearlyQuantity?: number | string;
  pricePerUnit?: number | string;
  unitPrice?: number | string;
  totalValue?: number | string;
  priority?: string;
  // Deployment/due date variants
  deployment?: string;
  dueDate?: string;
  deploymentDate?: string;
  // Project manager variants
  projectManager?: string;
  assignedManager?: string;
  manager?: string;
  // SKU variants
  internalSKU?: string;
  sku?: string;
  targetMargin?: string | number;
  // Image variants
  image?: string;
  imageUrl?: string;
  imageKey?: string;
  s3Key?: string;
  key?: string;
  fileKey?: string;
  thumbnail?: string;
  productImage?: string;
  // Project number
  projectNumber?: string;
  // Competitor fields
  competitorName?: string;
  competitorLink?: string;
  competitorPrice?: string;
  competitorDescription?: string;
  competitorSku?: string;
};

type MongoUpload = {
  _id?: ObjectId;
  entityId?: string;
  fileType?: string;
  fileUrl?: string;
  key?: string;
  createdAt?: Date;
};

const defaultImage =
  'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=800&h=500&fit=crop';

function getProxyImageUrl(key: string): string {
  return `/api/files/image?key=${encodeURIComponent(key)}`;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[$,]/g, '').trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function normalizeStatus(status?: string): string {
  const value = (status ?? '').trim().toLowerCase();
  if (!value) return 'New Product';
  if (value.includes('progress')) return 'In Progress';
  if (value.includes('ready')) return 'Ready For Live';
  if (value === 'live') return 'Live';
  return status ?? 'New Product';
}

function normalizePriority(priority?: string): string {
  const value = (priority ?? '').trim().toLowerCase();
  if (value === 'high') return 'High';
  if (value === 'low') return 'Low';
  return 'Medium';
}

function getUploadImageUrl(upload: MongoUpload | undefined): string | null {
  if (!upload) return null;
  if (upload.fileUrl?.startsWith('http://') || upload.fileUrl?.startsWith('https://')) {
    return upload.fileUrl;
  }
  if (upload.key) return getProxyImageUrl(upload.key);
  return null;
}

async function fetchS3ImagesByProjectId(projectIds: Set<string>): Promise<Map<string, string>> {
  const s3ImageByProjectId = new Map<string, string>();
  try {
    const s3 = getS3Client();
    const bucket = getS3Bucket();
    const response = await s3.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: 'uploads/project/', MaxKeys: 1000 })
    );
    for (const obj of response.Contents ?? []) {
      if (!obj.Key) continue;
      // Key format: uploads/project/{entityId}/{timestamp}-{filename}
      const parts = obj.Key.split('/');
      if (parts.length < 4) continue;
      const entityId = parts[2];
      if (!entityId || entityId === 'new') continue;
      if (!projectIds.has(entityId)) continue;
      // Overwrite to keep lexicographically last key (newest timestamp)
      s3ImageByProjectId.set(entityId, getProxyImageUrl(obj.Key));
    }
  } catch {
    // Non-fatal: return empty map so existing resolution paths continue to work
  }
  return s3ImageByProjectId;
}

function resolveProjectImage(
  project: MongoProject,
  uploadByEntityId: Map<string, MongoUpload>,
  s3ImageByProjectId: Map<string, string>
): string {
  // 1. Direct HTTP/HTTPS URL stored in image fields
  const directImage = project.image ?? project.imageUrl ?? project.thumbnail ?? project.productImage;
  if (directImage?.startsWith('http://') || directImage?.startsWith('https://')) {
    return directImage;
  }

  // 2. S3 key stored in project document → serve via proxy
  const s3ObjectKey = project.imageKey ?? project.s3Key ?? project.fileKey ?? project.key;
  if (s3ObjectKey) {
    return getProxyImageUrl(s3ObjectKey);
  }

  // 3. Non-http image field treated as bare S3 key → serve via proxy
  if (directImage && !directImage.startsWith('data:')) {
    return getProxyImageUrl(directImage);
  }

  const projectId = project.id ?? project._id?.toString();

  // 4. Uploads collection lookup by project ID
  const uploadImage = projectId ? getUploadImageUrl(uploadByEntityId.get(projectId)) : null;
  if (uploadImage) return uploadImage;

  // 5. S3 listing fallback (covers images in S3 not linked in MongoDB)
  if (projectId) {
    const s3ListedImage = s3ImageByProjectId.get(projectId);
    if (s3ListedImage) return s3ListedImage;
  }

  return defaultImage;
}

function mapProject(
  project: MongoProject,
  uploadByEntityId: Map<string, MongoUpload>,
  s3ImageByProjectId: Map<string, string>
) {
  const yearlyQty = toNumber(project.yearlyQty ?? project.yearlyQuantity, 0);
  const pricePerUnit = toNumber(project.pricePerUnit ?? project.unitPrice, 0);
  const computedTotal = yearlyQty * pricePerUnit;
  const totalValue = toNumber(project.totalValue, computedTotal);

  return {
    id: project.id ?? project._id?.toString() ?? `project-${Math.random().toString(36).slice(2, 10)}`,
    projectNumber: project.projectNumber ?? '',
    name: project.name ?? project.productName ?? project.title ?? 'Untitled Project',
    client: project.client ?? project.customer ?? 'Unknown Client',
    vendor: project.vendor ?? project.supplier ?? '',
    description: project.description ?? '',
    status: normalizeStatus(project.status),
    type: project.type ?? project.itemType ?? 'Custom',
    yearlyQty,
    pricePerUnit,
    totalValue,
    priority: normalizePriority(project.priority),
    deployment: project.deployment ?? project.dueDate ?? project.deploymentDate ?? '',
    projectManager: project.projectManager ?? project.assignedManager ?? project.manager ?? '',
    internalSKU: project.internalSKU ?? project.sku ?? '',
    targetMargin: project.targetMargin ? String(project.targetMargin) : '',
    image: resolveProjectImage(project, uploadByEntityId, s3ImageByProjectId),
    competitorName: project.competitorName ?? '',
    competitorLink: project.competitorLink ?? '',
    competitorPrice: project.competitorPrice ?? '',
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDb();
    const projects = (await db
      .collection<MongoProject>('projects')
      .find({})
      .sort({ _id: -1 })
      .toArray()) as MongoProject[];

    const projectIds = projects
      .map((project) => project.id ?? project._id?.toString())
      .filter((value): value is string => Boolean(value));

    const [uploads, s3ImageByProjectId] = await Promise.all([
      db
        .collection<MongoUpload>('uploads')
        .find({
          entityId: { $in: projectIds },
          fileType: { $regex: '^image/', $options: 'i' },
        })
        .sort({ createdAt: -1 })
        .toArray() as Promise<MongoUpload[]>,
      fetchS3ImagesByProjectId(new Set(projectIds)),
    ]);

    const uploadByEntityId = new Map<string, MongoUpload>();
    for (const upload of uploads) {
      if (upload.entityId && !uploadByEntityId.has(upload.entityId)) {
        uploadByEntityId.set(upload.entityId, upload);
      }
    }

    return res.status(200).json({
      projects: projects.map((project) => mapProject(project, uploadByEntityId, s3ImageByProjectId)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch projects from MongoDB.';
    return res.status(500).json({ error: message });
  }
}
