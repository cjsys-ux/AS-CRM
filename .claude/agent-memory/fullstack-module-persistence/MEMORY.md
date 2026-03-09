# Fullstack Module Persistence — Institutional Memory

## Project Structure

- **Frontend**: `/home/carlos/AS-CRM/src/components/` — all React components
- **Backend API**: `/home/carlos/AS-CRM/api/` — Vercel serverless functions (TypeScript)
- **Infra utilities**: `api/_mongodb.ts`, `api/_s3.ts`, `api/_mailer.ts`
- **Auth context**: `src/context/AuthContext.tsx` — provides `user.sub`, `user.name`, `user.email`

## API Architecture

- All backend handlers are Vercel serverless functions at `api/<module>/<action>.ts`
- Each handler exports a `default async function handler(req, res)` matching `VercelRequest/VercelResponse`
- HTTP method enforcement via `if (req.method !== 'X') return res.status(405)`
- Consistent response structure: `{ <entity>: {...} }` for single, `{ <entities>: [...] }` for lists
- Error responses: `{ error: string }` with appropriate HTTP status codes

## MongoDB Patterns

- Connection: `import { getDb } from '../_mongodb'` → `const db = await getDb()`
- Collection name convention: camelCase plural (e.g. `purchaseOrders`, `vendors`, `customers`, `projects`, `uploads`)
- Document IDs: MongoDB `_id` (ObjectId), exposed to frontend as `id: o._id.toString()`
- ObjectId parsing pattern:
  ```ts
  let filter: Record<string, unknown>;
  try {
    filter = { _id: new ObjectId(id as string) };
  } catch {
    filter = { id: id as string };
  }
  ```
- Update pattern: `ALLOWED_FIELDS` whitelist + `$set` with `updatedAt: new Date()`
- Timestamps: always include `createdAt: new Date()` and `updatedAt: new Date()` in `$set`
- Sub-documents (notes, timeline): use `$push` / `$pull` operators

## S3 Upload Pattern (Two-Step Presign)

The project uses a **presigned URL** upload flow (not direct base64 upload for most cases):

1. Client `POST /api/files/presign` with `{ fileName, fileType, entityType, entityId }` → receives `{ uploadUrl, key, fileUrl }`
2. Client `PUT uploadUrl` with raw `File` body and `Content-Type` header → file lands in S3
3. Client `POST /api/files/complete` with `{ key, fileName, fileType, size, entityType, entityId, uploadedBy }` → MongoDB `uploads` collection gets metadata record

The `api/files/upload.ts` handler supports base64 uploads (for profile images from server side). Prefer presign for client-side uploads.

### S3 Key Patterns
- Profile images: `profile-images/<safeId>/profile.<ext>`
- General uploads: `uploads/<scope>/<scopeId>/<timestamp>-<safeFileName>`
- Artwork for POs: `uploads/purchase-order-artwork/<poId>/<timestamp>-<filename>`

### `uploads` Collection Schema
```
{ key, fileName, fileType, size, entityType, entityId, uploadedBy, fileUrl, createdAt }
```
- `entityType`: scopes uploads to a module (e.g. `'pipeline-file'`, `'purchase-order-artwork'`, `'profile'`)
- `entityId`: the parent record's ID string
- `fileUrl`: public URL (from `getPublicS3Url(key)`)
- Raw binary **never** stored in MongoDB

## File Listing
- `GET /api/files/list?entityType=X&entityId=Y` → returns `{ uploads: [...] }`
- File deletion: `DELETE /api/files/delete` with `{ id }` (MongoDB record ID, not S3 key)

## Frontend Patterns

### Auth Access
```ts
import { useAuth } from '../context/AuthContext';
const { user } = useAuth();
// user.sub, user.name, user.email, user.email_verified
```

### Toast Notifications
```ts
import { toast } from 'sonner';
toast.success('Message');
toast.error('Error');
```
Note: some older files import `from 'sonner@2.0.3'` — use `from 'sonner'` for new code.

### API Fetch Pattern (Frontend)
```ts
const res = await fetch('/api/<module>/<action>', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...payload }),
});
if (!res.ok) {
  const data = await res.json();
  throw new Error(data.error ?? 'Failed');
}
const data = await res.json();
```

### Loading/Error/Success States
- Use `useState<boolean>` for `isLoading`, `isSaving`, `isDeleting`
- Show spinner (`Loader2` from lucide-react with `animate-spin`) on buttons while saving
- Disable buttons with `disabled={isSaving}` + `opacity-60 cursor-not-allowed` classes
- Table loading states: render a spinner row in `<tbody>` before data arrives
- Always use `toast.success` / `toast.error` from sonner for user feedback

### File Upload Client Flow
```ts
// 1. Validate
if (file.size > MAX_BYTES) { toast.error(...); return; }
// 2. Presign
const presignRes = await fetch('/api/files/presign', { method: 'POST', body: JSON.stringify({...}) });
const { uploadUrl, key, fileUrl } = await presignRes.json();
// 3. S3 upload
await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
// 4. Record metadata
await fetch('/api/files/complete', { method: 'POST', body: JSON.stringify({ key, fileName, ...}) });
```

## Purchasing Module Implementation

**Collection**: `purchaseOrders`

**Schema fields**:
- Core: `poNumber`, `poDate`, `project`, `vendor`, `customer`, `status`, `shipDate`, `inHandsDate`, `total`, `priority`, `contact`, `isSample`
- Logistics: `shippingMethod`, `carrierAccount`, `isBlindShip`, `shipToAddress` (embedded object)
- Line items: `lineItems[]`, `customLineItems[]`, `salesTaxRate`, `taxStatus`
- Contact details: `contactDetails` (embedded: email, phone)
- Artwork: `artworkDetails` (embedded object — metadata only, not binary)
- History: `notes[]`, `timelineEvents[]` (embedded arrays)
- Audit: `createdBy`, `createdAt`, `updatedAt`

**API endpoints**: `api/purchasing/create`, `list`, `get`, `update`, `delete`, `notes/create`, `notes/delete`

**Artwork uploads**: stored in S3, referenced via `uploads` collection with `entityType='purchase-order-artwork'`

**Field persistence strategy**: inline `persistField()` helper in `PurchaseOrderDetailView` that calls `PATCH /api/purchasing/update` immediately when any field changes (contact, ship dates, shipping method, carrier account, blind ship, line items, tax)

## Conventions Observed Across Modules

- Modules load data on `useEffect(() => { fetch... }, [])`
- Parent module holds list state; child detail view loads full record on mount
- `FilesTab.tsx` is a reusable file upload/list component scoped to `entityType`/`entityId`
- Vendor/Customer modules use `logoKey` (S3 key stored in MongoDB, URL derived via `getPublicS3Url`)
- No global state management (no Redux/Zustand) — all state is local React useState

## Git Branching

- Never push to `main`
- Preview branches: `preview/<feature-name>`
- Push: `git push origin HEAD:preview/<feature-name>`
