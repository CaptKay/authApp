# 🚀 AuthApp Server (MERN Learning Project)

This is the **server-side** of a learning project that implements a production-style authentication and authorization system using **Node.js, Express, MongoDB, and JWTs**. It includes password security, email flows, 2FA, roles & permissions, audit logs, and RBAC-protected routes.

---

## 📂 Project Structure

server/
└─ src/
├─ auth/
│  ├─ middleware.js        # requireAuth, requirePermission, etc.
│  ├─ tokens.js            # sign/verify access & refresh tokens
│  └─ home.js              # role→department landing helper
├─ db/
│  └─ connection.js        # Mongo connection
├─ models/
│  ├─ Permission.js
│  ├─ Role.js
│  └─ User.js
├─ routes/
│  ├─ auth.routes.js       # register, login, logout, refresh, 2FA, etc.
│  ├─ profile.routes.js    # profile CRUD, /me endpoint
│  ├─ accounts.routes.js   # accounts department (invoices)
│  ├─ sales.routes.js      # sales department (orders)
│  └─ admin.routes.js      # admin-only endpoints
├─ scripts/
│  ├─ seed-roles.js        # seed roles & permissions
│  └─ seed-users.js        # seed demo users per role
├─ utils/
│  ├─ audit.js             # audit log helper
│  ├─ backupCodes.js       # generate/hash/verify 2FA backup codes
│  ├─ cookies.js           # refresh token cookies
│  ├─ hash.js              # bcrypt password hashing/verification
│  └─ oneTimeTokens.js     # random tokens for email/forgot flows
├─ index.js                # app entrypoint (middleware, route mounting)
└─ ...

---

## 🔑 Features Implemented

### Authentication
- User registration with **hashed passwords** (`bcrypt`).
- Email verification (token + link).
- Login with password → issue **JWT access & refresh tokens**.
- Refresh token rotation (stored in DB + HTTP-only cookies).
- Logout (revoke refresh token).
- Forgot/reset password flow with hashed one-time tokens.
- 2FA (TOTP using authenticator apps).
- 2FA backup codes (hashed, one-time use).

### Authorization
- Role-based access control (RBAC) with MongoDB `Role` + `Permission` models.
- Roles: `admin`, `accounts`, `sales`, `user`.
- Access token includes `roleNames` + `permissions`.
- `requireAuth` and `requirePermission` middleware protect routes.
- Landing path per role after login (`/admin`, `/accounts`, `/sales`, `/profile`).

### Security & UX
- **bcrypt** for passwords & backup codes.
- **JWT** for stateless access tokens.
- **HTTP-only cookies** for refresh tokens.
- **Rate limiting** (login & forgot-password).
- **Audit logs**: login success/fail, password resets, email verification, 2FA actions.
- **Helmet** & **CORS** configured.
- **Morgan** for request logging.

---

## 👥 Roles & Permissions

Seeded via `scripts/seed-roles.js`:

- **Admin** → all permissions (`users:manage`, `orders:*`, `invoices:*`, `profile:*`)
- **Accounts** → `invoices:read/create/update`, `profile:read/update`
- **Sales** → `orders:read/create/update`, `profile:read/update`
- **User** → `profile:read/update`

---

## 🛠️ Seeding Demo Users

Run: node src/scripts/seed-users.js

Creates four verified users with roles:

| Role     | Email                                               | Password     |
| -------- | --------------------------------------------------- | ------------ |
| Admin    | [admin@example.com](mailto:admin@example.com)       | Admin123!    |
| Accounts | [accounts@example.com](mailto:accounts@example.com) | Accounts123! |
| Sales    | [sales@example.com](mailto:sales@example.com)       | Sales123!    |
| User     | [user@example.com](mailto:user@example.com)         | User123!     |

---

## 🔒 Protected Routes

* `/api/profile` → profile read/update (all roles)
* `/api/accounts/invoices` → only **accounts** + admin
* `/api/sales/orders` → only **sales** + admin
* `/api/admin/users` → only **admin**

---

## 📡 API Highlights

* **POST** `/api/auth/register`
* **POST** `/api/auth/login` → returns `{ accessToken, nextPath, user }`
* **POST** `/api/auth/refresh` → new access token
* **POST** `/api/auth/logout`
* **POST** `/api/auth/forgot-password`
* **POST** `/api/auth/reset-password`
* **POST** `/api/auth/2fa/setup` / `/enable` / `/disable`
* **POST** `/api/auth/2fa/backup/regenerate`
* **GET** `/api/profile/me` → current user info + `nextPath`

---

## 🧪 Testing

1. Seed roles & users:

   ```bash
   node src/scripts/seed-roles.js
   node src/scripts/seed-users.js
   ```
2. Login via Postman with any of the demo users.
3. Copy the `accessToken` → test protected routes with Bearer token.
4. Verify RBAC works:

   * Normal `user` blocked from `/accounts` and `/sales`.
   * `accounts` role only sees `/accounts`.
   * `sales` role only sees `/sales`.
   * `admin` can access everything.

---

## 🚀 Running

```bash
npm install
npm run dev        # or node src/index.js
```

Make sure `.env` includes:

```
PORT=8000
MONGODB_URI=mongodb://localhost:27017/authapp
JWT_SECRET=supersecretlongrandomstring
REFRESH_SECRET=anotherlongrandomstring
CLIENT_BASE_URL=http://localhost:5173
```

---

## ⚠️ Production Notes

* Replace Ethereal with a real mail provider (SendGrid, SES, etc.).
* Always use HTTPS in prod (cookies require `secure: true`).
* Fine-tune rate limits per environment.
* Rotate JWT secrets periodically.
* Encrypt refresh tokens or use opaque random IDs instead.
* Backup codes must be treated like passwords (store only hashes).
* Ensure CORS origin whitelist matches your deployed frontend.