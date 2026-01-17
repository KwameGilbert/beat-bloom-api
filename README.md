# Express Backend Template

A **production-ready** Express.js backend template with authentication, email verification, file uploads, and auto-generated API documentation.

---

## ✨ Features

| Category     | Features                                                                    |
| ------------ | --------------------------------------------------------------------------- |
| **Auth**     | JWT, refresh tokens, email verification, password reset, token blacklisting |
| **Database** | PostgreSQL/MySQL, Knex migrations, BaseModel with CRUD                      |
| **Email**    | SMTP-based email service with templates                                     |
| **Uploads**  | Local or Cloudinary, group-based organization                               |
| **API Docs** | Auto-generated Swagger from Zod schemas                                     |
| **Security** | Helmet, CORS, rate limiting, password hashing                               |
| **Logging**  | Pino (console + file), request logging                                      |
| **Jobs**     | Cron scheduler for background tasks                                         |
| **Docker**   | Dockerfile + docker-compose ready                                           |

---

## 🚀 Quick Start

```bash
# Clone and install
git clone <repo-url>
cd express-backend-template
pnpm install

# Configure
cp .env.example .env
# Edit .env with your settings

# Run
pnpm run dev
```

**Access:**

- API: http://localhost:3000
- Docs: http://localhost:3000/api/v1/docs

---

## 📁 Structure

```
src/
├── config/         # Configuration (db, env, logger, swagger, upload)
├── controllers/    # Route handlers
├── database/       # Migrations and seeds
├── middlewares/    # Auth, validation, rate limiting, uploads
├── models/         # BaseModel + data models
├── routes/         # API routes
├── services/       # Business logic (Auth, Email, Token, Upload, User)
├── utils/          # Helpers, errors, response formatters
├── validators/     # Zod schemas
├── cron/           # Scheduled jobs
├── app.js          # Express setup
└── server.js       # Entry point
```

---

## 🔐 Authentication

### Endpoints

| Method | Endpoint                    | Auth | Description                   |
| ------ | --------------------------- | ---- | ----------------------------- |
| POST   | `/auth/register`            | No   | Register + verification email |
| POST   | `/auth/login`               | No   | Login                         |
| POST   | `/auth/logout`              | Yes  | Logout + blacklist token      |
| POST   | `/auth/refresh`             | No   | Refresh access token          |
| GET    | `/auth/me`                  | Yes  | Get profile                   |
| PATCH  | `/auth/me`                  | Yes  | Update profile                |
| POST   | `/auth/change-password`     | Yes  | Change password               |
| GET    | `/auth/verify-email`        | No   | Verify email (token in query) |
| POST   | `/auth/resend-verification` | No   | Resend verification email     |
| POST   | `/auth/forgot-password`     | No   | Request password reset        |
| POST   | `/auth/reset-password`      | No   | Reset password with token     |

### Configuration

```env
JWT_SECRET=your-secret-at-least-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d
```

---

## 📧 Email

SMTP-based email service with built-in templates.

### Configuration

```env
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password
EMAIL_FROM=noreply@example.com
```

### Usage

```javascript
import { emailService } from './services/EmailService.js';

await emailService.send({ to, subject, html });
await emailService.sendVerificationEmail(to, name, token);
await emailService.sendPasswordResetEmail(to, name, token);
```

---

## 📁 File Uploads

Supports local storage or Cloudinary with group-based organization.

### Configuration

```env
UPLOAD_STRATEGY=local
UPLOAD_LOCAL_PATH=uploads

# Or for Cloudinary
UPLOAD_STRATEGY=cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

### Usage

```javascript
import upload from './middlewares/upload.js';
import { upload as uploadFile } from './services/UploadService.js';

