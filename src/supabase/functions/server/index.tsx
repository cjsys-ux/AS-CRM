import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as _kv from "./kv_store.tsx";
const app = new Hono();

// Retry helper for transient network errors (connection resets, etc.)
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 300): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const msg = String(err);
      const isTransient = msg.includes("connection reset") || msg.includes("connection error") || msg.includes("SendRequest");
      if (!isTransient || attempt === retries) throw err;
      console.log(`Transient error, retrying (${attempt + 1}/${retries})...`);
      await new Promise(r => setTimeout(r, delayMs * (attempt + 1)));
    }
  }
  throw new Error("withRetry exhausted");
}

// Shadow kv with retry-wrapped helpers so all existing kv.* calls auto-retry on transient failures
const kv = {
  get: (key: string) => withRetry(() => _kv.get(key)),
  set: (key: string, value: any) => withRetry(() => _kv.set(key, value)),
  del: (key: string) => withRetry(() => _kv.del(key)),
  mget: (keys: string[]) => withRetry(() => _kv.mget(keys)),
  mset: (entries: [string, any][]) => withRetry(() => _kv.mset(entries)),
  mdel: (keys: string[]) => withRetry(() => _kv.mdel(keys)),
  getByPrefix: (prefix: string) => withRetry(() => _kv.getByPrefix(prefix)),
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Idempotently create storage bucket — deferred to first relevant request to avoid blocking boot
let bucketChecked = false;
const BUCKET_NAME = "make-c0840c88-inventory-images";
const DESIGN_BUCKET = "make-c0840c88-design-files";
async function ensureBucket() {
  if (bucketChecked) return;
  bucketChecked = true;
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket: any) => bucket.name === BUCKET_NAME);
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: false });
      console.log(`Created storage bucket: ${BUCKET_NAME}`);
    }
    const designBucketExists = buckets?.some((bucket: any) => bucket.name === DESIGN_BUCKET);
    if (!designBucketExists) {
      await supabase.storage.createBucket(DESIGN_BUCKET, { public: false });
      console.log(`Created storage bucket: ${DESIGN_BUCKET}`);
    }
  } catch (err) {
    console.log("Error creating storage bucket:", err);
    bucketChecked = false; // retry next request
  }
}

