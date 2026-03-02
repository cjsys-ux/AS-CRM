import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDb } from '../_mongodb';
import { getPublicS3Url } from '../_s3';

type MongoProject = {
  _id?: ObjectId;
  id?: string;
  name?: string;
  productName?: string;
  title?: string;
  client?: string;
  customer?: string;
  vendor?: string;
  supplier?: string;
  description?: string;
  status?: string;
  type?: string;
  yearlyQty?: number | string;
  yearlyQuantity?: number | string;
  pricePerUnit?: number | string;
  unitPrice?: number | string;
  totalValue?: number | string;
  priority?: string;
  deployment?: string;
  projectManager?: string;
  manager?: string;
  internalSKU?: string;
  sku?: string;
  targetMargin?: string | number;
  image?: string;
  imageUrl?: string;
  imageKey?: string;
  s3Key?: string;
  key?: string;
  fileKey?: string;
  thumbnail?: string;
  productImage?: string;
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

function getUploadImageUrl(upload: MongoUpload | undefined): string | null {
  if (!upload) return null;
  if (upload.fileUrl?.startsWith('http://') || upload.fileUrl?.startsWith('https://')) {
    return upload.fileUrl;
  }
  if (upload.key) return getPublicS3Url(upload.key);
  return null;
}

function resolveProjectImage(project: MongoProject, uploadByEntityId: Map<string, MongoUpload>): { imageUrl: string; fromMongoImageField: boolean } {
  const directImage = project.image ?? project.imageUrl ?? project.thumbnail ?? project.productImage;
  if (directImage?.startsWith('http://') || directImage?.startsWith('https://')) {
    return { imageUrl: directImage, fromMongoImageField: true };
  }

  const s3ObjectKey = project.imageKey ?? project.s3Key ?? project.fileKey ?? project.key;
  if (s3ObjectKey) {
    return { imageUrl: getPublicS3Url(s3ObjectKey), fromMongoImageField: true };
  }

  if (directImage) {
    return { imageUrl: getPublicS3Url(directImage), fromMongoImageField: true };
  }

  const projectId = project.id ?? project._id?.toString();
  const uploadImage = projectId ? getUploadImageUrl(uploadByEntityId.get(projectId)) : null;
  if (uploadImage) {
    return { imageUrl: uploadImage, fromMongoImageField: false };
  }

  return { imageUrl: defaultImage, fromMongoImageField: false };
}

function mapProject(project: MongoProject, uploadByEntityId: Map<string, MongoUpload>) {
  const yearlyQty = toNumber(project.yearlyQty ?? project.yearlyQuantity, 0);
  const pricePerUnit = toNumber(project.pricePerUnit ?? project.unitPrice, 0);
  const computedTotal = yearlyQty * pricePerUnit;
  const totalValue = toNumber(project.totalValue, computedTotal);
  const resolvedImage = resolveProjectImage(project, uploadByEntityId);

  return {
    id: project.id ?? project._id?.toString() ?? `project-${Math.random().toString(36).slice(2, 10)}`,
    name: project.name ?? project.productName ?? project.title ?? 'Untitled Project',
    client: project.client ?? project.customer ?? 'Unknown Client',
    vendor: project.vendor ?? project.supplier ?? 'N/A',
    description: project.description ?? '',
    status: normalizeStatus(project.status),
    type: project.type ?? 'Custom',
    yearlyQty,
    pricePerUnit,
    totalValue,
    priority: project.priority ?? 'Medium',
    deployment: project.deployment ?? 'TBD',
    projectManager: project.projectManager ?? project.manager ?? 'Unassigned',
    internalSKU: project.internalSKU ?? project.sku ?? '',
    targetMargin: project.targetMargin ? String(project.targetMargin) : '',
    image: resolvedImage.imageUrl,
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

    const uploads = (await db
      .collection<MongoUpload>('uploads')
      .find({
        entityId: { $in: projectIds },
        fileType: { $regex: '^image/', $options: 'i' },
      })
      .sort({ createdAt: -1 })
      .toArray()) as MongoUpload[];

    const uploadByEntityId = new Map<string, MongoUpload>();
    for (const upload of uploads) {
      if (upload.entityId && !uploadByEntityId.has(upload.entityId)) {
        uploadByEntityId.set(upload.entityId, upload);
      }
    }

    return res.status(200).json({ projects: projects.map((project) => mapProject(project, uploadByEntityId)) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch projects from MongoDB.';
    return res.status(500).json({ error: message });
  }
}
