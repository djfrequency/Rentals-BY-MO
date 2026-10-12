import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from './src/data/initialProducts.ts';
import { Product } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Data directory & storage paths
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Password hashing helpers
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password: string, salt: string, hash: string): boolean {
  const checkHash = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(checkHash, 'hex'), Buffer.from(hash, 'hex'));
}

// In-memory sessions map token -> { username, expiresAt }
const sessions = new Map<string, { username: string; expiresAt: number }>();

// Initialize Admin Credentials
function initAdmin() {
  if (!fs.existsSync(ADMIN_FILE)) {
    const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
    const defaultPassword = process.env.ADMIN_PASSWORD || 'RentalsByMo2026!';
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(defaultPassword, salt);
    fs.writeFileSync(
      ADMIN_FILE,
      JSON.stringify(
        {
          username: defaultUsername,
          salt,
          hash,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );
    console.log('[Auth] Admin account initialized.');
  }
}

// Initialize Products Store
function getProducts(): Product[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[Storage] Error reading products file:', err);
  }
  // Initialize with initial products
  saveProducts(INITIAL_PRODUCTS);
  return INITIAL_PRODUCTS;
}

function saveProducts(products: Product[]) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
}

// Initialize stores
initAdmin();
if (!fs.existsSync(PRODUCTS_FILE)) {
  saveProducts(INITIAL_PRODUCTS);
  console.log(`[Storage] Initialized products catalogue with ${INITIAL_PRODUCTS.length} products.`);
}

// Express Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Multer upload setup
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e5)}`;
    cb(null, `${cleanBase}-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|svg\+xml|svg/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WEBP, GIF, and SVG images are supported.'));
    }
  },
});

// Admin Auth Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const session = sessions.get(token);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
    return;
  }

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    res.status(401).json({ error: 'Unauthorized: Session expired' });
    return;
  }

  // Extend session by 2 hours
  session.expiresAt = Date.now() + 2 * 60 * 60 * 1000;
  next();
}

// ----------------- API ROUTES ----------------- //

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Rentals BY MO',
    productsCount: getProducts().length,
    timestamp: new Date().toISOString(),
  });
});

// Public: Get all products
app.get('/api/products', (_req, res) => {
  const products = getProducts();
  res.json(products);
});

// Public: Get categories
app.get('/api/categories', (_req, res) => {
  const products = getProducts();
  const cats = Array.from(new Set(products.map((p) => p.category)));
  res.json(cats);
});

// Admin: Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  try {
    const adminData = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf-8'));
    if (adminData.username.toLowerCase() !== username.trim().toLowerCase()) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const isValid = verifyPassword(password, adminData.salt, adminData.hash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 hours
    sessions.set(token, { username: adminData.username, expiresAt });

    res.json({
      token,
      user: {
        username: adminData.username,
        role: 'admin',
      },
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ error: 'Internal server authentication error' });
  }
});

// Admin: Check Current Session
app.get('/api/admin/me', requireAdmin, (req, res) => {
  const authHeader = req.headers.authorization!;
  const token = authHeader.split(' ')[1];
  const session = sessions.get(token)!;
  res.json({
    authenticated: true,
    user: {
      username: session.username,
      role: 'admin',
    },
  });
});

// Admin: Logout
app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    sessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// Admin: Change Password
app.post('/api/admin/change-password', requireAdmin, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current password and new password are required' });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ error: 'New password must be at least 8 characters long' });
    return;
  }

  try {
    const adminData = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf-8'));
    const isValid = verifyPassword(currentPassword, adminData.salt, adminData.hash);
    if (!isValid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = hashPassword(newPassword, newSalt);

    adminData.salt = newSalt;
    adminData.hash = newHash;
    adminData.updatedAt = new Date().toISOString();
    fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminData, null, 2), 'utf-8');

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('[Auth] Error changing password:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Admin: Upload Image
app.post('/api/upload', requireAdmin, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message || 'Image upload failed' });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }
    const publicUrl = `/uploads/${req.file.filename}`;
    res.json({ url: publicUrl, filename: req.file.filename });
  });
});

