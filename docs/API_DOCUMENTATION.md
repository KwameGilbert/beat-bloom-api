# Automatic API Documentation

This template features **fully automatic API documentation** that generates OpenAPI specs from your Zod validation schemas - **no manual JSDoc writing required!**

## 🎯 How It Works

1. **You write validation schemas** (which you already need for validation)
2. **System automatically converts** Zod schemas to OpenAPI schemas
3. **Documentation appears** in Swagger UI instantly

**Zero extra work needed!**

---

## 🚀 Quick Start

### 1. Define Your Route Documentation

Open `src/config/swagger.js` and add your route:

```javascript
import { postDoc, getDoc, patchDoc } from '../utils/routeDoc.js';
import { mySchemas } from '../validators/schemas.js';

const autoRoutes = [
  // Just describe the route - schemas handle the rest!
  postDoc('/products', {
    summary: 'Create a product',
    tags: ['Products'],
    bodySchema: mySchemas.createProduct, // Your Zod schema
    auth: true,
  }),

  getDoc('/products/{id}', {
    summary: 'Get product by ID',
    tags: ['Products'],
    paramsSchema: mySchemas.productParams,
    auth: false,
  }),
];
```

### 2. That's It!

The documentation is **automatically generated** from your Zod schemas. Visit:

```
http://localhost:3000/api/v1/docs
```

---

## 📝 Adding New Routes

### Example 1: Simple POST Route

**Step 1: Create Zod Schema** (in `src/validators/schemas.js`):

```javascript
export const productSchemas = {
  create: z.object({
    name: z.string().min(1).max(100),
    price: z.number().min(0),
    description: z.string().optional(),
    category: z.enum(['electronics', 'clothing', 'food']),
  }),
};
```

**Step 2: Add to swagger.js**:

```javascript
import { productSchemas } from '../validators/schemas.js';

const autoRoutes = [
  // ... existing routes
  postDoc('/products', {
    summary: 'Create a new product',
    description: 'Creates a new product in the catalog',
    tags: ['Products'],
    bodySchema: productSchemas.create, // ✨ Auto-generates request body docs
    auth: true,
  }),
];
```

**Result**: Full documentation with:

- Request body schema
- Field types and constraints
- Required vs optional fields
- Enum values
- Authentication requirements

---

### Example 2: GET with Query Parameters

**Zod Schema**:

```javascript
export const productSchemas = {
  listQuery: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    category: z.enum(['electronics', 'clothing', 'food']).optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
  }),
};
```

**Route Definition**:

```javascript
getDoc('/products', {
  summary: 'List products',
  tags: ['Products'],
  querySchema: productSchemas.listQuery, // ✨ Auto-generates query params
  auth: false,
}),
```

**Result**: All query parameters documented automatically!

---

### Example 3: Route with Path Parameters

**Zod Schema**:

```javascript
export const productSchemas = {
  params: z.object({
    id: z.string().uuid(),
  }),
  update: z.object({
    name: z.string().min(1).max(100).optional(),
    price: z.number().min(0).optional(),
    stock: z.number().int().min(0).optional(),
  }),
};
```

**Route Definition**:

```javascript
patchDoc('/products/{id}', {
  summary: 'Update product',
  tags: ['Products'],
  paramsSchema: productSchemas.params,   // ✨ Path params
  bodySchema: productSchemas.update,     // ✨ Request body
  auth: true,
}),
```

---

## 🔧 Helper Functions

### HTTP Method Shortcuts

```javascript
import { getDoc, postDoc, putDoc, patchDoc, deleteDoc } from '../utils/routeDoc.js';

// GET route
getDoc('/resource', { ... })

// POST route
postDoc('/resource', { ... })

// PUT route
putDoc('/resource/{id}', { ... })

// PATCH route
patchDoc('/resource/{id}', { ... })

// DELETE route
deleteDoc('/resource/{id}', { ... })
```

### Configuration Options

```javascript
postDoc('/path', {
  summary: 'Short description', // Required
  description: 'Longer explanation', // Optional
  tags: ['Category'], // Groups in Swagger UI
  auth: true, // Requires authentication
  bodySchema: zodSchema, // Request body (POST/PUT/PATCH)
  querySchema: zodSchema, // Query parameters
  paramsSchema: zodSchema, // Path parameters
  responseSchema: zodSchema, // Custom response (optional)
});
```

---

## 🎨 Supported Zod Types

The auto-generator handles all common Zod types:

### Strings

```javascript
z.string(); // → type: string
z.string().email(); // → type: string, format: email
z.string().url(); // → type: string, format: uri
z.string().uuid(); // → type: string, format: uuid
z.string().min(5).max(100); // → minLength: 5, maxLength: 100
```

