import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

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
      const maxId = allProducts.reduce((max, p) => {
        const num = parseInt(p.id.replace("PRD-", ""));
        return num > max ? num : max;
      }, 0);
      product.id = `PRD-${String(maxId + 1).padStart(3, "0")}`;
    }
    
    await kv.set(`product:${product.id}`, product);
    return c.json({ success: true, product });
  } catch (error) {
    console.error("Error creating product:", error);
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
      console.error("REMOVE_BG_API_KEY is not set");
      return c.json({ success: false, error: "Background removal service not configured" }, 500);
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
      const errorText = await response.text();
      console.error("Remove.bg API error:", errorText);
      return c.json({ success: false, error: `Background removal failed: ${response.status}` }, response.status);
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
    const vendors = await kv.getByPrefix("globalvendor:");
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
    return c.json({ success: true, vendor: updated });
  } catch (error) {
    console.error("Error updating vendor:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete global vendor
app.delete("/make-server-c0840c88/vendors/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`globalvendor:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting vendor:", error);
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
    
    // Generate PO number if not provided
    if (!order.poNumber) {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      order.poNumber = `SAMPLE-${randomNum}`;
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
    
    await kv.set(`purchaseorder:${id}`, updated);
    return c.json({ success: true, order: updated });
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

// Get all orders
app.get("/make-server-c0840c88/orders", async (c) => {
  try {
    const orders = await kv.getByPrefix("order:");
    return c.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single order by ID
app.get("/make-server-c0840c88/orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const order = await kv.get(`order:${id}`);
    if (!order) {
      return c.json({ success: false, error: "Order not found" }, 404);
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
    
    // Set creation date
    order.createdAt = new Date().toISOString();
    
    await kv.set(`order:${order.id}`, order);
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
    
    const existing = await kv.get(`order:${id}`);
    if (!existing) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }
    
    const updated = { ...existing, ...updates, id }; // Preserve ID
    updated.updatedAt = new Date().toISOString();
    
    await kv.set(`order:${id}`, updated);
    return c.json({ success: true, order: updated });
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

// Get all design projects
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
    
    const existing = await kv.get(`contact:${id}`);
    if (!existing) {
      return c.json({ success: false, error: "Contact not found" }, 404);
    }
    
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
    
    await kv.set(`shipment:${shipment.id}`, shipment);
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

Deno.serve(app.fetch);