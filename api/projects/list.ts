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

function resolveProjectImage(project: MongoProject): string {
  const directImage = project.image ?? project.imageUrl;
  if (directImage?.startsWith('http://') || directImage?.startsWith('https://')) {
    return directImage;
  }

  const s3ObjectKey = project.imageKey ?? project.s3Key ?? project.fileKey ?? project.key;
  if (s3ObjectKey) {
    return getPublicS3Url(s3ObjectKey);
  }

  if (directImage) {
    return getPublicS3Url(directImage);
  }

  return defaultImage;
}

function mapProject(project: MongoProject) {
  const yearlyQty = toNumber(project.yearlyQty ?? project.yearlyQuantity, 0);
  const pricePerUnit = toNumber(project.pricePerUnit ?? project.unitPrice, 0);
  const computedTotal = yearlyQty * pricePerUnit;
  const totalValue = toNumber(project.totalValue, computedTotal);

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
    image: resolveProjectImage(project),
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

    return res.status(200).json({ projects: projects.map(mapProject) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch projects from MongoDB.';
    return res.status(500).json({ error: message });
  }
}