// Admin: Add Product
app.post('/api/products', requireAdmin, (req, res) => {
  const {
    name,
    description,
    category,
    imageUrl,
    priceType,
    price,
    priceMin,
    priceMax,
    pricingBasis,
    isAvailable,
    isFeatured,
    notes,
  } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Product name is required' });
    return;
  }
  if (!category || !category.trim()) {
    res.status(400).json({ error: 'Category is required' });
    return;
  }

  const products = getProducts();
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const newProduct: Product = {
    id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: name.trim(),
    slug,
    description: description ? description.trim() : '',
    category: category.trim(),
    imageUrl:
      imageUrl && imageUrl.trim()
        ? imageUrl.trim()
        : 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    priceType: priceType || 'fixed',
    price: price !== undefined && price !== null && price !== '' ? parseFloat(price) : undefined,
    priceMin:
      priceMin !== undefined && priceMin !== null && priceMin !== ''
        ? parseFloat(priceMin)
        : undefined,
    priceMax:
      priceMax !== undefined && priceMax !== null && priceMax !== ''
        ? parseFloat(priceMax)
        : undefined,
    pricingBasis: pricingBasis ? pricingBasis.trim() : 'each/day',
    isAvailable: isAvailable !== false,
    isFeatured: !!isFeatured,
    notes: notes ? notes.trim() : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  products.unshift(newProduct);
  saveProducts(products);
  res.status(201).json(newProduct);
});

// Admin: Edit Product
app.put('/api/products/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const existing = products[index];
  const {
    name,
    description,
    category,
    imageUrl,
    priceType,
    price,
    priceMin,
    priceMax,
    pricingBasis,
    isAvailable,
    isFeatured,
    notes,
  } = req.body;

  if (name !== undefined && !name.trim()) {
    res.status(400).json({ error: 'Product name cannot be empty' });
    return;
  }

  const updated: Product = {
    ...existing,
    name: name !== undefined ? name.trim() : existing.name,
    description: description !== undefined ? description.trim() : existing.description,
    category: category !== undefined ? category.trim() : existing.category,
    imageUrl: imageUrl !== undefined && imageUrl.trim() ? imageUrl.trim() : existing.imageUrl,
    priceType: priceType !== undefined ? priceType : existing.priceType,
    price:
      price !== undefined
        ? price !== null && price !== ''
          ? parseFloat(price)
          : undefined
        : existing.price,
    priceMin:
      priceMin !== undefined
        ? priceMin !== null && priceMin !== ''
          ? parseFloat(priceMin)
          : undefined
        : existing.priceMin,
    priceMax:
      priceMax !== undefined
        ? priceMax !== null && priceMax !== ''
          ? parseFloat(priceMax)
          : undefined
        : existing.priceMax,
    pricingBasis: pricingBasis !== undefined ? pricingBasis.trim() : existing.pricingBasis,
    isAvailable: isAvailable !== undefined ? !!isAvailable : existing.isAvailable,
    isFeatured: isFeatured !== undefined ? !!isFeatured : existing.isFeatured,
    notes: notes !== undefined ? (notes ? notes.trim() : undefined) : existing.notes,
    updatedAt: new Date().toISOString(),
  };

  products[index] = updated;
  saveProducts(products);
  res.json(updated);
});

// Admin: Quick Toggle Availability
app.patch('/api/products/:id/availability', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { isAvailable } = req.body;
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  products[index].isAvailable = typeof isAvailable === 'boolean' ? isAvailable : !products[index].isAvailable;
  products[index].updatedAt = new Date().toISOString();
  saveProducts(products);

  res.json({
    id,
    isAvailable: products[index].isAvailable,
    product: products[index],
  });
});

// Admin: Delete Product
app.delete('/api/products/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const [deleted] = products.splice(index, 1);
  saveProducts(products);
  res.json({ success: true, message: `Product "${deleted.name}" deleted`, product: deleted });
});

// Admin: Reset Catalog to initial 38 products
app.post('/api/products/reset', requireAdmin, (_req, res) => {
  saveProducts(INITIAL_PRODUCTS);
  res.json({
    success: true,
    message: `Catalog reset to default 38 products.`,
    count: INITIAL_PRODUCTS.length,
    products: INITIAL_PRODUCTS,
  });
});

// Admin: Export backup
app.get('/api/products/export', requireAdmin, (_req, res) => {
  const products = getProducts();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="rentals-by-mo-backup-${Date.now()}.json"`);
  res.json({
    exportedAt: new Date().toISOString(),
    totalProducts: products.length,
    products,
  });
});

// Admin: Import backup
app.post('/api/products/import', requireAdmin, (req, res) => {
  const { products } = req.body;
  if (!Array.isArray(products) || products.length === 0) {
    res.status(400).json({ error: 'Invalid backup file: "products" must be a non-empty array' });
    return;
  }

  // Validate format
  for (const item of products) {
    if (!item.name || !item.category) {
      res.status(400).json({ error: 'Imported products must contain name and category' });
      return;
    }
  }

  saveProducts(products);
  res.json({
    success: true,
    message: `Successfully imported ${products.length} products.`,
    count: products.length,
    products,
  });
});

// ----------------- VITE / STATIC HANDLING ----------------- //

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Development mode: Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve dist folder
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rentals BY MO server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