### Numbers

```javascript
z.number(); // → type: number
z.number().int(); // → type: integer
z.number().min(0).max(100); // → minimum: 0, maximum: 100
```

### Booleans

```javascript
z.boolean(); // → type: boolean
```

### Enums

```javascript
z.enum(['active', 'inactive', 'pending']);
// → type: string, enum: ['active', 'inactive', 'pending']
```

### Objects

```javascript
z.object({
  name: z.string(),
  age: z.number(),
});
// → type: object with properties
```

### Arrays

```javascript
z.array(z.string()); // → type: array, items: { type: string }
```

### Optional/Nullable

```javascript
z.string().optional(); // → Not in required array
z.string().nullable(); // → nullable: true
```

### Defaults

```javascript
z.string().default('hello'); // → default: 'hello'
```

---

## 📋 Complete Example

Let's add a complete blog post API:

**1. Create Schemas** (`src/validators/schemas.js`):

```javascript
export const postSchemas = {
  create: z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    status: z.enum(['draft', 'published']).default('draft'),
    tags: z.array(z.string()).optional(),
  }),

  update: z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(1).optional(),
    status: z.enum(['draft', 'published']).optional(),
  }),

  params: z.object({
    id: z.string().uuid(),
  }),

  listQuery: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(['draft', 'published']).optional(),
    search: z.string().optional(),
  }),
};
```

**2. Add Routes** (`src/config/swagger.js`):

```javascript
import { postSchemas } from '../validators/schemas.js';

const autoRoutes = [
  // ... existing routes

  // Blog Posts
  getDoc('/posts', {
    summary: 'List blog posts',
    description: 'Get a paginated list of blog posts with optional filters',
    tags: ['Blog'],
    querySchema: postSchemas.listQuery,
    auth: false,
  }),

  postDoc('/posts', {
    summary: 'Create blog post',
    description: 'Create a new blog post',
    tags: ['Blog'],
    bodySchema: postSchemas.create,
    auth: true,
  }),

  getDoc('/posts/{id}', {
    summary: 'Get blog post',
    description: 'Retrieve a specific blog post by ID',
    tags: ['Blog'],
    paramsSchema: postSchemas.params,
    auth: false,
  }),

  patchDoc('/posts/{id}', {
    summary: 'Update blog post',
    description: 'Update an existing blog post',
    tags: ['Blog'],
    paramsSchema: postSchemas.params,
    bodySchema: postSchemas.update,
    auth: true,
  }),

  deleteDoc('/posts/{id}', {
    summary: 'Delete blog post',
    description: 'Delete a blog post',
    tags: ['Blog'],
    paramsSchema: postSchemas.params,
    auth: true,
  }),
];
```

**3. Done!**

All documentation is now available at `/api/v1/docs` with:

- ✅ All request/response schemas
- ✅ Field validation rules
- ✅ Required vs optional fields
- ✅ Default values
- ✅ Enum options
- ✅ Authentication requirements

---

## 🔍 Advantages

### ✅ DRY (Don't Repeat Yourself)

- Write schemas once for validation
- Documentation generated automatically
- No duplicate code

### ✅ Always Up-to-Date

- Docs match validation rules
- Change schema → docs update automatically
- No stale documentation

### ✅ Type-Safe

- Schemas enforce types
- Documentation reflects reality
- Fewer bugs

### ✅ Developer-Friendly

- Less boilerplate
- Focus on business logic
- Faster development

---

## 🎓 Advanced Usage

### Custom Response Schemas

```javascript
const customResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
    created: z.boolean(),
  }),
});

postDoc('/resource', {
  summary: 'Create resource',
  bodySchema: mySchema,
  responseSchema: customResponseSchema, // Custom response
  auth: true,
}),
```

### Multiple Tags

```javascript
getDoc('/endpoint', {
  summary: 'Get data',
  tags: ['Users', 'Admin', 'Reports'], // Multiple categories
  auth: true,
}),
```

---

## 🚨 Important Notes

1. **Define routes in `swagger.js`** - This is where auto-generation happens
2. **Use Zod schemas** - They're required for auto-generation
3. **Restart server** - Changes to `swagger.js` need a server restart
4. **Check console** - Errors in schemas will show in console

---

## 🆚 Comparison

### Old Way (Manual JSDoc)

```javascript
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Success
 */
// 25+ lines of JSDoc! 😫
```

### New Way (Auto-Generated)

```javascript
postDoc('/users', {
  summary: 'Create user',
  bodySchema: userSchemas.create, // That's it! 🎉
  auth: true,
});
// 4 lines, done! 🚀
```

---

**Documentation is now automatic!** Just define your Zod schemas and route configurations - the system handles the rest! 🎊