router.post('/image', upload('products').single('file'), async (req, res) => {
  const result = await uploadFile(req.file, 'products');
  // → uploads/products/123456-abc.jpg
  res.json(result);
});
```

### Add Upload Groups

Edit `src/config/upload.js`:

```javascript
export const uploadGroups = {
  products: { types: ALLOWED_TYPES.image, maxSize: 10 * 1024 * 1024 },
  documents: { types: ALLOWED_TYPES.document, maxSize: 20 * 1024 * 1024 },
};
```

---

## 📊 Database

### Configuration

```env
DB_CLIENT=pg          # or mysql2
DB_HOST=localhost
DB_PORT=5432
DB_NAME=app_db
DB_USER=postgres
DB_PASSWORD=password
```

### Commands

```bash
pnpm run migrate              # Run migrations
pnpm run migrate:make <name>  # Create migration
pnpm run migrate:rollback     # Rollback
pnpm run seed                 # Run seeds
pnpm run db:reset             # Reset database
```

### BaseModel

```javascript
import { BaseModel } from './models/BaseModel.js';

class ProductModel extends BaseModel {
  constructor() {
    super('products', {
      timestamps: true,
      softDeletes: true,
      searchableFields: ['name', 'description'],
    });
  }
}

// Usage
await ProductModel.create({ name: 'Widget' });
await ProductModel.findAll({ page: 1, limit: 10, search: 'widget' });
await ProductModel.findById(id);
await ProductModel.update(id, { name: 'New Name' });
await ProductModel.delete(id);
```

---

## 📝 API Documentation

Auto-generated from Zod schemas. Access at `/api/v1/docs`.

### Add Routes to Docs

Edit `src/config/swagger.js`:

```javascript
import { postDoc, getDoc } from '../utils/routeDoc.js';

const autoRoutes = [
  postDoc('/products', {
    summary: 'Create product',
    tags: ['Products'],
    bodySchema: productSchemas.create,
    auth: true,
  }),
];
```

---

## ✅ Validation

Using Zod:

```javascript
// src/validators/schemas.js
export const productSchemas = {
  create: z.object({
    name: z.string().min(1),
    price: z.number().positive(),
  }),
};

// In routes
import { validateBody } from './middlewares/validate.js';
router.post('/products', validateBody(productSchemas.create), handler);
```

---

## ⏰ Cron Jobs

```javascript
// src/cron/index.js
import { registerJob } from './index.js';

registerJob('daily-cleanup', '0 0 * * *', async () => {
  // Runs daily at midnight
});
```

---

## 🐳 Docker

```bash
# Development
docker-compose up -d

# Production build
docker build -t express-backend .
docker run -p 3000:3000 --env-file .env express-backend
```

---

## 📜 Scripts

| Script         | Description                 |
| -------------- | --------------------------- |
| `pnpm dev`     | Development with hot reload |
| `pnpm start`   | Production                  |
| `pnpm test`    | Run tests                   |
| `pnpm lint`    | ESLint                      |
| `pnpm format`  | Prettier                    |
| `pnpm migrate` | Run migrations              |
| `pnpm seed`    | Run seeds                   |

---

## 🔒 Security

- **Helmet** - Security headers
- **CORS** - Configurable origins
- **Rate Limiting** - Per route/user
- **Password Hashing** - bcrypt (configurable)
- **JWT Blacklisting** - Proper logout
- **Input Validation** - Zod schemas

---

## 📚 Documentation

| File                        | Description            |
| --------------------------- | ---------------------- |
| `docs/EMAIL_TOKENS.md`      | Email & token services |
| `docs/UPLOAD_SERVICE.md`    | File upload guide      |
| `docs/API_DOCUMENTATION.md` | Auto-docs setup        |
| `README_DATABASE.md`        | Database configuration |

---

## 🛠️ Add a Feature

1. **Model** → `src/models/FeatureModel.js`
2. **Service** → `src/services/FeatureService.js`
3. **Controller** → `src/controllers/FeatureController.js`
4. **Routes** → `src/routes/featureRoutes.js`
5. **Schema** → `src/validators/schemas.js`
6. **Register** → `src/routes/index.js`
7. **Docs** → `src/config/swagger.js`

---

## 📄 License

MIT

---

**Happy Coding!** 🚀