// Helper: upload base64 data URL to Supabase Storage, return signed URL
async function uploadDesignFile(base64DataUrl: string, fileName: string, taskId: string): Promise<string | null> {
  try {
    await ensureBucket();
    const matches = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) return null;
    const contentType = matches[1];
    const base64Data = matches[2];

    // Decode base64 to Uint8Array
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const storagePath = `${taskId}/${Date.now()}-${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from(DESIGN_BUCKET)
      .upload(storagePath, bytes, { contentType, upsert: true });

    if (uploadError) {
      console.log("Upload error:", uploadError);
      return null;
    }

    const { data: signedData } = await supabase.storage
      .from(DESIGN_BUCKET)
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365); // 1 year

    return signedData?.signedUrl || null;
  } catch (err) {
    console.log("Error uploading design file:", err);
    return null;
  }
}

// Global error handler — ensures every request gets a response
app.onError((err, c) => {
  console.log(`Unhandled server error: ${err.message}`, err.stack);
  return c.json({ success: false, error: `Internal server error: ${err.message}` }, 500);
});

// 404 handler — ensures unmatched routes get a response
app.notFound((c) => {
  console.log(`Route not found: ${c.req.method} ${c.req.url}`);
  return c.json({ success: false, error: `Route not found: ${c.req.method} ${c.req.path}` }, 404);
});

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-c0840c88/health", (c) => {
  return c.json({ status: "ok" });
});

// ──── Project Number Helpers ────
// Pipeline/Amazon Distribution: ADP-00001
// Orders/Promotional Products:  PP-00001
// Legacy PRJ- prefix is treated as ADP- for backward compat

function extractSeqNum(projectNumber: string, prefix: string): number {
  if (!projectNumber) return 0;
  // Handle legacy PRJ- as ADP-
  const normalized = projectNumber.startsWith('PRJ-') && prefix === 'ADP-'
    ? projectNumber.replace('PRJ-', 'ADP-')
    : projectNumber;
  if (!normalized.startsWith(prefix)) return 0;
  const num = parseInt(normalized.replace(prefix, ''));
  return isNaN(num) ? 0 : num;
}

function migrateProjectNumber(projectNumber: string): string {
  if (projectNumber && projectNumber.startsWith('PRJ-')) {
    return projectNumber.replace('PRJ-', 'ADP-');
  }
  return projectNumber;
}

async function getNextProjectNumber(prefix: 'ADP-' | 'PP-'): Promise<string> {
  const padLen = 5;
  if (prefix === 'ADP-') {
    const products = await kv.getByPrefix("product:");
    const maxNum = (products as any[]).reduce((max: number, p: any) => {
      const n = extractSeqNum(p.projectNumber || '', 'ADP-');
      return n > max ? n : max;
    }, 0);
    return `ADP-${String(maxNum + 1).padStart(padLen, '0')}`;
  } else {
    const orders = await kv.getByPrefix("order:");
    const maxNum = (orders as any[]).reduce((max: number, o: any) => {
      const n = extractSeqNum(o.projectNumber || '', 'PP-');
      return n > max ? n : max;
    }, 0);
    return `PP-${String(maxNum + 1).padStart(padLen, '0')}`;
  }
}

// ============================================
// USER MANAGEMENT ENDPOINTS
// ============================================

// Get all users
app.get("/make-server-c0840c88/users", async (c) => {
  try {
    const users = await kv.getByPrefix("user:");
    return c.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single user by ID
app.get("/make-server-c0840c88/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const user = await kv.get(`user:${id}`);
    if (!user) {
      return c.json({ success: false, error: "User not found" }, 404);
    }
    return c.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create new user
app.post("/make-server-c0840c88/users", async (c) => {
  try {
    const user = await c.req.json();
    
    // Generate ID if not provided
    if (!user.id) {
      const allUsers = await kv.getByPrefix("user:");
      const maxId = allUsers.reduce((max, u) => {
        const num = parseInt(u.id);
        return num > max ? num : max;
      }, 0);
      user.id = String(maxId + 1);
    }
    
    // Add created timestamp
    user.created = new Date().toISOString();
    user.lastLogin = "Just now";
    
    await kv.set(`user:${user.id}`, user);
    return c.json({ success: true, user });
  } catch (error) {
    console.error("Error creating user:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update existing user
app.put("/make-server-c0840c88/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(`user:${id}`);
    if (!existing) {
      return c.json({ success: false, error: "User not found" }, 404);
    }
    
    const updated = { ...existing, ...updates, id }; // Preserve ID
    await kv.set(`user:${id}`, updated);
    return c.json({ success: true, user: updated });
  } catch (error) {
    console.error("Error updating user:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete user
app.delete("/make-server-c0840c88/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`user:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// PRODUCT ENDPOINTS
// ============================================

// Get all products
app.get("/make-server-c0840c88/products", async (c) => {
  try {
    const products = await kv.getByPrefix("product:");
    
    // Migrate legacy PRJ- to ADP- and backfill missing projectNumbers
    const toUpdate: any[] = [];
    for (const p of products as any[]) {
      if (p.projectNumber && p.projectNumber.startsWith('PRJ-')) {
        p.projectNumber = migrateProjectNumber(p.projectNumber);
        toUpdate.push(p);
      }
    }
    let maxPrjNum = (products as any[]).reduce((max: number, p: any) => {
      const n = extractSeqNum(p.projectNumber || '', 'ADP-');
      return n > max ? n : max;
    }, 0);
    for (const p of products as any[]) {
      if (!p.projectNumber) {
        maxPrjNum++;
        p.projectNumber = `ADP-${String(maxPrjNum).padStart(5, "0")}`;
        toUpdate.push(p);
      }
    }
    
    // Persist backfilled project numbers
    if (toUpdate.length > 0) {
      const keys: string[] = [];
      const values: any[] = [];
      for (const p of toUpdate) {
        keys.push(`product:${p.id}`);
        values.push(p);
      }
      await kv.mset(keys, values);
    }
    
    return c.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single product by ID
app.get("/make-server-c0840c88/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const product = await kv.get(`product:${id}`);
    if (!product) {
      return c.json({ success: false, error: "Product not found" }, 404);
    }
    return c.json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create new product
app.post("/make-server-c0840c88/products", async (c) => {
  try {
    const product = await c.req.json();
    
    // Generate ID if not provided
    if (!product.id) {
      const allProducts = await kv.getByPrefix("product:");
      const maxId = allProducts.reduce((max: number, p: any) => {
        const num = parseInt(p.id.replace("PRD-", ""));
        return num > max ? num : max;
      }, 0);
      product.id = `PRD-${String(maxId + 1).padStart(3, "0")}`;
    }

    // Auto-generate ADP- projectNumber for pipeline products if not provided
    if (!product.projectNumber) {
      product.projectNumber = await getNextProjectNumber('ADP-');
    } else if (product.projectNumber.startsWith('PRJ-')) {
      product.projectNumber = migrateProjectNumber(product.projectNumber);
    }
    
    await kv.set(`product:${product.id}`, product);
    
    // Add "New Product Created" timeline event
    const timelineEvent = {
      id: `TIMELINE-${Date.now()}`,
      type: 'milestone' as const,
      title: 'New Product Created',
      description: `Product "${product.name}" was added to the pipeline`,
      user: 'System',
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      icon: 'package',
      color: 'green',
      productId: product.id,
    };
    await kv.set(`timeline:${product.id}:${timelineEvent.id}`, timelineEvent);
    
    return c.json({ success: true, product });
  } catch (error) {
    console.error("Error creating product:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get product vendors (product-specific vendor network)
app.get("/make-server-c0840c88/products/:productId/vendors", async (c) => {
  try {
    const productId = c.req.param("productId");
    const vendors = await kv.getByPrefix(`productvendor:${productId}:`);
    return c.json({ success: true, vendors });
  } catch (error) {
    console.error("Error fetching product vendors:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Link an existing global vendor to a product
app.post("/make-server-c0840c88/products/:productId/link-vendor", async (c) => {
  try {
    const productId = c.req.param("productId");
    const vendorData = await c.req.json();
    
    if (!vendorData.id) {
      return c.json({ success: false, error: "Vendor ID is required" }, 400);
    }

    // Enrich with global vendor data (e.g. supportsDropShipping, type) if not already set
    try {
      const globalVendor: any = await kv.get(`globalvendor:${vendorData.globalVendorId || vendorData.id}`);
      if (globalVendor) {
        if (vendorData.supportsDropShipping === undefined || vendorData.supportsDropShipping === null) {
          vendorData.supportsDropShipping = globalVendor.supportsDropShipping ?? false;
        }
        // Fix vendor type if it's 'Standalone' or missing — pull real type from global vendor
        if (!vendorData.type || vendorData.type === 'Standalone') {
          vendorData.type = globalVendor.type || globalVendor.vendorType || vendorData.type || 'Standalone';
        }
      }
    } catch (enrichErr) {
      console.log("Non-fatal: could not enrich vendor from global record:", enrichErr);
    }
    
    await kv.set(`productvendor:${productId}:${vendorData.id}`, {
      ...vendorData,
      productId,
      linkedAt: new Date().toISOString(),
    });
    
    // Add timeline event
    const timelineEvent = {
      id: `TIMELINE-${Date.now()}`,
      type: 'edit' as const,
      title: 'Vendor Linked',
      description: `Vendor "${vendorData.name}" was linked to this product as ${vendorData.priority || 'Primary'}`,
      user: 'System',
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      icon: 'package',
      color: 'blue',
      productId,
    };
    await kv.set(`timeline:${productId}:${timelineEvent.id}`, timelineEvent);
    
    return c.json({ success: true, vendor: vendorData });
  } catch (error) {
    console.error("Error linking vendor to product:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Unlink a vendor from a product
app.delete("/make-server-c0840c88/products/:productId/link-vendor/:vendorId", async (c) => {
  try {
    const productId = c.req.param("productId");
    const vendorId = c.req.param("vendorId");
    
    await kv.del(`productvendor:${productId}:${vendorId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error unlinking vendor from product:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update a product vendor's pricing tiers
app.put("/make-server-c0840c88/products/:productId/vendors/:vendorId", async (c) => {
  try {
    const productId = c.req.param("productId");
    const vendorId = c.req.param("vendorId");
    const updates = await c.req.json();
    
    const existing = await kv.get(`productvendor:${productId}:${vendorId}`);
    if (!existing) {
      return c.json({ success: false, error: "Product vendor not found" }, 404);
    }
    
    const updated = { ...existing, ...updates };
    await kv.set(`productvendor:${productId}:${vendorId}`, updated);
    
    return c.json({ success: true, vendor: updated });
  } catch (error) {
    console.error("Error updating product vendor:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get checklist for a product
app.get("/make-server-c0840c88/products/:productId/checklist", async (c) => {
  try {
    const productId = c.req.param("productId");
    const checklist = await kv.get(`checklist:${productId}`);
    return c.json({ success: true, checklist: checklist || null });
  } catch (error) {
    console.error("Error fetching product checklist:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Save checklist for a product (full checklist object with all tabs)
app.put("/make-server-c0840c88/products/:productId/checklist", async (c) => {
  try {
    const productId = c.req.param("productId");
    const checklist = await c.req.json();
    
    await kv.set(`checklist:${productId}`, checklist);
    
    // Calculate overall progress and store on product
    let totalItems = 0;
    let completedItems = 0;
    for (const tabId of Object.keys(checklist)) {
      const items = checklist[tabId];
      if (Array.isArray(items)) {
        totalItems += items.length;
        completedItems += items.filter((i: any) => i.completed).length;
      }
    }
    
    // Update product with progress info
    const product = await kv.get(`product:${productId}`);
    if (product) {
      const updated = {
        ...product,
        checklistTotal: totalItems,
        checklistCompleted: completedItems,
      };
      await kv.set(`product:${productId}`, updated);
    }
    
    return c.json({ success: true, totalItems, completedItems });
  } catch (error) {
    console.error("Error saving product checklist:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Auto-update product status to "In Progress"
app.post("/make-server-c0840c88/products/:productId/auto-progress", async (c) => {
  try {
    const productId = c.req.param("productId");
    const product = await kv.get(`product:${productId}`);
    
    if (!product) {
      return c.json({ success: false, error: "Product not found" }, 404);
    }
    
    if (product.status === 'New Product') {
      const updated = { ...product, status: 'In Progress' };
      await kv.set(`product:${productId}`, updated);
      
      // Add timeline event
      const timelineEvent = {
        id: `TIMELINE-${Date.now()}`,
        type: 'edit' as const,
        title: 'Status Auto-Updated',
        description: 'Status changed from "New Product" to "In Progress" based on user activity',
        user: 'System',
        timestamp: new Date().toLocaleString('en-US', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', hour12: true,
        }),
        icon: 'activity',
        color: 'blue',
        productId,
      };
      await kv.set(`timeline:${productId}:${timelineEvent.id}`, timelineEvent);
      
      return c.json({ success: true, statusChanged: true, newStatus: 'In Progress' });
    }
    
    return c.json({ success: true, statusChanged: false, currentStatus: product.status });
  } catch (error) {
    console.error("Error auto-updating product status:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update existing product
app.put("/make-server-c0840c88/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(`product:${id}`);
    if (!existing) {
      return c.json({ success: false, error: "Product not found" }, 404);
    }
    
    const updated = { ...existing, ...updates, id }; // Preserve ID
    await kv.set(`product:${id}`, updated);
    return c.json({ success: true, product: updated });
  } catch (error) {
    console.error("Error updating product:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete product
app.delete("/make-server-c0840c88/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`product:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Bulk delete products
app.post("/make-server-c0840c88/products/bulk-delete", async (c) => {
  try {
    const { ids } = await c.req.json();
    const keys = ids.map((id: string) => `product:${id}`);
    await kv.mdel(keys);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error bulk deleting products:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Bulk update products
app.post("/make-server-c0840c88/products/bulk-update", async (c) => {
  try {
    const { ids, updates } = await c.req.json();
    
    const products = await kv.mget(ids.map((id: string) => `product:${id}`));
    const updatedProducts = products.map((product: any) => ({
      ...product,
      ...updates,
    }));
    
    const kvPairs = updatedProducts.map((product: any) => ({
      key: `product:${product.id}`,
      value: product,
    }));
    
    await kv.mset(kvPairs);
    return c.json({ success: true, products: updatedProducts });
  } catch (error) {
    console.error("Error bulk updating products:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Remove background from image
app.post("/make-server-c0840c88/remove-background", async (c) => {
  try {
    const { imageBase64 } = await c.req.json();
    
    const apiKey = Deno.env.get('REMOVE_BG_API_KEY');
    if (!apiKey) {
      // Silently return — feature is deprioritized
      return c.json({ success: false, error: "Background removal temporarily unavailable." }, 200);
    }

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    // Convert base64 to binary
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Create form data
    const formData = new FormData();
    formData.append('image_file_b64', base64Data);
    formData.append('size', 'auto');
    
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: formData,
    });
    
    if (!response.ok) {
      // Silently handle — Remove.bg feature is deprioritized, suppress log noise
      const hint = response.status === 403 
        ? "Background removal temporarily unavailable (API key expired)."
        : `Background removal unavailable: ${response.status}`;
      return c.json({ success: false, error: hint }, 200);
    }
    
    // Get the image as array buffer
    const imageBuffer = await response.arrayBuffer();
    
    // Convert to base64
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    const imageUrl = `data:image/png;base64,${base64Image}`;
    
    return c.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Error removing background:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== VENDOR ENDPOINTS ====================

// Get all vendors for a product
app.get("/make-server-c0840c88/products/:productId/vendors", async (c) => {
  try {
    const productId = c.req.param("productId");
    const vendors = await kv.getByPrefix(`vendor:${productId}:`);
    return c.json({ success: true, vendors });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single vendor by ID
app.get("/make-server-c0840c88/products/:productId/vendors/:vendorId", async (c) => {
  try {
    const productId = c.req.param("productId");
    const vendorId = c.req.param("vendorId");
    const vendor = await kv.get(`vendor:${productId}:${vendorId}`);
    if (!vendor) {
      return c.json({ success: false, error: "Vendor not found" }, 404);
    }
    return c.json({ success: true, vendor });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create new vendor for a product
app.post("/make-server-c0840c88/products/:productId/vendors", async (c) => {
  try {
    const productId = c.req.param("productId");
    const vendor = await c.req.json();
    
    // Generate ID if not provided
    if (!vendor.id) {
      const allVendors = await kv.getByPrefix(`vendor:${productId}:`);
      const maxId = allVendors.reduce((max, v) => {
        const num = parseInt(v.id.replace("VEND-", ""));
        return num > max ? num : max;
      }, 0);
      vendor.id = `VEND-${String(maxId + 1).padStart(3, "0")}`;
    }
    
    vendor.productId = productId;
    vendor.createdAt = new Date().toISOString();
    
    await kv.set(`vendor:${productId}:${vendor.id}`, vendor);
    return c.json({ success: true, vendor });
  } catch (error) {
    console.error("Error creating vendor:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update existing vendor
app.put("/make-server-c0840c88/products/:productId/vendors/:vendorId", async (c) => {
  try {
    const productId = c.req.param("productId");
    const vendorId = c.req.param("vendorId");
    const updates = await c.req.json();
    
    const existing = await kv.get(`vendor:${productId}:${vendorId}`);
    if (!existing) {
      return c.json({ success: false, error: "Vendor not found" }, 404);
    }
    
    const updated = { ...existing, ...updates, id: vendorId, productId };
    updated.updatedAt = new Date().toISOString();
    
    await kv.set(`vendor:${productId}:${vendorId}`, updated);
    return c.json({ success: true, vendor: updated });
  } catch (error) {
    console.error("Error updating vendor:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete vendor
app.delete("/make-server-c0840c88/products/:productId/vendors/:vendorId", async (c) => {
  try {
    const productId = c.req.param("productId");
    const vendorId = c.req.param("vendorId");
    await kv.del(`vendor:${productId}:${vendorId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== GLOBAL CUSTOMERS ENDPOINTS ====================

// Get all customers
app.get("/make-server-c0840c88/customers", async (c) => {
  try {
    const customers = await kv.getByPrefix("customer:");
    return c.json({ success: true, customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Search companies
app.get("/make-server-c0840c88/search-companies", async (c) => {
  try {
    const query = c.req.query("query")?.toLowerCase() || "";
    if (query.length < 3) {
      return c.json({ success: true, companies: [] });
    }
    
    const customers = await kv.getByPrefix("customer:");
    const filteredCompanies = customers.filter((customer: any) => 
      customer.name?.toLowerCase().includes(query)
    );
    
    return c.json({ success: true, companies: filteredCompanies });
  } catch (error) {
    console.error("Error searching companies:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single customer by ID
app.get("/make-server-c0840c88/customers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const customer = await kv.get(`customer:${id}`);
    if (!customer) {
      return c.json({ success: false, error: "Customer not found" }, 404);
    }
    return c.json({ success: true, customer });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create new customer
app.post("/make-server-c0840c88/customers", async (c) => {
  try {
    const customer = await c.req.json();
    
    // Generate ID if not provided
    if (!customer.id) {
      const allCustomers = await kv.getByPrefix("customer:");
      const maxId = allCustomers.reduce((max, c) => {
        const num = parseInt(c.id.replace("CUST-", ""));
        return num > max ? num : max;
      }, 0);
      customer.id = `CUST-${String(maxId + 1).padStart(3, "0")}`;
    }
    
    customer.createdAt = new Date().toISOString();
    
    await kv.set(`customer:${customer.id}`, customer);
    return c.json({ success: true, customer });
  } catch (error) {
    console.error("Error creating customer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update existing customer
app.put("/make-server-c0840c88/customers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(`customer:${id}`);
    if (!existing) {
      return c.json({ success: false, error: "Customer not found" }, 404);
    }
    
    const updated = { ...existing, ...updates, id }; // Preserve ID
    updated.updatedAt = new Date().toISOString();
    
    await kv.set(`customer:${id}`, updated);
    return c.json({ success: true, customer: updated });
  } catch (error) {
    console.error("Error updating customer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete customer
app.delete("/make-server-c0840c88/customers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`customer:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== GLOBAL VENDORS ENDPOINTS ====================

// Get all global vendors
app.get("/make-server-c0840c88/vendors", async (c) => {
  try {
    const rawVendors = await kv.getByPrefix("globalvendor:");
    const vendors: any[] = [];
    for (const v of rawVendors) {
      try {
        const val = typeof v === 'object' && (v as any).value !== undefined ? (v as any).value : v;
        const parsed = typeof val === 'string' ? JSON.parse(val) : val;
        if (parsed && parsed.id) vendors.push(parsed);
      } catch { /* skip malformed */ }
    }
    return c.json({ success: true, vendors });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single global vendor by ID
app.get("/make-server-c0840c88/vendors/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const vendor = await kv.get(`globalvendor:${id}`);
    if (!vendor) {
      return c.json({ success: false, error: "Vendor not found" }, 404);
    }
    return c.json({ success: true, vendor });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ─── Helper: Sync vendor contact info to global contacts module ───
async function syncVendorContact(vendor: any) {
  try {
    const contactName = vendor.contactName || [vendor.firstName, vendor.lastName].filter(Boolean).join(" ");
    if (!contactName || !contactName.trim()) return; // No contact info to sync

    // Use a deterministic contact ID tied to the vendor so we can update it later
    const contactId = `CON-V-${vendor.id}`;

    // Check if this synced contact already exists
    const existing: any = await kv.get(`contact:${contactId}`);

    const nameParts = contactName.trim().split(/\s+/);
    const firstName = vendor.firstName || nameParts[0] || "";
    const lastName = vendor.lastName || nameParts.slice(1).join(" ") || "";

    const contactRecord = {
      ...(existing || {}),
      id: contactId,
      name: contactName.trim(),
      firstName,
      lastName,
      email: vendor.email || "",
      phone: vendor.phone || "",
      company: vendor.name || "",
      position: existing?.position || "",
      wechatId: existing?.wechatId || vendor.wechatId || "",
      type: "Vendor",
      status: vendor.status === "Inactive" ? "Inactive" : "Active",
      country: vendor.country || "",
      vendorId: vendor.id,
      lastContact: existing?.lastContact || new Date().toISOString().split("T")[0],
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`contact:${contactId}`, contactRecord);
    console.log(`Synced vendor contact ${contactId} for vendor ${vendor.id}`);
  } catch (err) {
    console.error("Error syncing vendor contact to contacts module:", err);
    // Non-fatal: don't block vendor creation/update
  }
}

// Create new global vendor
app.post("/make-server-c0840c88/vendors", async (c) => {
  try {
    const vendor = await c.req.json();
    
    // Generate ID if not provided
    if (!vendor.id) {
      const allVendors = await kv.getByPrefix("globalvendor:");
      const maxId = allVendors.reduce((max, v) => {
        const num = parseInt(v.id.replace("VEND-", ""));
        return num > max ? num : max;
      }, 0);
      vendor.id = `VEND-${String(maxId + 1).padStart(3, "0")}`;
    }
    
    vendor.createdAt = new Date().toISOString();
    
    await kv.set(`globalvendor:${vendor.id}`, vendor);

    // Auto-sync vendor contact info to the global contacts module
    await syncVendorContact(vendor);

    // Auto-create a vendor contact entry if contact info is provided (set as primary by default)
    try {
      const contactName = vendor.contactName || [vendor.firstName, vendor.lastName].filter(Boolean).join(" ");
      if (contactName && contactName.trim()) {
        const contactId = `VCON-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const now = new Date().toISOString();
        const nameParts = contactName.trim().split(/\s+/);
        const vendorContact = {
          id: contactId,
          vendorId: vendor.id,
          name: contactName.trim(),
          firstName: vendor.firstName || nameParts[0] || "",
          lastName: vendor.lastName || nameParts.slice(1).join(" ") || "",
          title: "",
          email: vendor.email || "",
          phone: vendor.phone || "",
          wechatId: vendor.wechatId || "",
          department: "",
          isPrimary: true,
          notes: "",
          createdAt: now,
          updatedAt: now,
        };
        await kv.set(`vendorcontact:${vendor.id}:${contactId}`, vendorContact);
        console.log(`Auto-created vendor contact ${contactId} for new vendor ${vendor.id}`);
      }
    } catch (err) {
      console.error("Error auto-creating vendor contact:", err);
    }

    return c.json({ success: true, vendor });
  } catch (error) {
    console.error("Error creating vendor:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update existing global vendor
app.put("/make-server-c0840c88/vendors/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(`globalvendor:${id}`);
    if (!existing) {
      return c.json({ success: false, error: "Vendor not found" }, 404);
    }
    
    const updated = { ...existing, ...updates, id }; // Preserve ID
    updated.updatedAt = new Date().toISOString();
    
    await kv.set(`globalvendor:${id}`, updated);

    // Auto-sync vendor contact info to the global contacts module
    await syncVendorContact(updated);

    return c.json({ success: true, vendor: updated });
  } catch (error) {
    console.error("Error updating vendor:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete global vendor (cascade deletes all related data)
app.delete("/make-server-c0840c88/vendors/:id", async (c) => {
  try {
    const id = c.req.param("id");

    // Cascade delete all related vendor data
    // 1. Delete all vendor contacts
    try {
      const contacts = await kv.getByPrefix(`vendorcontact:${id}:`);
      if (contacts.length > 0) {
        await kv.mdel(contacts.map((ct: any) => `vendorcontact:${id}:${ct.id}`));
        console.log(`Cascade deleted ${contacts.length} vendor contacts for vendor ${id}`);
      }
    } catch (err) {
      console.error("Error cascade deleting vendor contacts:", err);
    }

    // 2. Delete the synced global contact entry
    try {
      await kv.del(`contact:CON-V-${id}`);
      console.log(`Cascade deleted global contact CON-V-${id}`);
    } catch (err) {
      console.error("Error cascade deleting global contact:", err);
    }

    // 3. Delete all vendor documents
    try {
      const docs = await kv.getByPrefix(`vendordoc:${id}:`);
      if (docs.length > 0) {
        await kv.mdel(docs.map((d: any) => `vendordoc:${id}:${d.id}`));
        console.log(`Cascade deleted ${docs.length} vendor documents for vendor ${id}`);
      }
    } catch (err) {
      console.error("Error cascade deleting vendor documents:", err);
    }

    // 4. Delete all vendor activity
    try {
      const activities = await kv.getByPrefix(`vendoractivity:${id}:`);
      if (activities.length > 0) {
        await kv.mdel(activities.map((a: any) => `vendoractivity:${id}:${a.id}`));
        console.log(`Cascade deleted ${activities.length} vendor activities for vendor ${id}`);
      }
    } catch (err) {
      console.error("Error cascade deleting vendor activities:", err);
    }

    // 5. Delete all vendor addresses
    try {
      const addresses = await kv.getByPrefix(`vendoraddress:${id}:`);
      if (addresses.length > 0) {
        await kv.mdel(addresses.map((a: any) => `vendoraddress:${id}:${a.id}`));
        console.log(`Cascade deleted ${addresses.length} vendor addresses for vendor ${id}`);
      }
    } catch (err) {
      console.error("Error cascade deleting vendor addresses:", err);
    }

    // Finally, delete the vendor itself
    await kv.del(`globalvendor:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== VENDOR DOCUMENTS ENDPOINTS ====================

// Get all documents for a vendor
app.get("/make-server-c0840c88/vendors/:vendorId/documents", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const docs = await kv.getByPrefix(`vendordoc:${vendorId}:`);
    const documents = docs.map((d: any) => {
      // Return metadata only, not file content
      const { fileData, ...meta } = d;
      return meta;
    });
    // Sort by uploadDate descending
    documents.sort((a: any, b: any) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    return c.json({ success: true, documents });
  } catch (error) {
    console.error("Error fetching vendor documents:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Upload a document for a vendor
app.post("/make-server-c0840c88/vendors/:vendorId/documents", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const body = await c.req.json();
    const { name, type, size, fileData, preview, uploadedBy } = body;
    
    if (!name) {
      return c.json({ success: false, error: "Document name is required" }, 400);
    }

    const docId = `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const document: Record<string, any> = {
      id: docId,
      vendorId,
      name,
      type: type || "Other",
      size: size || "Unknown",
      fileData: fileData || null,
      uploadDate: now.split("T")[0],
      createdAt: now,
      uploadedBy: uploadedBy || null,
    };
    if (preview) {
      document.preview = preview;
    }

    await kv.set(`vendordoc:${vendorId}:${docId}`, document);
    
    // Log activity for document upload
    const activityId = `ACT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const activity = {
      id: activityId,
      vendorId,
      date: now.split("T")[0],
      type: "Document",
      description: `Uploaded document: ${name}`,
      amount: null,
      createdAt: now,
    };
    await kv.set(`vendoractivity:${vendorId}:${activityId}`, activity);
    
    // Return metadata only (exclude fileData but keep preview)
    const { fileData: _, ...meta } = document;
    return c.json({ success: true, document: meta });
  } catch (error) {
    console.error("Error uploading vendor document:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Download a vendor document (returns file data)
app.get("/make-server-c0840c88/vendors/:vendorId/documents/:docId/download", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const docId = c.req.param("docId");
    const doc = await kv.get(`vendordoc:${vendorId}:${docId}`);
    if (!doc) {
      return c.json({ success: false, error: "Document not found" }, 404);
    }
    return c.json({ success: true, document: doc });
  } catch (error) {
    console.error("Error downloading vendor document:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a vendor document
app.delete("/make-server-c0840c88/vendors/:vendorId/documents/:docId", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const docId = c.req.param("docId");
    
    const existing = await kv.get(`vendordoc:${vendorId}:${docId}`);
    if (!existing) {
      return c.json({ success: false, error: "Document not found" }, 404);
    }
    
    await kv.del(`vendordoc:${vendorId}:${docId}`);
    
    // Log activity for document deletion
    const activityId = `ACT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const activity = {
      id: activityId,
      vendorId,
      date: new Date().toISOString().split("T")[0],
      type: "Document",
      description: `Deleted document: ${(existing as any).name || docId}`,
      amount: null,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`vendoractivity:${vendorId}:${activityId}`, activity);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting vendor document:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== VENDOR CONTACTS ENDPOINTS ====================

// Get all contacts for a vendor
app.get("/make-server-c0840c88/vendors/:vendorId/contacts", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const contacts = await kv.getByPrefix(`vendorcontact:${vendorId}:`);
    contacts.sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return c.json({ success: true, contacts });
  } catch (error) {
    console.error("Error fetching vendor contacts:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a vendor contact
app.post("/make-server-c0840c88/vendors/:vendorId/contacts", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const body = await c.req.json();
    const contactId = `VCON-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const fullName = body.name || [body.firstName, body.lastName].filter(Boolean).join(" ") || "";
    const contact = {
      id: contactId,
      vendorId,
      name: fullName,
      firstName: body.firstName || "",
      lastName: body.lastName || "",
      title: body.title || "",
      email: body.email || "",
      phone: body.phone || "",
      wechatId: body.wechatId || "",
      department: body.department || "",
      isPrimary: body.isPrimary || false,
      notes: body.notes || "",
      createdAt: now,
      updatedAt: now,
    };
    await kv.set(`vendorcontact:${vendorId}:${contactId}`, contact);

    // If set as primary, update the vendor's overview contact info
    if (contact.isPrimary) {
      try {
        const vendor: any = await kv.get(`globalvendor:${vendorId}`);
        if (vendor) {
          vendor.contactName = fullName;
          vendor.firstName = contact.firstName;
          vendor.lastName = contact.lastName;
          vendor.email = contact.email;
          vendor.phone = contact.phone;
          vendor.contact = fullName;
          vendor.updatedAt = now;
          await kv.set(`globalvendor:${vendorId}`, vendor);
          // Also sync to global contacts module
          await syncVendorContact(vendor);
        }
      } catch (err) {
        console.error("Error syncing primary contact to vendor:", err);
      }
    }

    const activityId = `ACT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await kv.set(`vendoractivity:${vendorId}:${activityId}`, {
      id: activityId, vendorId, date: now.split("T")[0], type: "Contact",
      description: `Added contact: ${fullName}`, amount: null, createdAt: now,
    });

    return c.json({ success: true, contact });
  } catch (error) {
    console.error("Error creating vendor contact:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update a vendor contact
app.put("/make-server-c0840c88/vendors/:vendorId/contacts/:contactId", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const contactId = c.req.param("contactId");
    const updates = await c.req.json();
    const existing = await kv.get(`vendorcontact:${vendorId}:${contactId}`);
    if (!existing) return c.json({ success: false, error: "Contact not found" }, 404);
    const now = new Date().toISOString();
    // Compute full name from firstName/lastName if provided
    if (updates.firstName !== undefined || updates.lastName !== undefined) {
      const fn = updates.firstName ?? (existing as any).firstName ?? "";
      const ln = updates.lastName ?? (existing as any).lastName ?? "";
      updates.name = [fn, ln].filter(Boolean).join(" ");
    }
    const updated = { ...existing, ...updates, id: contactId, vendorId, updatedAt: now };
    await kv.set(`vendorcontact:${vendorId}:${contactId}`, updated);

    // If set as primary, update the vendor's overview contact info
    if ((updated as any).isPrimary) {
      try {
        const vendor: any = await kv.get(`globalvendor:${vendorId}`);
        if (vendor) {
          vendor.contactName = (updated as any).name || "";
          vendor.firstName = (updated as any).firstName || "";
          vendor.lastName = (updated as any).lastName || "";
          vendor.email = (updated as any).email || "";
          vendor.phone = (updated as any).phone || "";
          vendor.contact = (updated as any).name || "";
          vendor.updatedAt = now;
          await kv.set(`globalvendor:${vendorId}`, vendor);
          await syncVendorContact(vendor);
        }
      } catch (err) {
        console.error("Error syncing primary contact to vendor:", err);
      }
    }

    // Sync position/title and wechatId to the global contacts module entry (CON-V-{vendorId})
    try {
      const globalContactId = `CON-V-${vendorId}`;
      const globalContact: any = await kv.get(`contact:${globalContactId}`);
      if (globalContact) {
        let needsUpdate = false;
        // Sync position/title if this is the primary contact or if there's only one contact
        if ((updated as any).isPrimary) {
          if ((updated as any).title !== undefined) {
            globalContact.position = (updated as any).title || "";
            needsUpdate = true;
          }
          if ((updated as any).wechatId !== undefined) {
            globalContact.wechatId = (updated as any).wechatId || "";
            needsUpdate = true;
          }
          // Also sync name, email, phone for primary contact
          globalContact.name = (updated as any).name || globalContact.name;
          globalContact.firstName = (updated as any).firstName || globalContact.firstName;
          globalContact.lastName = (updated as any).lastName || globalContact.lastName;
          globalContact.email = (updated as any).email || globalContact.email;
          globalContact.phone = (updated as any).phone || globalContact.phone;
          needsUpdate = true;
        }
        if (needsUpdate) {
          globalContact.updatedAt = now;
          await kv.set(`contact:${globalContactId}`, globalContact);
          console.log(`Synced vendor contact updates to global contact ${globalContactId}`);
        }
      }
    } catch (err) {
      console.error("Error syncing vendor contact to global contacts module:", err);
    }

    return c.json({ success: true, contact: updated });
  } catch (error) {
    console.error("Error updating vendor contact:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a vendor contact
app.delete("/make-server-c0840c88/vendors/:vendorId/contacts/:contactId", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const contactId = c.req.param("contactId");
    const existing = await kv.get(`vendorcontact:${vendorId}:${contactId}`);
    if (!existing) return c.json({ success: false, error: "Contact not found" }, 404);
    await kv.del(`vendorcontact:${vendorId}:${contactId}`);
    const now = new Date().toISOString();
    const activityId = `ACT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await kv.set(`vendoractivity:${vendorId}:${activityId}`, {
      id: activityId, vendorId, date: now.split("T")[0], type: "Contact",
      description: `Removed contact: ${(existing as any).name || contactId}`, amount: null, createdAt: now,
    });
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting vendor contact:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== VENDOR PRODUCTS ENDPOINT ====================

// Get products associated with a vendor (by vendor name)
app.get("/make-server-c0840c88/vendors/:vendorId/products", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const vendor = await kv.get(`vendor:${vendorId}`);
    if (!vendor) return c.json({ success: false, error: "Vendor not found" }, 404);
    const vendorName = (vendor as any).name || "";
    const allProducts = await kv.getByPrefix("product:");
    const vendorProducts = allProducts.filter((p: any) =>
      p.vendor && p.vendor.toLowerCase() === vendorName.toLowerCase()
    );
    return c.json({ success: true, products: vendorProducts });
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== CUSTOMER CONTACTS ENDPOINTS ====================

// Add contact to customer
app.post("/make-server-c0840c88/customers/:customerId/contacts", async (c) => {
  try {
    const customerId = c.req.param("customerId");
    const contact = await c.req.json();
    
    // Generate ID if not provided
    if (!contact.id) {
      contact.id = `CONTACT-${Date.now()}`;
    }
    
    // Get customer
    const customer = await kv.get(`customer:${customerId}`);
    if (!customer) {
      return c.json({ success: false, error: "Customer not found" }, 404);
    }
    
    // Add contact to customer's contacts array
    if (!customer.contacts) {
      customer.contacts = [];
    }
    customer.contacts.push(contact);
    
    // Save updated customer
    await kv.set(`customer:${customerId}`, customer);
    
    return c.json({ success: true, contact });
  } catch (error) {
    console.error("Error adding contact to customer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete contact from customer
app.delete("/make-server-c0840c88/customers/:customerId/contacts/:contactId", async (c) => {
  try {
    const customerId = c.req.param("customerId");
    const contactId = c.req.param("contactId");
    
    // Get customer
    const customer = await kv.get(`customer:${customerId}`);
    if (!customer) {
      return c.json({ success: false, error: "Customer not found" }, 404);
    }
    
    // Remove contact from customer's contacts array
    if (customer.contacts) {
      customer.contacts = customer.contacts.filter((c: any) => c.id !== contactId);
    }
    
    // Save updated customer
    await kv.set(`customer:${customerId}`, customer);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting contact from customer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== CUSTOMER ADDRESSES ENDPOINTS ====================

// Add address to customer
app.post("/make-server-c0840c88/customers/:customerId/addresses", async (c) => {
  try {
    const customerId = c.req.param("customerId");
    const address = await c.req.json();
    
    // Generate ID if not provided
    if (!address.id) {
      address.id = `ADDRESS-${Date.now()}`;
    }
    
    // Get customer
    const customer = await kv.get(`customer:${customerId}`);
    if (!customer) {
      return c.json({ success: false, error: "Customer not found" }, 404);
    }
    
    // If new address is primary, set all others to non-primary
    if (address.isPrimary && customer.addresses) {
      customer.addresses = customer.addresses.map((a: any) => ({ ...a, isPrimary: false }));
    }
    
    // Add address to customer's addresses array
    if (!customer.addresses) {
      customer.addresses = [];
    }
    customer.addresses.push(address);
    
    // Save updated customer
    await kv.set(`customer:${customerId}`, customer);
    
    return c.json({ success: true, address });
  } catch (error) {
    console.error("Error adding address to customer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update primary address
app.put("/make-server-c0840c88/customers/:customerId/addresses/:addressId/primary", async (c) => {
  try {
    const customerId = c.req.param("customerId");
    const addressId = c.req.param("addressId");
    
    // Get customer
    const customer = await kv.get(`customer:${customerId}`);
    if (!customer) {
      return c.json({ success: false, error: "Customer not found" }, 404);
    }
    
    // Set all addresses to non-primary, then set the selected one to primary
    if (customer.addresses) {
      customer.addresses = customer.addresses.map((a: any) => ({
        ...a,
        isPrimary: a.id === addressId
      }));
    }
    
    // Save updated customer
    await kv.set(`customer:${customerId}`, customer);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating primary address:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete address from customer
app.delete("/make-server-c0840c88/customers/:customerId/addresses/:addressId", async (c) => {
  try {
    const customerId = c.req.param("customerId");
    const addressId = c.req.param("addressId");
    
    // Get customer
    const customer = await kv.get(`customer:${customerId}`);
    if (!customer) {
      return c.json({ success: false, error: "Customer not found" }, 404);
    }
    
    // Remove address from customer's addresses array
    if (customer.addresses) {
      customer.addresses = customer.addresses.filter((a: any) => a.id !== addressId);
    }
    
    // Save updated customer
    await kv.set(`customer:${customerId}`, customer);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting address from customer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== CUSTOMER FILES ENDPOINTS ====================

// Upload file for customer
app.post("/make-server-c0840c88/customers/:customerId/files", async (c) => {
  try {
    const customerId = c.req.param("customerId");
    
    // Get customer
    const customer = await kv.get(`customer:${customerId}`);
    if (!customer) {
      return c.json({ success: false, error: "Customer not found" }, 404);
    }
    
    // Parse the form data
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;
    const fileType = formData.get('fileType') as string;
    
    if (!file) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }
    
    // Create file metadata (we're not actually storing the file binary, just the metadata)
    const fileMetadata = {
      id: `FILE-${Date.now()}`,
      name: fileName || file.name,
      type: fileType || file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      uploadedBy: 'Admin User', // In production, this would come from auth
      uploadedOn: new Date().toISOString(),
    };
    
    // Add file to customer's documents array
    if (!customer.documents) {
      customer.documents = [];
    }
    customer.documents.push(fileMetadata);
    
    // Save updated customer
    await kv.set(`customer:${customerId}`, customer);
    
    return c.json({ success: true, file: fileMetadata });
  } catch (error) {
    console.error("Error uploading file for customer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete file from customer
app.delete("/make-server-c0840c88/customers/:customerId/files/:fileId", async (c) => {
  try {
    const customerId = c.req.param("customerId");
    const fileId = c.req.param("fileId");
    
    // Get customer
    const customer = await kv.get(`customer:${customerId}`);
    if (!customer) {
      return c.json({ success: false, error: "Customer not found" }, 404);
    }
    
    // Remove file from customer's documents array
    if (customer.documents) {
      customer.documents = customer.documents.filter((d: any) => d.id !== fileId);
    }
    
    // Save updated customer
    await kv.set(`customer:${customerId}`, customer);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting file from customer:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== PRODUCT FILES ENDPOINTS ====================

// Get all files for a product
app.get("/make-server-c0840c88/products/:productId/files", async (c) => {
  try {
    const productId = c.req.param("productId");
    const files = await kv.getByPrefix(`file:${productId}:`);
    return c.json({ success: true, files });
  } catch (error) {
    console.error("Error fetching files:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Upload file for product
app.post("/make-server-c0840c88/products/:productId/files", async (c) => {
  try {
    const productId = c.req.param("productId");
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    
    if (!file) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }
    
    const fileMetadata = {
      id: `FILE-${Date.now()}`,
      name: file.name,
      type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
      size: file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`,
      uploadedBy: 'Current User',
      uploadedDate: new Date().toISOString().split('T')[0],
      category: category || 'General',
      productId,
    };
    
    await kv.set(`file:${productId}:${fileMetadata.id}`, fileMetadata);
    
    // Add timeline event
    const timelineEvent = {
      id: `TIMELINE-${Date.now()}`,
      type: 'file_upload',
      title: 'File Uploaded',
      description: `Uploaded file: ${file.name}`,
      user: 'Current User',
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      icon: 'upload',
      color: 'blue',
      productId,
    };
    await kv.set(`timeline:${productId}:${timelineEvent.id}`, timelineEvent);
    
    return c.json({ success: true, file: fileMetadata });
  } catch (error) {
    console.error("Error uploading file:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete file from product
app.delete("/make-server-c0840c88/products/:productId/files/:fileId", async (c) => {
  try {
    const productId = c.req.param("productId");
    const fileId = c.req.param("fileId");
    
    const file = await kv.get(`file:${productId}:${fileId}`);
    if (!file) {
      return c.json({ success: false, error: "File not found" }, 404);
    }
    
    await kv.del(`file:${productId}:${fileId}`);
    
    // Add timeline event
    const timelineEvent = {
      id: `TIMELINE-${Date.now()}`,
      type: 'file_upload',
      title: 'File Deleted',
      description: `Deleted file: ${file.name}`,
      user: 'Current User',
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      icon: 'upload',
      color: 'red',
      productId,
    };
    await kv.set(`timeline:${productId}:${timelineEvent.id}`, timelineEvent);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== PRODUCT TIMELINE ENDPOINTS ====================

// Get timeline for a product
app.get("/make-server-c0840c88/products/:productId/timeline", async (c) => {
  try {
    const productId = c.req.param("productId");
    const events = await kv.getByPrefix(`timeline:${productId}:`);
    // Sort by timestamp descending
    events.sort((a: any, b: any) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    return c.json({ success: true, events });
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add timeline event
app.post("/make-server-c0840c88/products/:productId/timeline", async (c) => {
  try {
    const productId = c.req.param("productId");
    const event = await c.req.json();
    
    const timelineEvent = {
      id: `TIMELINE-${Date.now()}`,
      ...event,
      productId,
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    };
    
    await kv.set(`timeline:${productId}:${timelineEvent.id}`, timelineEvent);
    return c.json({ success: true, event: timelineEvent });
  } catch (error) {
    console.error("Error adding timeline event:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== PRODUCT CHAT ENDPOINTS ====================

// Get chat messages for a product
app.get("/make-server-c0840c88/products/:productId/chat", async (c) => {
  try {
    const productId = c.req.param("productId");
    const messages = await kv.getByPrefix(`chat:${productId}:`);
    // Sort by timestamp ascending
    messages.sort((a: any, b: any) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    return c.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Send chat message
app.post("/make-server-c0840c88/products/:productId/chat", async (c) => {
  try {
    const productId = c.req.param("productId");
    const contentType = c.req.header('content-type');
    
    let message = '';
    let attachment = null;
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle form data with file attachment
      const formData = await c.req.formData();
      message = formData.get('message') as string;
      const file = formData.get('file') as File;
      
      if (file) {
        attachment = {
          name: file.name,
          type: file.type,
          size: file.size > 1024 * 1024 
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${(file.size / 1024).toFixed(0)} KB`,
        };
      }
    } else {
      // Handle JSON data without file
      const body = await c.req.json();
      message = body.message;
    }
    
    const chatMessage = {
      id: `MSG-${Date.now()}`,
      message,
      attachment,
      user: 'Current User',
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      isCurrentUser: true,
      productId,
    };
    
    await kv.set(`chat:${productId}:${chatMessage.id}`, chatMessage);
    return c.json({ success: true, message: chatMessage });
  } catch (error) {
    console.error("Error sending chat message:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete chat message
app.delete("/make-server-c0840c88/products/:productId/chat/:messageId", async (c) => {
  try {
    const productId = c.req.param("productId");
    const messageId = c.req.param("messageId");
    
    await kv.del(`chat:${productId}:${messageId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat message:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== PURCHASE ORDER ENDPOINTS ====================

// Get all purchase orders
app.get("/make-server-c0840c88/purchase-orders", async (c) => {
  try {
    const orders = await kv.getByPrefix("purchaseorder:");
    // Migrate legacy PRJ- project numbers
    const toUpdate: any[] = [];
    for (const po of orders as any[]) {
      if (po.projectNumber && po.projectNumber.startsWith('PRJ-')) {
        po.projectNumber = migrateProjectNumber(po.projectNumber);
        toUpdate.push(po);
      }
    }
    if (toUpdate.length > 0) {
      const keys = toUpdate.map((p: any) => `purchaseorder:${p.id}`);
      await kv.mset(keys, toUpdate);
    }
    return c.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single purchase order by ID
app.get("/make-server-c0840c88/purchase-orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const order = await kv.get(`purchaseorder:${id}`);
    if (!order) {
      return c.json({ success: false, error: "Purchase order not found" }, 404);
    }
    return c.json({ success: true, order });
  } catch (error) {
    console.error("Error fetching purchase order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create new purchase order
app.post("/make-server-c0840c88/purchase-orders", async (c) => {
  try {
    const order = await c.req.json();
    
    // Generate ID if not provided
    if (!order.id) {
      const allOrders = await kv.getByPrefix("purchaseorder:");
      const maxId = allOrders.reduce((max, o) => {
        const num = parseInt(o.id);
        return num > max ? num : max;
      }, 0);
      order.id = String(maxId + 1);
    }
    
    // Generate PO number if not provided — uses same sequential format as PO module
    if (!order.poNumber) {
      const allPOs = await kv.getByPrefix("purchaseorder:");
      let maxPoNum = 0;
      for (const existing of allPOs as any[]) {
        if (existing.poNumber) {
          const match = existing.poNumber.match(/PO-(\d+)/);
          if (match) {
            const num = parseInt(match[1]);
            if (num > maxPoNum) maxPoNum = num;
          }
          const sampleMatch = existing.poNumber.match(/SAMPLE-(\d+)/);
          if (sampleMatch) {
            const num = parseInt(sampleMatch[1]);
            if (num > maxPoNum) maxPoNum = num;
          }
        }
      }
      const nextNum = Math.max(maxPoNum + 1, 10001);
      order.poNumber = `PO-${String(nextNum).padStart(5, '0')}`;
    }
    
    // Migrate legacy PRJ- project numbers on incoming POs
    if (order.projectNumber && order.projectNumber.startsWith('PRJ-')) {
      order.projectNumber = migrateProjectNumber(order.projectNumber);
    }

    // Set creation date
    order.createdAt = new Date().toISOString();
    
    await kv.set(`purchaseorder:${order.id}`, order);
    return c.json({ success: true, order });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get sample orders for a specific product (by productId)
app.get("/make-server-c0840c88/products/:productId/samples", async (c) => {
  try {
    const productId = c.req.param("productId");
    const allOrders = await kv.getByPrefix("purchaseorder:");
    const samples = allOrders.filter((o: any) => o.productId === productId);
    // Sort by creation date descending
    samples.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return c.json({ success: true, samples });
  } catch (error) {
    console.error("Error fetching product samples:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update existing purchase order
app.put("/make-server-c0840c88/purchase-orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(`purchaseorder:${id}`);
    if (!existing) {
      return c.json({ success: false, error: "Purchase order not found" }, 404);
    }
    
    const updated = { ...existing, ...updates, id }; // Preserve ID
    updated.updatedAt = new Date().toISOString();
    // Migrate legacy PRJ- on update
    if (updated.projectNumber && updated.projectNumber.startsWith('PRJ-')) {
      updated.projectNumber = migrateProjectNumber(updated.projectNumber);
    }
    
    await kv.set(`purchaseorder:${id}`, updated);

    // Auto-create receiving entry when PO status changes to "Shipped"
    let receivingCreated = false;
    let receivingId = null;
    if (
      updates.status === 'Shipped' &&
      existing.status !== 'Shipped'
    ) {
      try {
        const existingReceipts = await kv.getByPrefix("receiving:") as any[];
        const alreadyExists = existingReceipts.some((r: any) => r.poNumber === updated.poNumber || r.sourceOrderId === id);

        if (!alreadyExists) {
          const nextNum = existingReceipts.length + 1;
          const rcvId = `RCV-${String(nextNum).padStart(5, '0')}`;

          // Look up linked product for image and name
          let productImage = '';
          let productDisplayName = '';
          if (updated.productId) {
            try {
              const product = await kv.get(`product:${updated.productId}`);
              if (product) {
                productImage = product.image || '';
                productDisplayName = product.name || '';
              }
            } catch (prodErr) {
              console.log(`[PO→Receiving] Could not look up product ${updated.productId}:`, prodErr);
            }
          }
          // Also check the PO's own project field for the product name
          if (!productDisplayName) {
            productDisplayName = updated.project || updated.projectName || '';
          }

          // Build receiving items from PO line items or variants
          const poLineItems = updated.lineItems || [];
          const poVariants = updated.variants || [];
          const sourceItems = poLineItems.length > 0 ? poLineItems : poVariants;
          const receivingItems = sourceItems.map((li: any) => ({
            sku: li.sku || '',
            name: li.description || li.productName || li.name || productDisplayName || '',
            expectedQty: li.quantity || li.qty || 1,
            receivedQty: 0,
            imageUrl: li.imageUrl || productImage || '',
            unitCost: li.unitPrice || li.costPerUnit || 0,
          }));

          // Fallback placeholder if no line items
          if (receivingItems.length === 0) {
            receivingItems.push({
              sku: updated.poNumber || id,
              name: productDisplayName || `PO ${updated.poNumber || id} shipment`,
              expectedQty: updated.totalItems || 1,
              receivedQty: 0,
              imageUrl: productImage || '',
              unitCost: 0,
            });
          }

          // Compute shipping cost from PO custom line items (shipping charges, fees, etc.)
          const poCustomItems = updated.customLineItems || [];
          const poShippingCost = poCustomItems.reduce((sum: number, ci: any) => sum + ((ci.amount || 0) * (ci.quantity || 1)), 0);

          const receipt = {
            id: rcvId,
            poNumber: updated.poNumber || id,
            vendor: updated.vendor || 'Unknown',
            expectedDate: updated.inHandsDate || updated.shipDate || new Date().toISOString().split('T')[0],
            status: 'In Transit',
            items: receivingItems,
            carrier: updates.carrier || updated.carrier || updated.shipping || '',
            carrierType: updates.carrierType || updated.carrierType || updated.shippingMethod || '',
            trackingNumber: updates.trackingNumber || updated.trackingNumber || '',
            notes: `Auto-created from PO #${updated.poNumber || id} — status changed to Shipped`,
            sourceOrderId: id,
            sourceOrderType: 'purchase-order',
            customerName: updated.customer || '',
            projectName: updated.project || updated.projectName || '',
            projectNumber: migrateProjectNumber(updated.projectNumber || ''),
            productName: (sourceItems.length > 0 ? (sourceItems[0].description || sourceItems[0].productName || sourceItems[0].name || '') : ''),
            sampleType: updated.sampleType || '',
            isSample: updated.isSample || false,
            poTotal: updated.total || 0,
            poSalesTaxRate: updated.salesTaxRate || 0,
            poShippingCost,
            inventoryCreated: false,
            createdAt: new Date().toISOString(),
          };

          await kv.set(`receiving:${rcvId}`, receipt);
          receivingCreated = true;
          receivingId = rcvId;
          console.log(`Auto-created receiving entry ${rcvId} for PO ${id} (status -> Shipped)`);
        }
      } catch (rcvErr) {
        console.error("Error auto-creating receiving entry for PO:", id, rcvErr);
      }
    }

    return c.json({ success: true, order: updated, receivingCreated, receivingId });
  } catch (error) {
    console.error("Error updating purchase order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete purchase order
app.delete("/make-server-c0840c88/purchase-orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`purchaseorder:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== ORDERS ENDPOINTS ====================

// Get all orders (enriched with linked PO late flags)
app.get("/make-server-c0840c88/orders", async (c) => {
  try {
    const orders = await kv.getByPrefix("order:");
    // Enrich orders with missedInHandsDate/Reason from linked POs
    const purchaseOrders = await kv.getByPrefix("purchaseorder:");
    const poMap = new Map<string, any>();
    for (const po of purchaseOrders) {
      poMap.set(po.id, po);
    }
    // Migrate PRJ- to ADP- and backfill PP- for orders without a project number
    const ordersToUpdate: any[] = [];
    let maxPPNum = (orders as any[]).reduce((max: number, o: any) => {
      const n = extractSeqNum(o.projectNumber || '', 'PP-');
      return n > max ? n : max;
    }, 0);

    const enrichedOrders = orders.map((order: any) => {
      // Migrate legacy PRJ- on orders that don't have an ADP- source
      if (order.projectNumber && order.projectNumber.startsWith('PRJ-')) {
        // If order came from pipeline (has ADP-source product), migrate to ADP-
        // Otherwise treat as a promo order — but keep the numeric sequence
        order.projectNumber = migrateProjectNumber(order.projectNumber);
        ordersToUpdate.push(order);
      }
      // Backfill PP- for orders that have no project number at all
      if (!order.projectNumber) {
        maxPPNum++;
        order.projectNumber = `PP-${String(maxPPNum).padStart(5, '0')}`;
        ordersToUpdate.push(order);
      }

      if (order.sourcePOId && poMap.has(order.sourcePOId)) {
        const po = poMap.get(order.sourcePOId);
        if (po.missedInHandsDate) {
          order.missedInHandsDate = po.missedInHandsDate;
        }
        if (po.missedInHandsReason) {
          order.missedInHandsReason = po.missedInHandsReason;
        }
        // Push ship date from PO to order if not already set
        if (po.shipDate && !order.shipDate) {
          order.shipDate = po.shipDate;
        }
      }
      return order;
    });

    // Persist backfilled/migrated order project numbers
    if (ordersToUpdate.length > 0) {
      const keys: string[] = [];
      const values: any[] = [];
      for (const o of ordersToUpdate) {
        keys.push(`order:${o.id}`);
        values.push(o);
      }
      await kv.mset(keys, values);
    }

    return c.json({ success: true, orders: enrichedOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single order by ID (enriched with linked PO late flags)
app.get("/make-server-c0840c88/orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const order = await kv.get(`order:${id}`) as any;
    if (!order) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }
    // Enrich with linked PO late flags and ship date
    if (order.sourcePOId) {
      const po = await kv.get(`purchaseorder:${order.sourcePOId}`) as any;
      if (po) {
        if (po.missedInHandsDate) order.missedInHandsDate = po.missedInHandsDate;
        if (po.missedInHandsReason) order.missedInHandsReason = po.missedInHandsReason;
        if (po.shipDate && !order.shipDate) order.shipDate = po.shipDate;
      }
    }
    return c.json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create new order
app.post("/make-server-c0840c88/orders", async (c) => {
  try {
    const order = await c.req.json();
    
    // Generate ID if not provided
    if (!order.id) {
      const allOrders = await kv.getByPrefix("order:");
      const maxId = allOrders.reduce((max, o) => {
        const num = parseInt(o.id.replace('ORD-', ''));
        return num > max ? num : max;
      }, 1000);
      order.id = `ORD-${maxId + 1}`;
    }
    
    // Auto-generate PP- projectNumber for promotional product orders if not provided
    // If the order inherited an ADP- number from a pipeline product, keep it
    if (!order.projectNumber) {
      order.projectNumber = await getNextProjectNumber('PP-');
    } else if (order.projectNumber.startsWith('PRJ-')) {
      order.projectNumber = migrateProjectNumber(order.projectNumber);
    }

    // Set creation date
    order.createdAt = new Date().toISOString();
    
    await kv.set(`order:${order.id}`, order);

    // Auto-create design tasks for each line item
    if (order.lineItems && order.lineItems.length > 0) {
      try {
        const allTasks = await kv.getByPrefix("design_task:");
        let maxNum = allTasks.reduce((max: number, t: any) => {
          const match = t.id?.match(/DT-(\d+)/);
          return match ? Math.max(max, parseInt(match[1])) : max;
        }, 0);
        for (const item of order.lineItems) {
          maxNum++;
          const task = {
            id: `DT-${String(maxNum).padStart(4, '0')}`,
            orderId: order.id,
            orderName: order.projectName || order.id,
            customer: order.customer || '',
            itemName: item.productName || item.name || '',
            sku: item.sku || '',
            imageUrl: item.imageUrl || '',
            quantity: item.quantity || 0,
            variant: item.variant || '',
            supplier: item.supplier || '',
            status: 'Pending Art',
            artFile: null,
            artFileName: null,
            mockupFile: null,
            mockupFileName: null,
            currentRevision: 0,
            revisions: [],
            assignedTo: '',
            dueDate: order.inHandsDate || '',
            createdAt: new Date().toISOString(),
            notes: '',
          };
          await kv.set(`design_task:${task.id}`, task);
        }
        console.log(`Auto-created ${order.lineItems.length} design tasks for order ${order.id}`);
      } catch (dtErr) {
        console.error("Error auto-creating design tasks:", dtErr);
      }
    }

    return c.json({ success: true, order });
  } catch (error) {
    console.error("Error creating order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update existing order
app.put("/make-server-c0840c88/orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(`order:${id}`) as any;
    if (!existing) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }
    
    const updated = { ...existing, ...updates, id }; // Preserve ID
    updated.updatedAt = new Date().toISOString();
    // Migrate legacy PRJ- on order update
    if (updated.projectNumber && updated.projectNumber.startsWith('PRJ-')) {
      updated.projectNumber = migrateProjectNumber(updated.projectNumber);
    }
    
    await kv.set(`order:${id}`, updated);

    // Auto-create receiving entry when status changes to "Shipped"
    let receivingCreated = false;
    let receivingId = null;
    if (
      updates.status === 'Shipped' &&
      existing.status !== 'Shipped'
    ) {
      try {
        // Check if a receiving entry already exists for this order
        const existingReceipts = await kv.getByPrefix("receiving:") as any[];
        const alreadyExists = existingReceipts.some((r: any) => r.sourceOrderId === id);
        
        if (!alreadyExists) {
          const nextNum = existingReceipts.length + 1;
          const rcvId = `RCV-${String(nextNum).padStart(5, '0')}`;
          
          // Build receiving items from order line items
          const lineItems = updated.lineItems || [];
          const receivingItems = lineItems.map((li: any) => ({
            sku: li.sku || '',
            name: li.productName || li.name || '',
            expectedQty: li.quantity || 1,
            receivedQty: 0,
            imageUrl: li.imageUrl || '',
            unitCost: li.netCost || li.clientPrice || li.unitPrice || li.costPerUnit || 0,
          }));
          
          // If no line items, create a single placeholder item
          if (receivingItems.length === 0) {
            receivingItems.push({
              sku: id,
              name: `Order ${id} shipment`,
              expectedQty: updated.items || 1,
              receivedQty: 0,
              imageUrl: '',
              unitCost: 0,
            });
          }
          
          const isSample = updated.isSampleOrder === true;

          // Compute shipping cost from order charges
          const orderCharges = updated.poCharges || [];
          const orderShippingCost = orderCharges.reduce((sum: number, ci: any) => sum + ((ci.amount || 0) * (ci.quantity || 1)), 0);

          const receipt = {
            id: rcvId,
            poNumber: updated.sourcePONumber || id,
            vendor: updated.vendor || updated.customer || 'Unknown',
            expectedDate: updated.inHandsDate || updated.shipDate || new Date().toISOString().split('T')[0],
            status: 'In Transit',
            items: receivingItems,
            carrier: updated.carrier || updated.shipping || '',
            carrierType: updated.carrierType || updated.shippingMethod || '',
            trackingNumber: updated.trackingNumber || '',
            notes: `Auto-created from ${isSample ? 'sample order' : 'order'} ${id} — status changed to Shipped`,
            sourceOrderId: id,
            sourceOrderType: isSample ? 'sample-order' : 'order',
            customerName: updated.customer || '',
            projectName: updated.project || updated.projectName || '',
            projectNumber: migrateProjectNumber(updated.projectNumber || ''),
            productName: updated.productName || (lineItems.length > 0 ? (lineItems[0].productName || lineItems[0].name || '') : '') || '',
            sampleType: updated.sampleType || '',
            isSample,
            poTotal: updated.total || 0,
            poSalesTaxRate: updated.taxRate ? updated.taxRate / 100 : 0,
            poShippingCost: orderShippingCost,
            inventoryCreated: false,
            createdAt: new Date().toISOString(),
          };
          
          await kv.set(`receiving:${rcvId}`, receipt);
          receivingCreated = true;
          receivingId = rcvId;
          console.log(`Auto-created receiving entry ${rcvId} for order ${id} (status -> Shipped)`);
        }
      } catch (rcvErr) {
        console.error("Error auto-creating receiving entry for order:", id, rcvErr);
      }
    }

    return c.json({ success: true, order: updated, receivingCreated, receivingId });
  } catch (error) {
    console.error("Error updating order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete order
app.delete("/make-server-c0840c88/orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`order:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== DESIGN LAB ENDPOINTS ====================

// Get all design tasks
app.get("/make-server-c0840c88/design-tasks", async (c) => {
  try {
    const tasks = await kv.getByPrefix("design_task:");
    return c.json({ success: true, tasks });
  } catch (error) {
    console.error("Error fetching design tasks:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single design task
app.get("/make-server-c0840c88/design-tasks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const task = await kv.get(`design_task:${id}`);
    if (!task) return c.json({ success: false, error: "Design task not found" }, 404);
    return c.json({ success: true, task });
  } catch (error) {
    console.error("Error fetching design task:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create design task
app.post("/make-server-c0840c88/design-tasks", async (c) => {
  try {
    const task = await c.req.json();
    if (!task.id) {
      const all = await kv.getByPrefix("design_task:");
      const maxNum = all.reduce((max: number, t: any) => {
        const match = t.id?.match(/DT-(\d+)/);
        return match ? Math.max(max, parseInt(match[1])) : max;
      }, 0);
      task.id = `DT-${String(maxNum + 1).padStart(4, '0')}`;
    }
    task.createdAt = task.createdAt || new Date().toISOString();
    task.status = task.status || 'Pending Art';
    task.currentRevision = task.currentRevision || 0;
    task.revisions = task.revisions || [];
    task.artFile = task.artFile || null;
    task.mockupFile = task.mockupFile || null;
    await kv.set(`design_task:${task.id}`, task);
    return c.json({ success: true, task });
  } catch (error) {
    console.error("Error creating design task:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Bulk create design tasks from order
app.post("/make-server-c0840c88/design-tasks/from-order", async (c) => {
  try {
    const { orderId, orderName, customer, lineItems, dueDate } = await c.req.json();
    const all = await kv.getByPrefix("design_task:");
    let maxNum = all.reduce((max: number, t: any) => {
      const match = t.id?.match(/DT-(\d+)/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);
    const created: any[] = [];
    for (const item of lineItems) {
      maxNum++;
      const task = {
        id: `DT-${String(maxNum).padStart(4, '0')}`,
        orderId,
        orderName: orderName || orderId,
        customer,
        itemName: item.productName || item.name,
        sku: item.sku || '',
        imageUrl: item.imageUrl || '',
        quantity: item.quantity || 0,
        variant: item.variant || '',
        supplier: item.supplier || '',
        status: 'Pending Art',
        artFile: null,
        artFileName: null,
        mockupFile: null,
        mockupFileName: null,
        currentRevision: 0,
        revisions: [],
        assignedTo: '',
        dueDate: dueDate || '',
        createdAt: new Date().toISOString(),
        notes: '',
      };
      await kv.set(`design_task:${task.id}`, task);
      created.push(task);
    }
    return c.json({ success: true, tasks: created, count: created.length });
  } catch (error) {
    console.error("Error creating design tasks from order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Upload a design file (art or mockup) to storage
app.post("/make-server-c0840c88/design-tasks/:id/upload", async (c) => {
  try {
    const id = c.req.param("id");
    const { type, base64Data, fileName } = await c.req.json();
    if (!base64Data || !fileName || !type) {
      return c.json({ success: false, error: "Missing type, base64Data, or fileName" }, 400);
    }
    const existing = await kv.get(`design_task:${id}`) as any;
    if (!existing) return c.json({ success: false, error: "Design task not found" }, 404);

    const signedUrl = await uploadDesignFile(base64Data, fileName, id);
    if (!signedUrl) {
      return c.json({ success: false, error: "Failed to upload file to storage" }, 500);
    }

    if (type === "art") {
      existing.artFile = signedUrl;
      existing.artFileName = fileName;
    } else if (type === "mockup") {
      existing.mockupFile = signedUrl;
      existing.mockupFileName = fileName;
    }
    existing.updatedAt = new Date().toISOString();
    await kv.set(`design_task:${id}`, existing);

    return c.json({ success: true, url: signedUrl, task: existing });
  } catch (error) {
    console.error("Error uploading design file:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update design task (metadata only — no base64 files)
app.put("/make-server-c0840c88/design-tasks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`design_task:${id}`) as any;
    if (!existing) return c.json({ success: false, error: "Design task not found" }, 404);

    // Strip out any base64 data that accidentally got included
    if (updates.artFile && updates.artFile.startsWith("data:")) {
      delete updates.artFile;
    }
    if (updates.mockupFile && updates.mockupFile.startsWith("data:")) {
      delete updates.mockupFile;
    }
    // Also strip base64 from revisions
    if (updates.revisions && Array.isArray(updates.revisions)) {
      updates.revisions = updates.revisions.map((rev: any) => ({
        ...rev,
        artFile: rev.artFile?.startsWith("data:") ? null : rev.artFile,
        mockupFile: rev.mockupFile?.startsWith("data:") ? null : rev.mockupFile,
      }));
    }

    const updated = { ...existing, ...updates, id };
    updated.updatedAt = new Date().toISOString();
    await kv.set(`design_task:${id}`, updated);
    return c.json({ success: true, task: updated });
  } catch (error) {
    console.error("Error updating design task:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete design task
app.delete("/make-server-c0840c88/design-tasks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`design_task:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting design task:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Legacy: Get all design projects (backward compat)
app.get("/make-server-c0840c88/design-projects", async (c) => {
  try {
    const projects = await kv.getByPrefix("design_project:");
    return c.json({ success: true, projects });
  } catch (error) {
    console.error("Error fetching design projects:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== CONTACTS ENDPOINTS ====================

// Get all contacts
app.get("/make-server-c0840c88/contacts", async (c) => {
  try {
    const contacts = await kv.getByPrefix("contact:");
    return c.json({ success: true, contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single contact by ID
app.get("/make-server-c0840c88/contacts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const contact = await kv.get(`contact:${id}`);
    if (!contact) {
      return c.json({ success: false, error: "Contact not found" }, 404);
    }
    return c.json({ success: true, contact });
  } catch (error) {
    console.error("Error fetching contact:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create new contact
app.post("/make-server-c0840c88/contacts", async (c) => {
  try {
    const contact = await c.req.json();
    
    // Generate ID if not provided
    if (!contact.id) {
      const allContacts = await kv.getByPrefix("contact:");
      const maxNum = allContacts.reduce((max, c) => {
        const match = c.id?.match(/CON-(\d+)/);
        if (match) {
          const num = parseInt(match[1]);
          return num > max ? num : max;
        }
        return max;
      }, 0);
      contact.id = `CON-${String(maxNum + 1).padStart(3, '0')}`;
    }
    
    // Add created timestamp
    contact.createdAt = new Date().toISOString();
    contact.lastContact = new Date().toISOString().split('T')[0];
    
    // Set default status if not provided
    if (!contact.status) {
      contact.status = 'Active';
    }
    
    await kv.set(`contact:${contact.id}`, contact);
    
    // If company name is provided, try to find matching customer and add contact to them
    if (contact.company) {
      const customers = await kv.getByPrefix("customer:");
      const matchingCustomer = customers.find((customer: any) => 
        customer.name?.toLowerCase() === contact.company.toLowerCase()
      );
      
      if (matchingCustomer) {
        // Add this contact to the customer's contacts array
        if (!matchingCustomer.contacts) {
          matchingCustomer.contacts = [];
        }
        
        // Create a simplified contact object for the customer
        const customerContact = {
          id: contact.id,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          role: contact.jobTitle || '',
        };
        
        matchingCustomer.contacts.push(customerContact);
        await kv.set(`customer:${matchingCustomer.id}`, matchingCustomer);
      }
    }
    
    return c.json({ success: true, contact });
  } catch (error) {
    console.error("Error creating contact:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update existing contact
app.put("/make-server-c0840c88/contacts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(`contact:${id}`);
    if (!existing) {
      return c.json({ success: false, error: "Contact not found" }, 404);
    }
    
    const updated = { ...existing, ...updates, id }; // Preserve ID
    updated.updatedAt = new Date().toISOString();
    
    await kv.set(`contact:${id}`, updated);
    return c.json({ success: true, contact: updated });
  } catch (error) {
    console.error("Error updating contact:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete contact
app.delete("/make-server-c0840c88/contacts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Idempotent delete: if contact doesn't exist, still return success
    await kv.del(`contact:${id}`);
    return c.json({ success: true, message: "Contact deleted" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// SHIPMENT ENDPOINTS
// ============================================

// Get all shipments
app.get("/make-server-c0840c88/shipments", async (c) => {
  try {
    const shipments = await kv.getByPrefix("shipment:");
    return c.json({ success: true, shipments });
  } catch (error) {
    console.error("Error fetching shipments:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single shipment by ID
app.get("/make-server-c0840c88/shipments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const shipment = await kv.get(`shipment:${id}`);
    if (!shipment) {
      return c.json({ success: false, error: "Shipment not found" }, 404);
    }
    return c.json({ success: true, shipment });
  } catch (error) {
    console.error("Error fetching shipment:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create new shipment
app.post("/make-server-c0840c88/shipments", async (c) => {
  try {
    const shipment = await c.req.json();
    
    // Generate ID if not provided
    if (!shipment.id) {
      const allShipments = await kv.getByPrefix("shipment:");
      const maxId = allShipments.reduce((max, s) => {
        const idNum = parseInt(s.id.replace('SHIP-', ''));
        return idNum > max ? idNum : max;
      }, 0);
      shipment.id = `SHIP-${String(maxId + 1).padStart(3, '0')}`;
    }
    
    // Add created timestamp
    shipment.createdAt = new Date().toISOString();

    // Normalize fields so the Shipments table always has the right keys
    if (!shipment.masterTracking && shipment.trackingNumber) {
      shipment.masterTracking = shipment.trackingNumber;
    }
    if (!shipment.orderNumber && shipment.poNumber) {
      shipment.orderNumber = shipment.poNumber;
    }
    if (!shipment.project && shipment.projectName) {
      shipment.project = shipment.projectName;
    }
    // Compute quantity from sourceLineItems if not explicitly provided
    if (shipment.quantity === undefined || shipment.quantity === null) {
      if (shipment.sourceLineItems && Array.isArray(shipment.sourceLineItems)) {
        shipment.quantity = shipment.sourceLineItems.reduce((sum: number, li: any) => sum + (li.quantity || li.qty || 0), 0);
      } else if (typeof shipment.items === 'number') {
        shipment.quantity = shipment.items;
      }
    }
    // Extract service level from shipping method (e.g., "UPS - 2nd Day Air" -> "2nd Day Air")
    if (!shipment.serviceLevel && shipment.shippingMethod) {
      const parts = shipment.shippingMethod.split(' - ');
      shipment.serviceLevel = parts.length > 1 ? parts.slice(1).join(' - ') : shipment.shippingMethod;
    }
    // Build itemName from line items if not provided
    if (!shipment.itemName && shipment.sourceLineItems && Array.isArray(shipment.sourceLineItems)) {
      const names = shipment.sourceLineItems
        .map((li: any) => li.description || li.productName || li.name || li.sku || '')
        .filter(Boolean);
      shipment.itemName = names.length > 0 ? names.join(', ') : '';
    }
    // Build project subtext from project number
    if (!shipment.projectSubtext && shipment.projectNumber) {
      shipment.projectSubtext = shipment.projectNumber;
    }

    await kv.set(`shipment:${shipment.id}`, shipment);

    // Backfill any linked receiving records with carrier/tracking from this shipment
    if (shipment.carrier || shipment.trackingNumber) {
      try {
        const receipts = await kv.getByPrefix("receiving:") as any[];
        for (const rcpt of receipts) {
          const linked =
            (shipment.poId && rcpt.sourceOrderId === shipment.poId) ||
            (shipment.orderId && rcpt.sourceOrderId === shipment.orderId) ||
            (shipment.poNumber && rcpt.poNumber === shipment.poNumber);
          if (linked) {
            let dirty = false;
            if (!rcpt.carrier && shipment.carrier) { rcpt.carrier = shipment.carrier; dirty = true; }
            if (!rcpt.trackingNumber && shipment.trackingNumber) { rcpt.trackingNumber = shipment.trackingNumber; dirty = true; }
            if (!rcpt.carrierType && shipment.carrierType) { rcpt.carrierType = shipment.carrierType; dirty = true; }
            if (dirty) {
              await kv.set(`receiving:${rcpt.id}`, rcpt);
              console.log(`Backfilled receiving ${rcpt.id} with carrier/tracking from shipment ${shipment.id}`);
            }
          }
        }
      } catch (bfErr) {
        console.error("Error backfilling receiving from shipment:", bfErr);
      }
    }

    return c.json({ success: true, shipment });
  } catch (error) {
    console.error("Error creating shipment:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update existing shipment
app.put("/make-server-c0840c88/shipments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    
    const existing = await kv.get(`shipment:${id}`);
    if (!existing) {
      return c.json({ success: false, error: "Shipment not found" }, 404);
    }
    
    const updated = { ...existing, ...updates, id }; // Preserve ID
    updated.updatedAt = new Date().toISOString();
    await kv.set(`shipment:${id}`, updated);

    // Sync status changes to linked receiving records
    if (updates.status) {
      try {
        const receipts = await kv.getByPrefix("receiving:") as any[];
        for (const rcpt of receipts) {
          const linked =
            (rcpt.trackingNumber && (rcpt.trackingNumber === updated.trackingNumber || rcpt.trackingNumber === updated.masterTracking)) ||
            (rcpt.poNumber && updated.poNumber && rcpt.poNumber === updated.poNumber) ||
            (rcpt.sourceOrderId && (rcpt.sourceOrderId === updated.orderNumber || rcpt.sourceOrderId === updated.poNumber));
          if (linked) {
            let dirty = false;
            if (updated.status === 'Delivered' && rcpt.status !== 'Completed' && rcpt.status !== 'Delivered') {
              rcpt.status = 'Delivered';
              dirty = true;
            } else if (updated.status === 'In Transit' && rcpt.status === 'Scheduled') {
              rcpt.status = 'In Transit';
              dirty = true;
            }
            if (!rcpt.carrier && updated.carrier) { rcpt.carrier = updated.carrier; dirty = true; }
            if (!rcpt.trackingNumber && (updated.trackingNumber || updated.masterTracking)) { rcpt.trackingNumber = updated.trackingNumber || updated.masterTracking; dirty = true; }
            if (dirty) {
              await kv.set(`receiving:${rcpt.id}`, rcpt);
              console.log(`[Shipment→Receiving sync] Updated receiving ${rcpt.id} status to ${rcpt.status}`);
            }
          }
        }
      } catch (syncErr) {
        console.log("[Shipment→Receiving sync] Error syncing status:", syncErr);
      }

      // Also sync status to linked Purchase Orders (affects PO module + Sample Tracking)
      try {
        const allPOs = await kv.getByPrefix("purchaseorder:") as any[];
        for (const po of allPOs) {
          const poLinked =
            (updated.poNumber && po.poNumber && po.poNumber === updated.poNumber) ||
            (updated.orderNumber && po.id === updated.orderNumber);
          if (poLinked) {
            let poDirty = false;
            if (updated.status === 'Delivered' && po.status !== 'Delivered') {
              po.status = 'Delivered';
              poDirty = true;
            }
            if (poDirty) {
              po.updatedAt = new Date().toISOString();
              await kv.set(`purchaseorder:${po.id}`, po);
              console.log(`[Shipment→PO sync] Updated PO ${po.id} (${po.poNumber}) status to ${po.status}`);
            }
          }
        }
      } catch (poSyncErr) {
        console.log("[Shipment→PO sync] Error syncing status to POs:", poSyncErr);
      }
    }

    return c.json({ success: true, shipment: updated });
  } catch (error) {
    console.error("Error updating shipment:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete shipment
app.delete("/make-server-c0840c88/shipments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`shipment:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting shipment:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== VENDOR PURCHASE ORDERS ENDPOINT ====================

// Get purchase orders for a specific vendor (by vendor name match)
app.get("/make-server-c0840c88/vendors/:vendorId/purchase-orders", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    // First get the vendor to know its name
    const vendor = await kv.get(`globalvendor:${vendorId}`);
    if (!vendor) {
      return c.json({ success: true, purchaseOrders: [] });
    }
    // Fetch all POs and filter by vendor name
    const allPOs = await kv.getByPrefix("purchaseorder:");
    const vendorPOs = allPOs.filter((po: any) => {
      const poVendor = (po.vendor || '').toLowerCase().trim();
      const vendorName = (vendor.name || '').toLowerCase().trim();
      return poVendor === vendorName;
    });
    return c.json({ success: true, purchaseOrders: vendorPOs });
  } catch (error) {
    console.error("Error fetching vendor purchase orders:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== VENDOR INVOICES ENDPOINTS ====================

// Get all invoices for a vendor
app.get("/make-server-c0840c88/vendors/:vendorId/invoices", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const invoices = await kv.getByPrefix(`vendorinvoice:${vendorId}:`);
    return c.json({ success: true, invoices });
  } catch (error) {
    console.error("Error fetching vendor invoices:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a vendor invoice
app.post("/make-server-c0840c88/vendors/:vendorId/invoices", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const invoice = await c.req.json();
    
    if (!invoice.id) {
      const existing = await kv.getByPrefix(`vendorinvoice:${vendorId}:`);
      const maxNum = existing.reduce((max: number, inv: any) => {
        const num = parseInt((inv.id || '').replace('INV-', ''));
        return num > max ? num : max;
      }, 0);
      invoice.id = `INV-${String(maxNum + 1).padStart(4, '0')}`;
    }
    
    invoice.vendorId = vendorId;
    invoice.createdAt = new Date().toISOString();
    
    await kv.set(`vendorinvoice:${vendorId}:${invoice.id}`, invoice);
    
    // Auto-create activity entry
    const activityId = `act-${Date.now()}`;
    const activity = {
      id: activityId,
      vendorId,
      date: new Date().toISOString().split('T')[0],
      type: 'Invoice',
      description: `Invoice ${invoice.id} created - $${(invoice.amount || 0).toLocaleString()}`,
      amount: invoice.amount || 0,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`vendoractivity:${vendorId}:${activityId}`, activity);
    
    return c.json({ success: true, invoice });
  } catch (error) {
    console.error("Error creating vendor invoice:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update a vendor invoice
app.put("/make-server-c0840c88/vendors/:vendorId/invoices/:invoiceId", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const invoiceId = c.req.param("invoiceId");
    const updates = await c.req.json();
    
    const existing = await kv.get(`vendorinvoice:${vendorId}:${invoiceId}`);
    if (!existing) {
      return c.json({ success: false, error: "Invoice not found" }, 404);
    }
    
    const updated = { ...existing, ...updates, id: invoiceId, vendorId };
    updated.updatedAt = new Date().toISOString();
    
    await kv.set(`vendorinvoice:${vendorId}:${invoiceId}`, updated);
    return c.json({ success: true, invoice: updated });
  } catch (error) {
    console.error("Error updating vendor invoice:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a vendor invoice
app.delete("/make-server-c0840c88/vendors/:vendorId/invoices/:invoiceId", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const invoiceId = c.req.param("invoiceId");
    await kv.del(`vendorinvoice:${vendorId}:${invoiceId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting vendor invoice:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== VENDOR ACTIVITY ENDPOINTS ====================

// Get all activity for a vendor
app.get("/make-server-c0840c88/vendors/:vendorId/activity", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const activities = await kv.getByPrefix(`vendoractivity:${vendorId}:`);
    // Sort by date descending
    activities.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || a.date || 0).getTime();
      const dateB = new Date(b.createdAt || b.date || 0).getTime();
      return dateB - dateA;
    });
    return c.json({ success: true, activities });
  } catch (error) {
    console.error("Error fetching vendor activity:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a vendor activity entry
app.post("/make-server-c0840c88/vendors/:vendorId/activity", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const activity = await c.req.json();
    
    const activityId = activity.id || `act-${Date.now()}`;
    activity.id = activityId;
    activity.vendorId = vendorId;
    activity.createdAt = new Date().toISOString();
    
    await kv.set(`vendoractivity:${vendorId}:${activityId}`, activity);
    return c.json({ success: true, activity });
  } catch (error) {
    console.error("Error creating vendor activity:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== CONTACT DOCUMENTS ENDPOINTS ====================

// Get all documents for a contact
app.get("/make-server-c0840c88/contacts/:contactId/documents", async (c) => {
  try {
    const contactId = c.req.param("contactId");
    const docs = await kv.getByPrefix(`contactdoc:${contactId}:`);
    docs.sort((a: any, b: any) => (b.uploadedDate || "").localeCompare(a.uploadedDate || ""));
    return c.json({ success: true, documents: docs });
  } catch (error) {
    console.error("Error fetching contact documents:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Upload a document for a contact
app.post("/make-server-c0840c88/contacts/:contactId/documents", async (c) => {
  try {
    const contactId = c.req.param("contactId");
    const body = await c.req.json();
    const docId = `CDOC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const doc = {
      id: docId,
      contactId,
      name: body.name || "Untitled",
      size: body.size || "0 KB",
      uploadedDate: now.split("T")[0],
      uploadedBy: body.uploadedBy || "Current User",
      createdAt: now,
    };
    await kv.set(`contactdoc:${contactId}:${docId}`, doc);

    // Log activity
    const actId = `CACT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await kv.set(`contactactivity:${contactId}:${actId}`, {
      id: actId, contactId, date: now.split("T")[0], type: "Document",
      description: `Uploaded document: ${doc.name}`, user: doc.uploadedBy, createdAt: now,
    });

    return c.json({ success: true, document: doc });
  } catch (error) {
    console.error("Error uploading contact document:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a contact document
app.delete("/make-server-c0840c88/contacts/:contactId/documents/:docId", async (c) => {
  try {
    const contactId = c.req.param("contactId");
    const docId = c.req.param("docId");
    const existing: any = await kv.get(`contactdoc:${contactId}:${docId}`);
    if (!existing) return c.json({ success: true }); // idempotent
    await kv.del(`contactdoc:${contactId}:${docId}`);

    // Log activity
    const now = new Date().toISOString();
    const actId = `CACT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await kv.set(`contactactivity:${contactId}:${actId}`, {
      id: actId, contactId, date: now.split("T")[0], type: "Document",
      description: `Deleted document: ${existing.name}`, user: "Current User", createdAt: now,
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting contact document:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== CONTACT ACTIVITY ENDPOINTS ====================

// Get all activity for a contact
app.get("/make-server-c0840c88/contacts/:contactId/activity", async (c) => {
  try {
    const contactId = c.req.param("contactId");
    const activities = await kv.getByPrefix(`contactactivity:${contactId}:`);
    activities.sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return c.json({ success: true, activities });
  } catch (error) {
    console.error("Error fetching contact activity:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a contact activity entry
app.post("/make-server-c0840c88/contacts/:contactId/activity", async (c) => {
  try {
    const contactId = c.req.param("contactId");
    const body = await c.req.json();
    const actId = `CACT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const activity = {
      id: actId,
      contactId,
      date: body.date || now.split("T")[0],
      type: body.type || "Note",
      description: body.description || "",
      user: body.user || "Current User",
      createdAt: now,
    };
    await kv.set(`contactactivity:${contactId}:${actId}`, activity);
    return c.json({ success: true, activity });
  } catch (error) {
    console.error("Error creating contact activity:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== CUSTOMER ACTIVITY ENDPOINTS ====================

// Get all activity for a customer
app.get("/make-server-c0840c88/customers/:customerId/activity", async (c) => {
  try {
    const customerId = c.req.param("customerId");
    const activities = await kv.getByPrefix(`customeractivity:${customerId}:`);
    activities.sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return c.json({ success: true, activities });
  } catch (error) {
    console.error("Error fetching customer activity:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a customer activity entry
app.post("/make-server-c0840c88/customers/:customerId/activity", async (c) => {
  try {
    const customerId = c.req.param("customerId");
    const body = await c.req.json();
    const now = new Date().toISOString();
    const actId = `ACT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const activity = {
      id: actId,
      customerId,
      date: now.split("T")[0],
      type: body.type || "Note",
      description: body.description || "",
      amount: body.amount || null,
      user: body.user || "Current User",
      createdAt: now,
    };
    await kv.set(`customeractivity:${customerId}:${actId}`, activity);
    return c.json({ success: true, activity });
  } catch (error) {
    console.error("Error creating customer activity:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== CUSTOMER NOTES ENDPOINTS ====================

// Get all notes for a customer
app.get("/make-server-c0840c88/customers/:customerId/notes", async (c) => {
  try {
    const customerId = c.req.param("customerId");
    const notes = await kv.getByPrefix(`customernote:${customerId}:`);
    notes.sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return c.json({ success: true, notes });
  } catch (error) {
    console.error("Error fetching customer notes:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a customer note
app.post("/make-server-c0840c88/customers/:customerId/notes", async (c) => {
  try {
    const customerId = c.req.param("customerId");
    const body = await c.req.json();
    const now = new Date().toISOString();
    const noteId = `NOTE-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const note = {
      id: noteId,
      customerId,
      text: body.text || "",
      author: body.author || "Current User",
      createdAt: now,
    };
    await kv.set(`customernote:${customerId}:${noteId}`, note);

    // Also log activity
    const actId = `ACT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await kv.set(`customeractivity:${customerId}:${actId}`, {
      id: actId, customerId, date: now.split("T")[0], type: "Note",
      description: `Added note: ${(body.text || "").substring(0, 60)}${(body.text || "").length > 60 ? "..." : ""}`,
      amount: null, user: body.author || "Current User", createdAt: now,
    });

    return c.json({ success: true, note });
  } catch (error) {
    console.error("Error creating customer note:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a customer note
app.delete("/make-server-c0840c88/customers/:customerId/notes/:noteId", async (c) => {
  try {
    const customerId = c.req.param("customerId");
    const noteId = c.req.param("noteId");
    await kv.del(`customernote:${customerId}:${noteId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer note:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== CUSTOMER BILLING ENDPOINTS ====================

// Get all invoices for a customer
app.get("/make-server-c0840c88/customers/:customerId/billing", async (c) => {
  try {
    const customerId = c.req.param("customerId");
    const invoices = await kv.getByPrefix(`customerinvoice:${customerId}:`);
    invoices.sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return c.json({ success: true, invoices });
  } catch (error) {
    console.error("Error fetching customer invoices:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create an invoice for a customer
app.post("/make-server-c0840c88/customers/:customerId/billing", async (c) => {
  try {
    const customerId = c.req.param("customerId");
    const body = await c.req.json();
    const now = new Date().toISOString();
    const invId = body.id || `INV-${Date.now().toString(36).toUpperCase()}`;
    const invoice = {
      id: invId,
      customerId,
      invoiceNumber: body.invoiceNumber || invId,
      amount: body.amount || 0,
      status: body.status || "Open",
      dueDate: body.dueDate || "",
      issuedDate: body.issuedDate || now.split("T")[0],
      description: body.description || "",
      createdAt: now,
    };
    await kv.set(`customerinvoice:${customerId}:${invId}`, invoice);

    // Log activity
    const actId = `ACT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await kv.set(`customeractivity:${customerId}:${actId}`, {
      id: actId, customerId, date: now.split("T")[0], type: "Invoice",
      description: `Created invoice ${invId}: $${(body.amount || 0).toLocaleString()}`,
      amount: body.amount || 0, user: "Current User", createdAt: now,
    });

    return c.json({ success: true, invoice });
  } catch (error) {
    console.error("Error creating customer invoice:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update invoice status
app.put("/make-server-c0840c88/customers/:customerId/billing/:invoiceId", async (c) => {
  try {
    const customerId = c.req.param("customerId");
    const invoiceId = c.req.param("invoiceId");
    const body = await c.req.json();
    const existing = await kv.get(`customerinvoice:${customerId}:${invoiceId}`);
    if (!existing) return c.json({ success: false, error: "Invoice not found" }, 404);
    const updated = { ...(existing as any), ...body, updatedAt: new Date().toISOString() };
    await kv.set(`customerinvoice:${customerId}:${invoiceId}`, updated);

    const now = new Date().toISOString();
    const actId = `ACT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await kv.set(`customeractivity:${customerId}:${actId}`, {
      id: actId, customerId, date: now.split("T")[0], type: "Invoice",
      description: `Updated invoice ${invoiceId} status to ${body.status || "updated"}`,
      amount: (existing as any).amount || null, user: "Current User", createdAt: now,
    });

    return c.json({ success: true, invoice: updated });
  } catch (error) {
    console.error("Error updating customer invoice:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete invoice
app.delete("/make-server-c0840c88/customers/:customerId/billing/:invoiceId", async (c) => {
  try {
    const customerId = c.req.param("customerId");
    const invoiceId = c.req.param("invoiceId");
    await kv.del(`customerinvoice:${customerId}:${invoiceId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer invoice:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== PRODUCT DATABASE ENDPOINTS ====================
// Product Database uses its own "productdb:" prefix, separate from Pipeline's "product:" prefix.
// It also includes "Live" pipeline products as read-only entries.

// Get all product database items (own + Live pipeline products)
app.get("/make-server-c0840c88/productdb", async (c) => {
  try {
    // Get products from the product database store
    const dbProducts = await kv.getByPrefix("productdb:");

    // Get pipeline products with "Live" status
    const pipelineProducts = await kv.getByPrefix("product:");
    const liveProducts: any[] = [];
    for (const p of pipelineProducts) {
      try {
        const val = typeof p === 'object' && (p as any).value !== undefined ? (p as any).value : p;
        const parsed = typeof val === 'string' ? JSON.parse(val) : val;
        if (parsed && parsed.status === 'Live') {
          liveProducts.push({ ...parsed, _source: 'pipeline' });
        }
      } catch { /* skip malformed */ }
    }

    return c.json({ success: true, products: dbProducts, liveProducts });
  } catch (error) {
    console.error("Error fetching product database:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single product database item
app.get("/make-server-c0840c88/productdb/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const product = await kv.get(`productdb:${id}`);
    if (!product) {
      return c.json({ success: false, error: "Product not found" }, 404);
    }
    return c.json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product database item:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create new product database item
app.post("/make-server-c0840c88/productdb", async (c) => {
  try {
    const product = await c.req.json();

    // Check for duplicate if this came from pipeline (has pipelineId)
    if (product.pipelineId) {
      const existingProducts = await kv.getByPrefix("productdb:");
      for (const p of existingProducts) {
        try {
          const val = typeof p === 'object' && (p as any).value !== undefined ? (p as any).value : p;
          const parsed = typeof val === 'string' ? JSON.parse(val) : val;
          if (parsed?.pipelineId === product.pipelineId) {
            return c.json({ success: true, product: parsed, alreadyExists: true });
          }
        } catch { /* skip */ }
      }
    }

    if (!product.id) {
      const allProducts = await kv.getByPrefix("productdb:");
      let maxId = 0;
      for (const p of allProducts) {
        try {
          const val = typeof p === 'object' && (p as any).value !== undefined ? (p as any).value : p;
          const parsed = typeof val === 'string' ? JSON.parse(val) : val;
          const num = parseInt(String(parsed?.id || '').replace("PDB-", ""));
          if (!isNaN(num) && num > maxId) maxId = num;
        } catch { /* skip */ }
      }
      product.id = `PDB-${String(maxId + 1).padStart(3, "0")}`;
    }

    product.lastUpdated = new Date().toISOString().split("T")[0];
    await kv.set(`productdb:${product.id}`, product);
    return c.json({ success: true, product });
  } catch (error) {
    console.error("Error creating product database item:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update product database item
app.put("/make-server-c0840c88/productdb/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();

    const existing = await kv.get(`productdb:${id}`);
    if (!existing) {
      return c.json({ success: false, error: "Product not found" }, 404);
    }

    const updated = { ...existing, ...updates, id, lastUpdated: new Date().toISOString().split("T")[0] };
    await kv.set(`productdb:${id}`, updated);
    return c.json({ success: true, product: updated });
  } catch (error) {
    console.error("Error updating product database item:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete product database item (only deletes from productdb:, never from product: pipeline)
app.delete("/make-server-c0840c88/productdb/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`productdb:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting product database item:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// INVENTORY MANAGEMENT ENDPOINTS
// ============================================

// Get all inventory items
app.get("/make-server-c0840c88/inventory", async (c) => {
  try {
    const items = await kv.getByPrefix("inventory:");

    // Batch-fetch all receipts and POs upfront to avoid N+1 queries
    const zeroCostItems = items.filter((item: any) => {
      const costVal = parseFloat((item.costPerUnit || '$0.00').replace('$', '')) || 0;
      return costVal <= 0 && item.sourceReceiptId;
    });

    if (zeroCostItems.length > 0) {
      // Batch-load all related receiving records and POs in parallel
      const [allReceipts, allPOs] = await Promise.all([
        kv.getByPrefix("receiving:"),
        kv.getByPrefix("po:"),
      ]);
      const receiptMap = new Map((allReceipts as any[]).map((r: any) => [r.id, r]));
      const poMap = new Map((allPOs as any[]).map((p: any) => [p.id, p]));
      const dirtyItems: any[] = [];

      for (const item of zeroCostItems) {
        let dirty = false;
        const receipt = receiptMap.get(item.sourceReceiptId);
        if (receipt) {
          const rcptItem = (receipt.items || []).find((ri: any) => ri.sku === item.sku) || (receipt.items || [])[0];
          if (rcptItem) {
            const rawUnitCost = rcptItem.unitCost || rcptItem.costPerUnit || 0;
            const numericUnitCost = typeof rawUnitCost === 'string' ? parseFloat(String(rawUnitCost).replace(/[^0-9.-]/g, '')) || 0 : rawUnitCost;
            if (numericUnitCost > 0) {
              const totalItemQty = (receipt.items || []).reduce((s: number, it: any) => s + (it.receivedQty || it.expectedQty || 0), 0);
              const poShippingCost = receipt.poShippingCost || 0;
              const poTaxRate = receipt.poSalesTaxRate || 0;
              const itemQty = item.quantity || 1;
              const lineTotal = numericUnitCost * itemQty;
              const allocatedShipping = totalItemQty > 0 ? (poShippingCost * itemQty / totalItemQty) : 0;
              const taxOnLine = (lineTotal + allocatedShipping) * poTaxRate;
              const allInCostPerUnit = itemQty > 0 ? (lineTotal + allocatedShipping + taxOnLine) / itemQty : numericUnitCost;
              item.costPerUnit = `$${allInCostPerUnit.toFixed(2)}`;
              if (allocatedShipping > 0) item.shippingCost = `$${allocatedShipping.toFixed(2)}`;
              dirty = true;
            }
          }
          if (!dirty && receipt.sourceOrderId) {
            const po = poMap.get(receipt.sourceOrderId);
            if (po) {
              const poItems = po.lineItems || po.variants || [];
              const matchingPoItem = poItems.find((pi: any) => pi.sku === item.sku) || poItems[0];
              if (matchingPoItem) {
                const poUnitPrice = matchingPoItem.unitPrice || matchingPoItem.netCost || matchingPoItem.clientPrice || matchingPoItem.costPerUnit || 0;
                const numericPrice = typeof poUnitPrice === 'string' ? parseFloat(String(poUnitPrice).replace(/[^0-9.-]/g, '')) || 0 : poUnitPrice;
                if (numericPrice > 0) {
                  item.costPerUnit = `$${numericPrice.toFixed(2)}`;
                  dirty = true;
                }
              }
            }
          }
        }
        if (dirty) dirtyItems.push(item);
      }

      // Batch-write all dirty items at once
      if (dirtyItems.length > 0) {
        const keys = dirtyItems.map((item: any) => `inventory:${item.id}`);
        await kv.mset(keys, dirtyItems);
      }
    }

    return c.json({ success: true, items });
  } catch (error) {
    console.log("Error fetching inventory items:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single inventory item
app.get("/make-server-c0840c88/inventory/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const item = await kv.get(`inventory:${id}`);
    if (!item) {
      return c.json({ success: false, error: "Inventory item not found" }, 404);
    }
    return c.json({ success: true, item });
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create inventory item
app.post("/make-server-c0840c88/inventory", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const item = {
      id,
      name: body.name || '',
      sku: body.sku || '',
      category: body.category || 'Uncategorized',
      quantity: Number(body.quantity) || 0,
      minStock: Number(body.minStock) || 0,
      unit: body.unit || 'pcs',
      supplier: body.supplier || '',
      costPerUnit: body.costPerUnit || '$0.00',
      unitPrice: body.unitPrice || '$0.00',
      location: body.location || '',
      lastRestocked: body.lastRestocked || new Date().toISOString().split('T')[0],
      imageUrl: body.imageUrl || '',
      customer: body.customer || '',
      notes: body.notes || '',
      orderDate: body.orderDate || '',
      shippingCost: body.shippingCost || '',
      paymentTerms: body.paymentTerms || 'Due on Receipt',
      paymentDate: body.paymentDate || '',
      paymentAmount: body.paymentAmount || '',
      itemType: body.itemType || '',
      productTags: body.productTags || [],
      sourceReceiptId: body.sourceReceiptId || '',
      allocated: Number(body.allocated) || 0,
      onOrder: Number(body.onOrder) || 0,
      inTransit: Number(body.inTransit) || 0,
      warehouseId: body.warehouseId || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`inventory:${id}`, item);
    return c.json({ success: true, item });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update inventory item
app.put("/make-server-c0840c88/inventory/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`inventory:${id}`) as Record<string, unknown> | null;
    if (!existing) {
      return c.json({ success: false, error: "Inventory item not found" }, 404);
    }
    const updated = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`inventory:${id}`, updated);
    return c.json({ success: true, item: updated });
  } catch (error) {
    console.error("Error updating inventory item:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete inventory item
app.delete("/make-server-c0840c88/inventory/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`inventory:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Bulk delete inventory items
app.post("/make-server-c0840c88/inventory/bulk-delete", async (c) => {
  try {
    const { ids } = await c.req.json();
    if (!ids || !Array.isArray(ids)) {
      return c.json({ success: false, error: "ids array is required" }, 400);
    }
    const keys = ids.map((id: string) => `inventory:${id}`);
    await kv.mdel(keys);
    return c.json({ success: true, deleted: ids.length });
  } catch (error) {
    console.error("Error bulk deleting inventory items:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// CONTRACT PRICING ENDPOINTS (Decorator Vendors)
// ============================================

// Get all contract pricing sheets for a vendor
app.get("/make-server-c0840c88/contractpricing/:vendorId", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const items = await kv.getByPrefix(`contractpricing:${vendorId}:`);
    return c.json({ success: true, items });
  } catch (error) {
    console.error("Error fetching contract pricing:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get a specific contract pricing sheet
app.get("/make-server-c0840c88/contractpricing/:vendorId/:decorationType/:year", async (c) => {
  try {
    const { vendorId, decorationType, year } = c.req.param();
    const key = `contractpricing:${vendorId}:${decorationType}:${year}`;
    const item = await kv.get(key);
    if (!item) {
      return c.json({ success: true, item: null });
    }
    return c.json({ success: true, item });
  } catch (error) {
    console.error("Error fetching contract pricing sheet:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create or update a contract pricing sheet
app.put("/make-server-c0840c88/contractpricing/:vendorId/:decorationType/:year", async (c) => {
  try {
    const { vendorId, decorationType, year } = c.req.param();
    const body = await c.req.json();
    const key = `contractpricing:${vendorId}:${decorationType}:${year}`;
    const data = {
      vendorId,
      decorationType,
      year,
      pricingMatrix: body.pricingMatrix || [],
      quantityBrackets: body.quantityBrackets || [],
      additionalCharges: body.additionalCharges || [],
      personalization: body.personalization || [],
      packagingShipping: body.packagingShipping || [],
      termsAndConditions: body.termsAndConditions || '',
      notes: body.notes || '',
      effectiveDate: body.effectiveDate || '',
      updatedAt: new Date().toISOString(),
    };
    await kv.set(key, data);
    return c.json({ success: true, item: data });
  } catch (error) {
    console.error("Error saving contract pricing:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a contract pricing sheet
app.delete("/make-server-c0840c88/contractpricing/:vendorId/:decorationType/:year", async (c) => {
  try {
    const { vendorId, decorationType, year } = c.req.param();
    const key = `contractpricing:${vendorId}:${decorationType}:${year}`;
    await kv.del(key);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting contract pricing:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get vendor decoration type config
app.get("/make-server-c0840c88/contractpricing/:vendorId/config", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const config = await kv.get(`contractpricingconfig:${vendorId}`);
    if (!config) {
      return c.json({ success: true, enabledTypes: [] });
    }
    return c.json({ success: true, enabledTypes: config.enabledTypes || [] });
  } catch (error) {
    console.error("Error fetching contract pricing config:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Save vendor decoration type config
app.put("/make-server-c0840c88/contractpricing/:vendorId/config", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const body = await c.req.json();
    await kv.set(`contractpricingconfig:${vendorId}`, {
      vendorId,
      enabledTypes: body.enabledTypes || [],
      updatedAt: new Date().toISOString(),
    });
    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving contract pricing config:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// IMAGE UPLOAD ENDPOINTS
// ============================================

// Upload an inventory image
app.post("/make-server-c0840c88/upload/inventory-image", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }

    const ext = file.name.split(".").pop() || "png";
    const fileName = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, uint8, {
        contentType: file.type || "image/png",
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return c.json({ success: false, error: `Upload failed: ${error.message}` }, 500);
    }

    // Create a signed URL (valid for 1 year)
    const { data: signedData, error: signError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365);

    if (signError) {
      console.error("Signed URL error:", signError);
      return c.json({ success: false, error: `Signed URL failed: ${signError.message}` }, 500);
    }

    return c.json({
      success: true,
      url: signedData.signedUrl,
      path: data.path,
    });
  } catch (error) {
    console.error("Error uploading inventory image:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete an inventory image
app.delete("/make-server-c0840c88/upload/inventory-image", async (c) => {
  try {
    const { path } = await c.req.json();
    if (!path) {
      return c.json({ success: false, error: "No path provided" }, 400);
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error("Storage delete error:", error);
      return c.json({ success: false, error: `Delete failed: ${error.message}` }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting inventory image:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// WMS - WAREHOUSE MANAGEMENT SYSTEM ENDPOINTS
// ============================================

// --- Warehouses CRUD ---
app.get("/make-server-c0840c88/warehouses", async (c) => {
  try {
    const warehouses = await kv.getByPrefix("warehouse:");

    // Enrich each warehouse with live stats from locations + inventory
    try {
      const [allLocations, allInventory] = await Promise.all([
        kv.getByPrefix("wms-location:"),
        kv.getByPrefix("inventory:"),
      ]);

      // Build warehouse code → id map for inventory matching
      const codeToId: Record<string, string> = {};
      for (const wh of warehouses as any[]) {
        if (wh.code) codeToId[wh.code.toUpperCase()] = wh.id;
      }

      // Group locations by warehouseId
      const locsByWh: Record<string, any[]> = {};
      for (const loc of allLocations as any[]) {
        const whId = loc.warehouseId;
        if (!whId) continue;
        if (!locsByWh[whId]) locsByWh[whId] = [];
        locsByWh[whId].push(loc);
      }

      // Group inventory by warehouseId (from field or location prefix match)
      const invByWh: Record<string, any[]> = {};
      for (const inv of allInventory as any[]) {
        let whId = inv.warehouseId;
        // If no warehouseId, try to match by location prefix (e.g. "MIA › Z01-A01")
        if (!whId && inv.location) {
          const locStr = String(inv.location);
          const sepIdx = locStr.indexOf(' \u203a ');
          if (sepIdx > 0) {
            const prefix = locStr.substring(0, sepIdx).trim().toUpperCase();
            whId = codeToId[prefix];
          }
          // Also try matching just the first segment before any dash/space
          if (!whId) {
            const firstSeg = locStr.split(/[\s\-\u203a]+/)[0]?.toUpperCase();
            if (firstSeg && codeToId[firstSeg]) {
              whId = codeToId[firstSeg];
            }
          }
        }
        if (whId) {
          if (!invByWh[whId]) invByWh[whId] = [];
          invByWh[whId].push(inv);
        }
      }

      // Compute stats for each warehouse
      for (const wh of warehouses as any[]) {
        const locs = locsByWh[wh.id] || [];
        const invItems = invByWh[wh.id] || [];

        // Total locations count
        wh.totalLocations = locs.length;

        // Bin locations count
        wh.totalBinLocations = locs.filter((l: any) => l.type === 'bin').length;

        // Open pallet locations: pallet-type locations that aren't 'Full'
        wh.openPalletLocations = locs.filter((l: any) => l.type === 'pallet' && l.status !== 'Full').length;

        // Total products (unique inventory items)
        wh.totalProducts = invItems.length;

        // Total inventory value
        let totalValue = 0;
        for (const inv of invItems) {
          const cost = typeof inv.costPerUnit === 'string'
            ? parseFloat(inv.costPerUnit.replace(/[^0-9.-]/g, '')) || 0
            : Number(inv.costPerUnit) || 0;
          totalValue += cost * (Number(inv.quantity) || 0);
        }
        wh.totalValue = Math.round(totalValue * 100) / 100;
      }
    } catch (enrichErr) {
      console.log("Warning: Could not enrich warehouse stats:", enrichErr);
      // Continue with un-enriched warehouses
    }

    return c.json({ success: true, warehouses });
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get("/make-server-c0840c88/warehouses/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const warehouse = await kv.get(`warehouse:${id}`);
    if (!warehouse) return c.json({ success: false, error: "Warehouse not found" }, 404);
    return c.json({ success: true, warehouse });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-c0840c88/warehouses", async (c) => {
  try {
    const body = await c.req.json();
    const warehouses = await kv.getByPrefix("warehouse:");
    const nextNum = warehouses.length + 1;
    const id = body.id || `WH-${String(nextNum).padStart(4, '0')}`;
    const warehouse = { ...body, id, createdAt: new Date().toISOString() };
    await kv.set(`warehouse:${id}`, warehouse);
    return c.json({ success: true, warehouse });
  } catch (error) {
    console.error("Error creating warehouse:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-c0840c88/warehouses/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`warehouse:${id}`);
    if (!existing) return c.json({ success: false, error: "Warehouse not found" }, 404);
    const updated = { ...existing, ...updates, id };
    await kv.set(`warehouse:${id}`, updated);
    return c.json({ success: true, warehouse: updated });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-c0840c88/warehouses/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`warehouse:${id}`);
    const locations = await kv.getByPrefix(`wms-location:${id}:`);
    if (locations.length > 0) {
      await kv.mdel(locations.map((l: any) => `wms-location:${id}:${l.id}`));
    }
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// --- Warehouse Locations CRUD ---
app.get("/make-server-c0840c88/warehouse-locations/:warehouseId", async (c) => {
  try {
    const warehouseId = c.req.param("warehouseId");
    const locations = await kv.getByPrefix(`wms-location:${warehouseId}:`);
    return c.json({ success: true, locations });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get("/make-server-c0840c88/warehouse-locations-all", async (c) => {
  try {
    const locations = await kv.getByPrefix("wms-location:");
    return c.json({ success: true, locations });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-c0840c88/warehouse-locations/:warehouseId", async (c) => {
  try {
    const warehouseId = c.req.param("warehouseId");
    const body = await c.req.json();
    const locationsToCreate = Array.isArray(body) ? body : [body];
    const created: any[] = [];
    for (const loc of locationsToCreate) {
      const id = loc.id || `LOC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const location = { ...loc, id, warehouseId, createdAt: new Date().toISOString() };
      await kv.set(`wms-location:${warehouseId}:${id}`, location);
      created.push(location);
    }
    return c.json({ success: true, locations: created });
  } catch (error) {
    console.error("Error creating warehouse locations:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-c0840c88/warehouse-locations/:warehouseId/:locationId", async (c) => {
  try {
    const warehouseId = c.req.param("warehouseId");
    const locationId = c.req.param("locationId");
    await kv.del(`wms-location:${warehouseId}:${locationId}`);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Bulk delete warehouse locations
app.post("/make-server-c0840c88/warehouse-locations-bulk-delete", async (c) => {
  try {
    const { warehouseId, locationIds } = await c.req.json();
    if (!warehouseId || !locationIds || !Array.isArray(locationIds)) {
      return c.json({ success: false, error: "warehouseId and locationIds[] required" }, 400);
    }
    const keys = locationIds.map((id: string) => `wms-location:${warehouseId}:${id}`);
    for (let i = 0; i < keys.length; i += 50) {
      const batch = keys.slice(i, i + 50);
      await kv.mdel(batch);
    }
    console.log(`Bulk deleted ${locationIds.length} locations from warehouse ${warehouseId}`);
    return c.json({ success: true, deleted: locationIds.length });
  } catch (error) {
    console.log(`Error bulk deleting warehouse locations: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// --- Receiving CRUD ---
app.get("/make-server-c0840c88/receiving", async (c) => {
  try {
    // Batch-fetch all data upfront in parallel to avoid N+1 queries
    const [receipts, shipments, purchaseOrders, orders, products] = await Promise.all([
      kv.getByPrefix("receiving:") as Promise<any[]>,
      kv.getByPrefix("shipment:") as Promise<any[]>,
      kv.getByPrefix("purchaseorder:") as Promise<any[]>,
      kv.getByPrefix("order:") as Promise<any[]>,
      kv.getByPrefix("product:") as Promise<any[]>,
    ]);

    // Build lookup maps for O(1) access instead of repeated .find()
    const productMap = new Map(products.map((p: any) => [p.id, p]));
    const dirtyReceipts: any[] = [];

    for (const rcpt of receipts) {
      if (rcpt.sourceOrderId || rcpt.poNumber) {
        let dirty = false;

        // Try shipment records first
        const linkedShipment = shipments.find((s: any) =>
          (rcpt.sourceOrderId && (s.poId === rcpt.sourceOrderId || s.orderId === rcpt.sourceOrderId)) ||
          (rcpt.poNumber && s.poNumber === rcpt.poNumber)
        );
        if (linkedShipment) {
          if (!rcpt.carrier && linkedShipment.carrier) { rcpt.carrier = linkedShipment.carrier; dirty = true; }
          if (!rcpt.trackingNumber && linkedShipment.trackingNumber) { rcpt.trackingNumber = linkedShipment.trackingNumber; dirty = true; }
          if (!rcpt.carrierType && linkedShipment.carrierType) { rcpt.carrierType = linkedShipment.carrierType; dirty = true; }
        }

        // If carrierType still empty, look up the source PO/order for shippingMethod
        if (!rcpt.carrierType) {
          const sourcePO = rcpt.sourceOrderId
            ? purchaseOrders.find((po: any) => po.id === rcpt.sourceOrderId) ||
              orders.find((o: any) => o.id === rcpt.sourceOrderId)
            : rcpt.poNumber
              ? purchaseOrders.find((po: any) => po.poNumber === rcpt.poNumber)
              : null;
          if (sourcePO && sourcePO.shippingMethod && sourcePO.shippingMethod !== 'Not Set') {
            rcpt.carrierType = sourcePO.shippingMethod;
            dirty = true;
          }
        }

        // Migrate legacy PRJ- project numbers on receiving records
        if (rcpt.projectNumber && rcpt.projectNumber.startsWith('PRJ-')) {
          rcpt.projectNumber = migrateProjectNumber(rcpt.projectNumber);
          dirty = true;
        }

        // Enrich items with product image and name from linked product/PO
        const hasEmptyImage = rcpt.items?.some((it: any) => !it.imageUrl);
        const hasEmptyName = rcpt.items?.some((it: any) => !it.name || it.name === '—' || it.name.startsWith('PO '));
        if (hasEmptyImage || hasEmptyName) {
          const linkedPO = rcpt.sourceOrderId
            ? purchaseOrders.find((po: any) => po.id === rcpt.sourceOrderId)
            : rcpt.poNumber
              ? purchaseOrders.find((po: any) => po.poNumber === rcpt.poNumber)
              : null;
          if (linkedPO) {
            let productImage = '';
            let productName = '';
            // Use pre-fetched product map instead of individual kv.get()
            if (linkedPO.productId) {
              const product = productMap.get(linkedPO.productId);
              if (product) {
                productImage = product.image || '';
                productName = product.name || '';
              }
            }
            if (!productName) productName = linkedPO.project || linkedPO.projectName || '';
            const poItems = linkedPO.lineItems || linkedPO.variants || [];
            if (!productImage && poItems.length > 0) {
              productImage = poItems[0].imageUrl || '';
            }
            if (!productImage && linkedPO.image) {
              productImage = linkedPO.image;
            }

            if (rcpt.items && (productImage || productName)) {
              for (const item of rcpt.items) {
                if (!item.imageUrl && productImage) { item.imageUrl = productImage; dirty = true; }
                if ((!item.name || item.name === '—' || item.name.startsWith('PO ')) && productName) { item.name = productName; dirty = true; }
              }
            }

            if (rcpt.items && poItems.length > 0) {
              for (let idx = 0; idx < rcpt.items.length; idx++) {
                const item = rcpt.items[idx];
                if (!item.unitCost && poItems[idx]) {
                  item.unitCost = poItems[idx].unitPrice || poItems[idx].costPerUnit || 0;
                  dirty = true;
                }
              }
            }

            if (!rcpt.sampleType && linkedPO.sampleType) { rcpt.sampleType = linkedPO.sampleType; dirty = true; }
            if (rcpt.isSample === undefined && linkedPO.isSample) { rcpt.isSample = linkedPO.isSample; dirty = true; }
            if (!rcpt.poSalesTaxRate && linkedPO.salesTaxRate) { rcpt.poSalesTaxRate = linkedPO.salesTaxRate; dirty = true; }
            if (!rcpt.poShippingCost) {
              const customItems = linkedPO.customLineItems || [];
              const shippingCost = customItems.reduce((sum: number, ci: any) => sum + ((ci.amount || 0) * (ci.quantity || 1)), 0);
              if (shippingCost > 0) { rcpt.poShippingCost = shippingCost; dirty = true; }
            }
          }
        }

        if (dirty) dirtyReceipts.push(rcpt);
      }
    }

    // Batch-write all dirty receipts at once instead of individual kv.set() calls
    if (dirtyReceipts.length > 0) {
      const keys = dirtyReceipts.map((r: any) => `receiving:${r.id}`);
      await kv.mset(keys, dirtyReceipts);
    }

    return c.json({ success: true, receipts });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-c0840c88/receiving", async (c) => {
  try {
    const body = await c.req.json();
    const receipts = await kv.getByPrefix("receiving:");
    const nextNum = receipts.length + 1;
    const id = body.id || `RCV-${String(nextNum).padStart(5, '0')}`;
    const receipt = { ...body, id, createdAt: new Date().toISOString(), status: body.status || 'Pending' };
    await kv.set(`receiving:${id}`, receipt);
    return c.json({ success: true, receipt });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-c0840c88/receiving/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`receiving:${id}`);
    if (!existing) return c.json({ success: false, error: "Receipt not found" }, 404);
    const updated = { ...existing, ...updates, id };
    await kv.set(`receiving:${id}`, updated);

    // Sync status changes to linked PO (Delivered status propagation)
    if (updates.status && (updates.status === 'Delivered' || updates.status === 'Completed')) {
      try {
        const poNumber = updated.poNumber;
        const sourceOrderId = updated.sourceOrderId;
        if (poNumber || sourceOrderId) {
          const allPOs = await kv.getByPrefix("purchaseorder:") as any[];
          for (const po of allPOs) {
            const linked = (poNumber && po.poNumber === poNumber) || (sourceOrderId && po.id === sourceOrderId);
            if (linked && po.status !== 'Delivered') {
              po.status = 'Delivered';
              po.updatedAt = new Date().toISOString();
              await kv.set(`purchaseorder:${po.id}`, po);
              console.log(`[Receiving→PO sync] Updated PO ${po.id} (${po.poNumber}) status to Delivered`);
            }
          }
        }
      } catch (syncErr) {
        console.log("[Receiving→PO sync] Error syncing status:", syncErr);
      }
    }

    return c.json({ success: true, receipt: updated });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-c0840c88/receiving/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`receiving:${id}`);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// --- Pick Lists CRUD ---
app.get("/make-server-c0840c88/pick-lists", async (c) => {
  try {
    const pickLists = await kv.getByPrefix("picklist:");
    return c.json({ success: true, pickLists });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-c0840c88/pick-lists", async (c) => {
  try {
    const body = await c.req.json();
    const pickLists = await kv.getByPrefix("picklist:");
    const nextNum = pickLists.length + 1;
    const id = body.id || `PK-${String(nextNum).padStart(5, '0')}`;
    const pickList = { ...body, id, createdAt: new Date().toISOString(), status: body.status || 'Pending' };
    await kv.set(`picklist:${id}`, pickList);
    return c.json({ success: true, pickList });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-c0840c88/pick-lists/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`picklist:${id}`);
    if (!existing) return c.json({ success: false, error: "Pick list not found" }, 404);
    const updated = { ...existing, ...updates, id };
    await kv.set(`picklist:${id}`, updated);
    return c.json({ success: true, pickList: updated });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-c0840c88/pick-lists/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`picklist:${id}`);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// --- Inventory Location Assignments ---
app.post("/make-server-c0840c88/inventory-assign-location", async (c) => {
  try {
    const { inventoryItemId, warehouseId, locationId, quantity } = await c.req.json();
    const assignmentId = `ASSIGN-${Date.now()}`;
    const assignment = { id: assignmentId, inventoryItemId, warehouseId, locationId, quantity, assignedAt: new Date().toISOString() };
    await kv.set(`inv-assignment:${assignmentId}`, assignment);
    return c.json({ success: true, assignment });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get("/make-server-c0840c88/inventory-assignments", async (c) => {
  try {
    const assignments = await kv.getByPrefix("inv-assignment:");
    return c.json({ success: true, assignments });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-c0840c88/inventory-assignments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`inv-assignment:${id}`);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// AMAZON DISTRIBUTION ENDPOINTS
// ============================================

app.get("/make-server-c0840c88/amazon-orders", async (c) => {
  try {
    const items = await kv.getByPrefix("amazon-order:");
    const orders = items.map((item: any) => {
      try {
        const val = typeof item === 'object' && item.value !== undefined
          ? (typeof item.value === 'string' ? JSON.parse(item.value) : item.value)
          : (typeof item === 'string' ? JSON.parse(item) : item);
        return val;
      } catch { return null; }
    }).filter((o: any) => o && o.id);
    return c.json({ success: true, orders });
  } catch (error) {
    console.log("Error fetching Amazon orders:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-c0840c88/amazon-orders", async (c) => {
  try {
    const order = await c.req.json();
    if (!order.id) {
      order.id = `AMZ-${Date.now()}`;
    }
    order.createdAt = order.createdAt || new Date().toISOString();
    await kv.set(`amazon-order:${order.id}`, order);
    return c.json({ success: true, order });
  } catch (error) {
    console.log("Error creating Amazon order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-c0840c88/amazon-orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`amazon-order:${id}`);
    const updated = { ...(existing || {}), ...updates, id };
    await kv.set(`amazon-order:${id}`, updated);
    return c.json({ success: true, order: updated });
  } catch (error) {
    console.log("Error updating Amazon order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-c0840c88/amazon-orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`amazon-order:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting Amazon order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// PRODUCTION MANAGEMENT ENDPOINTS
// ============================================

app.get("/make-server-c0840c88/production", async (c) => {
  try {
    const items = await kv.getByPrefix("production:");
    const orders = items.map((item: any) => {
      try {
        const val = typeof item === 'object' && item.value !== undefined
          ? (typeof item.value === 'string' ? JSON.parse(item.value) : item.value)
          : (typeof item === 'string' ? JSON.parse(item) : item);
        return val;
      } catch { return null; }
    }).filter((o: any) => o && o.id);
    return c.json({ success: true, orders });
  } catch (error) {
    console.log("Error fetching production orders:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-c0840c88/production", async (c) => {
  try {
    const order = await c.req.json();
    if (!order.id) {
      const ts = Date.now().toString().slice(-5);
      order.id = `PROD-${ts}`;
    }
    order.createdAt = order.createdAt || new Date().toISOString();
    await kv.set(`production:${order.id}`, order);
    return c.json({ success: true, order });
  } catch (error) {
    console.log("Error creating production order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-c0840c88/production/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`production:${id}`);
    const parsed = existing
      ? (typeof existing === 'object' && (existing as any).value !== undefined
        ? (typeof (existing as any).value === 'string' ? JSON.parse((existing as any).value) : (existing as any).value)
        : existing)
      : {};
    const updated = { ...parsed, ...updates, id };
    await kv.set(`production:${id}`, updated);
    return c.json({ success: true, order: updated });
  } catch (error) {
    console.log("Error updating production order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-c0840c88/production/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`production:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting production order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// CARRIER ACCOUNTS ENDPOINTS
// ============================================

// Get all carrier accounts
app.get("/make-server-c0840c88/carrier-accounts", async (c) => {
  try {
    const accounts = await kv.getByPrefix("carrier-account:");
    return c.json({ success: true, accounts });
  } catch (error) {
    console.log("Error fetching carrier accounts:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create carrier account
app.post("/make-server-c0840c88/carrier-accounts", async (c) => {
  try {
    const body = await c.req.json();
    const id = crypto.randomUUID();
    const account = { id, ...body, createdAt: new Date().toISOString() };
    await kv.set(`carrier-account:${id}`, account);
    return c.json({ success: true, account });
  } catch (error) {
    console.log("Error creating carrier account:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update carrier account
app.put("/make-server-c0840c88/carrier-accounts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`carrier-account:${id}`);
    const updated = { ...(existing || {}), ...body, id, updatedAt: new Date().toISOString() };
    await kv.set(`carrier-account:${id}`, updated);
    return c.json({ success: true, account: updated });
  } catch (error) {
    console.log("Error updating carrier account:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete carrier account
app.delete("/make-server-c0840c88/carrier-accounts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`carrier-account:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting carrier account:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== PIPELINE CHECKLIST SETTINGS ====================

// Get pipeline checklist settings (the template that defines what checklist items are available per tab)
app.get("/make-server-c0840c88/settings/pipeline-checklists", async (c) => {
  try {
    const settings = await kv.get("settings:pipeline-checklists");
    return c.json({ success: true, settings: settings || null });
  } catch (error) {
    console.log("Error fetching pipeline checklist settings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Save pipeline checklist settings
app.put("/make-server-c0840c88/settings/pipeline-checklists", async (c) => {
  try {
    const settings = await c.req.json();
    await kv.set("settings:pipeline-checklists", settings);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error saving pipeline checklist settings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== CUSTOM BOX PRESETS SETTINGS ====================

app.get("/make-server-c0840c88/settings/box-presets", async (c) => {
  try {
    const presets = await kv.get("settings:custom-box-presets");
    return c.json({ success: true, presets: presets || [] });
  } catch (error) {
    console.log("Error fetching custom box presets:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-c0840c88/settings/box-presets", async (c) => {
  try {
    const { presets } = await c.req.json();
    await kv.set("settings:custom-box-presets", presets);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error saving custom box presets:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== SALES LEADS ENDPOINTS ====================

app.get("/make-server-c0840c88/sales-leads", async (c) => {
  try {
    const leads = await kv.getByPrefix("saleslead:");
    return c.json({ success: true, leads });
  } catch (error) {
    console.log("Error fetching sales leads:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-c0840c88/sales-leads", async (c) => {
  try {
    const body = await c.req.json();
    const existing = await kv.getByPrefix("saleslead:");
    const maxNum = existing.reduce((max: number, l: any) => {
      const match = l.id?.match(/PR(\d+)/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 14000);
    const id = body.id || `PR${maxNum + 1}`;
    const lead = { ...body, id, createdAt: body.createdAt || new Date().toISOString(), lastActivity: new Date().toISOString() };
    await kv.set(`saleslead:${id}`, lead);
    return c.json({ success: true, lead });
  } catch (error) {
    console.log("Error creating sales lead:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-c0840c88/sales-leads/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`saleslead:${id}`);
    if (!existing) return c.json({ success: false, error: "Lead not found" }, 404);
    const updated = { ...existing, ...updates, id, lastActivity: new Date().toISOString() };
    await kv.set(`saleslead:${id}`, updated);
    return c.json({ success: true, lead: updated });
  } catch (error) {
    console.log("Error updating sales lead:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-c0840c88/sales-leads/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`saleslead:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting sales lead:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== VENDOR SCORECARD ENDPOINTS ====================

app.get("/make-server-c0840c88/vendor-scorecards", async (c) => {
  try {
    const scorecards = await kv.getByPrefix("vendorscore:");
    return c.json({ success: true, scorecards });
  } catch (error) {
    console.log("Error fetching vendor scorecards:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get("/make-server-c0840c88/vendor-scorecards/:vendorId", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const scorecard = await kv.get(`vendorscore:${vendorId}`);
    return c.json({ success: true, scorecard: scorecard || null });
  } catch (error) {
    console.log("Error fetching vendor scorecard:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-c0840c88/vendor-scorecards/:vendorId", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const body = await c.req.json();
    const scorecard = { ...body, vendorId, updatedAt: new Date().toISOString() };
    await kv.set(`vendorscore:${vendorId}`, scorecard);
    return c.json({ success: true, scorecard });
  } catch (error) {
    console.log("Error saving vendor scorecard:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== VENDOR AI HEALTH ANALYSIS ENDPOINT ====================

app.get("/make-server-c0840c88/vendor-scorecards/:vendorId/ai-analysis", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const vendorName = c.req.query("vendorName") || "this vendor";
    
    const scorecard = await kv.get(`vendorscore:${vendorId}`);
    const allPOs = await kv.getByPrefix("po:");
    const vendorPOs = allPOs.filter((po: any) => po.vendorId === vendorId || po.vendor === vendorName);
    const allTickets = await kv.getByPrefix("contactticket:");
    const vendorTickets = allTickets.filter((t: any) => 
      (t.description || "").toLowerCase().includes(vendorName.toLowerCase()) ||
      (t.subject || "").toLowerCase().includes(vendorName.toLowerCase()) ||
      (t.relatedVendor || "") === vendorId
    );
    
    const prevAnalysis = await kv.get(`vendorai:${vendorId}`);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentPOs = vendorPOs.filter((po: any) => new Date(po.createdAt || po.poDate || "") > thirtyDaysAgo);
    const deliveredPOs = vendorPOs.filter((po: any) => po.status === "Delivered" || po.status === "Completed");
    const latePOs = vendorPOs.filter((po: any) => po.status === "Late" || po.isLate);
    const cancelledPOs = vendorPOs.filter((po: any) => po.status === "Cancelled");
    const onTimeRate = vendorPOs.length > 0 ? Math.round(((deliveredPOs.length) / Math.max(vendorPOs.length - cancelledPOs.length, 1)) * 100) : null;
    const lateRate = vendorPOs.length > 0 ? Math.round((latePOs.length / Math.max(vendorPOs.length, 1)) * 100) : 0;
    const openTickets = vendorTickets.filter((t: any) => t.status === "Open" || t.status === "In Progress");
    const criticalTickets = vendorTickets.filter((t: any) => t.priority === "Critical" || t.priority === "High");
    const totalSpend = vendorPOs.reduce((sum: number, po: any) => sum + (parseFloat(po.total) || 0), 0);
    const recentSpend = recentPOs.reduce((sum: number, po: any) => sum + (parseFloat(po.total) || 0), 0);
    
    const incidents = scorecard?.incidents || [];
    const openIncidents = incidents.filter((i: any) => !i.resolved);
    const recentIncidents = incidents.filter((i: any) => new Date(i.date) > thirtyDaysAgo);
    const incidentsByType: Record<string, number> = {};
    incidents.forEach((i: any) => { incidentsByType[i.type] = (incidentsByType[i.type] || 0) + 1; });
    const topIssueType = Object.entries(incidentsByType).sort((a, b) => b[1] - a[1])[0];
    
    const metrics = scorecard?.metrics || [];
    const overallScore = scorecard?.overallScore || 0;
    const tier = scorecard?.tier || "New";
    const weakMetrics = metrics.filter((m: any) => m.score < 70).sort((a: any, b: any) => a.score - b.score);
    const strongMetrics = metrics.filter((m: any) => m.score >= 85).sort((a: any, b: any) => b.score - a.score);
    
    const recommendations: any[] = [];
    const riskFactors: any[] = [];
    
    if (overallScore < 50) {
      riskFactors.push({ level: "critical", factor: "Overall score critically low", detail: `Score of ${overallScore} places vendor in Suspended tier. Immediate action required.` });
      recommendations.push({ priority: "critical", action: "Initiate Vendor Review Meeting", detail: `Schedule an urgent review with ${vendorName}. Overall score of ${overallScore} is well below acceptable thresholds. Consider alternative sourcing if no improvement plan is agreed upon within 30 days.`, category: "relationship" });
    } else if (overallScore < 70) {
      riskFactors.push({ level: "high", factor: "Score below Approved threshold", detail: `Score of ${overallScore} puts vendor on Probation.` });
      recommendations.push({ priority: "high", action: "Create Performance Improvement Plan", detail: `Develop a structured improvement plan with ${vendorName} targeting the weakest metrics. Set 60-day checkpoints with measurable goals.`, category: "relationship" });
    }
    
    if (openIncidents.length >= 3) {
      riskFactors.push({ level: "high", factor: `${openIncidents.length} unresolved incidents`, detail: "Multiple open incidents indicate systemic issues." });
      recommendations.push({ priority: "high", action: "Escalate Open Incidents", detail: `${openIncidents.length} incidents remain unresolved. Escalate to vendor management and request a root cause analysis within 7 days.`, category: "operations" });
    }
    if (recentIncidents.length >= 2) {
      riskFactors.push({ level: "medium", factor: "Incident spike in last 30 days", detail: `${recentIncidents.length} incidents logged recently.` });
    }
    if (topIssueType && topIssueType[1] >= 3) {
      riskFactors.push({ level: "high", factor: `Recurring issue: ${topIssueType[0]}`, detail: `${topIssueType[1]} incidents of this type suggest a systemic problem.` });
      recommendations.push({ priority: "high", action: `Address Recurring ${topIssueType[0]} Issues`, detail: `"${topIssueType[0]}" has occurred ${topIssueType[1]} times. Request a corrective action plan. Consider contract penalties for repeated occurrences.`, category: "operations" });
    }
    if (criticalTickets.length > 0) {
      riskFactors.push({ level: "high", factor: `${criticalTickets.length} critical/high priority tickets`, detail: "High-severity support tickets linked to this vendor." });
      recommendations.push({ priority: "high", action: "Review Critical Support Tickets", detail: `There are ${criticalTickets.length} high-priority tickets related to ${vendorName}. Cross-reference with PO issues to identify root causes.`, category: "support" });
    }
    
    weakMetrics.slice(0, 3).forEach((m: any) => {
      const advice: Record<string, string> = {
        "Delivery": "Negotiate tighter delivery SLAs with penalties. Require shipment tracking updates at key milestones.",
        "Quality": "Implement pre-shipment quality inspections. Request QC photos before dispatch. Consider third-party inspection.",
        "Cost": "Benchmark pricing against 2-3 alternative suppliers. Negotiate volume-based discounts or annual agreements.",
        "Service": "Set response time SLAs (24hr urgent, 48hr standard). Establish dedicated account manager contact.",
        "Compliance": "Create compliance checklists per order. Require documentation within 48hrs of shipment.",
      };
      recommendations.push({ priority: m.score < 50 ? "high" : "medium", action: `Improve ${m.label} (Score: ${m.score})`, detail: advice[m.category] || "Focus on improving this metric through targeted vendor engagement.", category: m.category.toLowerCase() });
    });
    
    if (strongMetrics.length >= 5 && overallScore >= 85) {
      recommendations.push({ priority: "low", action: "Consider Preferred Vendor Benefits", detail: `${vendorName} consistently performs well. Consider longer-term contracts, volume commitments, or preferred vendor status.`, category: "relationship" });
    }
    if (lateRate > 20) {
      riskFactors.push({ level: "high", factor: `${lateRate}% late delivery rate`, detail: `${latePOs.length} of ${vendorPOs.length} POs were late.` });
      recommendations.push({ priority: "high", action: "Implement Delivery Monitoring", detail: `With ${lateRate}% late deliveries, implement real-time tracking and require advance delay notices. Add late delivery penalties to contracts.`, category: "logistics" });
    }
    if (recentSpend > 0 && totalSpend > 0) {
      const sp = Math.round((recentSpend / totalSpend) * 100);
      if (sp > 50 && overallScore < 70) {
        riskFactors.push({ level: "medium", factor: "High spend with underperforming vendor", detail: `${sp}% of total spend in last 30 days despite low scores.` });
        recommendations.push({ priority: "medium", action: "Diversify Supply Chain", detail: "Significant spend concentration with an underperforming vendor. Identify 1-2 alternative suppliers.", category: "strategy" });
      }
    }
    if (recommendations.length === 0) {
      recommendations.push({ priority: "low", action: "Maintain Current Performance", detail: `${vendorName} is performing within acceptable parameters. Schedule quarterly reviews to maintain standards.`, category: "relationship" });
    }
    
    let trajectory = "stable";
    if (recentIncidents.length >= 2 || (prevAnalysis && prevAnalysis.overallScore > overallScore + 5)) trajectory = "declining";
    else if (openIncidents.length === 0 && overallScore >= 80 && recentIncidents.length === 0) trajectory = "improving";
    
    let healthSummary = "";
    if (overallScore >= 85 && openIncidents.length === 0) {
      healthSummary = `${vendorName} is a top-performing vendor with an excellent track record. No open incidents and consistently high scores. Recommended for increased volume and long-term partnership.`;
    } else if (overallScore >= 70) {
      healthSummary = `${vendorName} meets acceptable standards but has areas for improvement.${weakMetrics.length > 0 ? ` Key areas: ${weakMetrics.map((m: any) => m.label).join(', ')}.` : ''} ${openIncidents.length > 0 ? `${openIncidents.length} open incidents need resolution.` : 'No open incidents.'}`;
    } else if (overallScore >= 50) {
      healthSummary = `${vendorName} is on Probation with significant performance gaps. ${weakMetrics.length} metrics below threshold.${incidents.length > 0 ? ` ${incidents.length} incidents logged, ${openIncidents.length} unresolved.` : ''} Implement improvement plan immediately.`;
    } else {
      healthSummary = `${vendorName} has critical issues requiring immediate intervention. Place on hold for new orders until corrective action plan is approved. Consider transitioning active orders to alternative suppliers.`;
    }
    
    const analysis = {
      vendorId, vendorName, generatedAt: new Date().toISOString(),
      overallScore, tier, trajectory, healthSummary,
      riskFactors: riskFactors.sort((a, b) => { const o: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }; return (o[a.level] ?? 3) - (o[b.level] ?? 3); }),
      recommendations: recommendations.sort((a, b) => { const o: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }; return (o[a.priority] ?? 3) - (o[b.priority] ?? 3); }),
      dataPoints: {
        totalPOs: vendorPOs.length, deliveredPOs: deliveredPOs.length, latePOs: latePOs.length,
        cancelledPOs: cancelledPOs.length, onTimeRate,
        totalSpend: Math.round(totalSpend * 100) / 100, recentSpend: Math.round(recentSpend * 100) / 100,
        totalTickets: vendorTickets.length, openTickets: openTickets.length, criticalTickets: criticalTickets.length,
        totalIncidents: incidents.length, openIncidents: openIncidents.length, recentIncidents: recentIncidents.length,
        weakMetrics: weakMetrics.length, strongMetrics: strongMetrics.length,
        topIssueType: topIssueType ? topIssueType[0] : null, topIssueCount: topIssueType ? topIssueType[1] : 0,
      },
    };
    
    await kv.set(`vendorai:${vendorId}`, { ...analysis, previousScore: prevAnalysis?.overallScore || null });
    return c.json({ success: true, analysis });
  } catch (error) {
    console.log("Error generating AI vendor analysis:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== CONTACT EMAILS ENDPOINTS ====================

app.get("/make-server-c0840c88/contacts/:contactId/emails", async (c) => {
  try {
    const contactId = c.req.param("contactId");
    const emails = await kv.getByPrefix(`contactemail:${contactId}:`);
    emails.sort((a: any, b: any) => (b.sentAt || "").localeCompare(a.sentAt || ""));
    return c.json({ success: true, emails });
  } catch (error) {
    console.error("Error fetching contact emails:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-c0840c88/contacts/:contactId/emails", async (c) => {
  try {
    const contactId = c.req.param("contactId");
    const body = await c.req.json();
    const emailId = `CEML-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const email = {
      id: emailId, contactId,
      subject: body.subject || "(No Subject)",
      body: body.body || "",
      from: body.from || "Current User",
      to: body.to || "",
      status: body.status || "Sent",
      sentAt: now, openCount: 0,
    };
    await kv.set(`contactemail:${contactId}:${emailId}`, email);
    const actId = `CACT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await kv.set(`contactactivity:${contactId}:${actId}`, {
      id: actId, contactId, date: now.split("T")[0], type: "Email",
      description: `Email sent: "${email.subject}"`, user: email.from, createdAt: now,
    });
    return c.json({ success: true, email });
  } catch (error) {
    console.error("Error creating contact email:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-c0840c88/contacts/:contactId/emails/:emailId", async (c) => {
  try {
    const { contactId, emailId } = c.req.param() as any;
    await kv.del(`contactemail:${contactId}:${emailId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting contact email:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== CONTACT TICKETS ENDPOINTS ====================

app.get("/make-server-c0840c88/contacts/:contactId/tickets", async (c) => {
  try {
    const contactId = c.req.param("contactId");
    const tickets = await kv.getByPrefix(`contactticket:${contactId}:`);
    tickets.sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return c.json({ success: true, tickets });
  } catch (error) {
    console.error("Error fetching contact tickets:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-c0840c88/contacts/:contactId/tickets", async (c) => {
  try {
    const contactId = c.req.param("contactId");
    const body = await c.req.json();
    const allTickets = await kv.getByPrefix("contactticket:");
    const maxNum = allTickets.reduce((max: number, t: any) => {
      const match = t.id?.match(/TKT-(\d+)/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);
    const ticketId = `TKT-${String(maxNum + 1).padStart(4, '0')}`;
    const now = new Date().toISOString();
    const ticket = {
      id: ticketId, contactId,
      subject: body.subject || "", description: body.description || "",
      priority: body.priority || "Medium", status: body.status || "Open",
      category: body.category || "General", assignedTo: body.assignedTo || "",
      createdAt: now, updatedAt: now,
    };
    await kv.set(`contactticket:${contactId}:${ticketId}`, ticket);
    const actId = `CACT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await kv.set(`contactactivity:${contactId}:${actId}`, {
      id: actId, contactId, date: now.split("T")[0], type: "Ticket",
      description: `Ticket created: "${ticket.subject}" [${ticket.priority}]`, user: "Current User", createdAt: now,
    });
    return c.json({ success: true, ticket });
  } catch (error) {
    console.error("Error creating contact ticket:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-c0840c88/contacts/:contactId/tickets/:ticketId", async (c) => {
  try {
    const { contactId, ticketId } = c.req.param() as any;
    const body = await c.req.json();
    const existing = await kv.get(`contactticket:${contactId}:${ticketId}`);
    if (!existing) return c.json({ success: false, error: "Ticket not found" }, 404);
    const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
    await kv.set(`contactticket:${contactId}:${ticketId}`, updated);
    return c.json({ success: true, ticket: updated });
  } catch (error) {
    console.error("Error updating contact ticket:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-c0840c88/contacts/:contactId/tickets/:ticketId", async (c) => {
  try {
    const { contactId, ticketId } = c.req.param() as any;
    await kv.del(`contactticket:${contactId}:${ticketId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting contact ticket:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(async (req: Request) => {
  try {
    // Ensure bucket exists on first request (lazy init instead of blocking boot)
    ensureBucket().catch(() => {});
    const res = await app.fetch(req);
    return res;
  } catch (err) {
    console.log("Fatal unhandled error in request handler:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
});