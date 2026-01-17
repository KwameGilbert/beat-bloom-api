# Email & Token Services

## 📧 Email Configuration

Configure SMTP in `.env`:

```env
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password
EMAIL_FROM=noreply@example.com
APP_URL=http://localhost:3000
```

## Usage

```javascript
import { emailService } from '../services/EmailService.js';

// Send custom email
await emailService.send({
  to: 'user@example.com',
  subject: 'Hello',
  html: '<h1>Hello!</h1>',
});

// Built-in methods
await emailService.sendVerificationEmail(email, name, token);
await emailService.sendPasswordResetEmail(email, name, token);
await emailService.sendWelcomeEmail(email, name);
await emailService.sendPasswordChangedEmail(email, name);
```

---

## 🔐 Token Service

```javascript
import { tokenService } from '../services/TokenService.js';

// Verification token (24h expiry)
const { token } = await tokenService.createVerificationToken(userId);
const record = await tokenService.verifyVerificationToken(token);

// Password reset token (1h expiry)
const { token } = await tokenService.createPasswordResetToken(userId);
const record = await tokenService.verifyPasswordResetToken(token);

// JWT blacklist
await tokenService.blacklistToken(jwt, expiresAt);
const isBlacklisted = await tokenService.isBlacklisted(jwt);
```

---

## ✅ Email Verification Flow

1. **Register** → Verification email sent automatically
2. **Verify** → `GET /api/v1/auth/verify-email?token=xxx`
3. **Resend** → `POST /api/v1/auth/resend-verification`

### Require verified email:

```javascript
import { requireVerifiedEmail } from '../middlewares/auth.js';

router.post('/action', authenticate, requireVerifiedEmail, handler);
```

---

## 🔄 Password Reset Flow

1. **Request** → `POST /api/v1/auth/forgot-password` with `{ email }`
2. **Reset** → `POST /api/v1/auth/reset-password` with `{ token, password }`

---

## 🚫 Logout

`POST /api/v1/auth/logout` blacklists the JWT token.

---

## 📋 API Endpoints

| Endpoint                           | Description         |
| ---------------------------------- | ------------------- |
| `GET /auth/verify-email?token=xxx` | Verify email        |
| `POST /auth/resend-verification`   | Resend verification |
| `POST /auth/forgot-password`       | Request reset       |
| `POST /auth/reset-password`        | Reset password      |
| `POST /auth/logout`                | Logout & blacklist  |

---

## 🗄️ Database

Run migration:

```bash
pnpm run migrate
```

Creates: `tokens` and `token_blacklist` tables.
