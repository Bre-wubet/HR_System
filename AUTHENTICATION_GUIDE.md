# Authentication & Authorization System

This document provides a comprehensive guide to the authentication and authorization system implemented in the HR System.

## 🏗️ Architecture Overview

The system implements a JWT-based authentication with Role-Based Access Control (RBAC) following a microservice-ready architecture:

```
Frontend → API Gateway → Auth Middleware → Target Service
```

### Key Components

1. **Auth Service**: Handles user authentication, JWT token management, and user management
2. **RBAC System**: Role-based permissions for fine-grained access control
3. **API Gateway**: Request routing, authentication, and service management
4. **Auth Middleware**: Token verification and permission checking

## 🔐 Authentication Flow

### 1. User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "employeeId": "optional-employee-id"
}
```

### 2. User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": [...],
      "permissions": [...]
    },
    "accessToken": "jwt-access-token",
    "expiresIn": "15m"
  },
  "message": "Login successful"
}
```

### 3. Token Refresh
```http
POST /api/auth/refresh-token
Cookie: refreshToken=refresh-token-value
```

## 🛡️ Authorization System

### Roles and Permissions

#### Default Roles
- **super_admin**: Full system access
- **hr_admin**: Complete HR management access
- **hr_manager**: HR management with limited permissions
- **hr_employee**: Basic HR access
- **employee**: Limited access to own data

#### Permission Structure
Permissions follow the pattern: `resource:action`

**Employee Permissions:**
- `employee:create` - Create new employees
- `employee:read` - View employee data
- `employee:update` - Update employee information
- `employee:delete` - Delete employees

**Recruitment Permissions:**
- `recruitment:create` - Create job postings
- `recruitment:read` - View recruitment data
- `recruitment:update` - Update recruitment information
- `recruitment:delete` - Delete recruitment data

**Attendance Permissions:**
- `attendance:create` - Create attendance records
- `attendance:read` - View attendance data
- `attendance:update` - Update attendance records
- `attendance:delete` - Delete attendance data

**Admin Permissions:**
- `admin:manage_users` - Manage users and roles
- `admin:manage_system` - System administration

### Using Authentication in Requests

#### 1. Include Access Token
```http
GET /api/hr/employees
Authorization: Bearer your-jwt-access-token
```

#### 2. Automatic Permission Checking
The system automatically checks permissions based on the route configuration:

```javascript
// Example: Employee routes with permissions
router.get("/", requirePermission("employee:read"), controller.listEmployees);
router.post("/", requirePermission("employee:create"), controller.createEmployee);
router.put("/:id", requireAnyPermission(["employee:update"]), requireEmployeeAccess(), controller.updateEmployeeById);
```

## 🔧 Middleware Functions

### Authentication Middleware

#### `authenticateToken`
Verifies JWT tokens and attaches user data to the request:
```javascript
router.use(authenticateToken);
```

#### `requirePermission(permissionName)`
Ensures user has specific permission:
```javascript
router.get("/employees", requirePermission("employee:read"), controller.listEmployees);
```

#### `requireAnyPermission([permission1, permission2])`
Ensures user has at least one of the specified permissions:
```javascript
router.put("/:id", requireAnyPermission(["employee:update", "hr:manage"]), controller.updateEmployee);
```

#### `requireAllPermissions([permission1, permission2])`
Ensures user has all specified permissions:
```javascript
router.delete("/:id", requireAllPermissions(["employee:delete", "hr:approve"]), controller.deleteEmployee);
```

#### `requireRole(roleName)`
Ensures user has specific role:
```javascript
router.get("/admin", requireRole("super_admin"), controller.adminPanel);
```

#### `requireEmployeeAccess()`
Special middleware for employee data access - allows access to own data or with HR permissions:
```javascript
router.get("/:id", requireEmployeeAccess(), controller.getEmployeeById);
```

## 🚀 API Gateway Features

### Service Configuration
```javascript
const serviceConfig = {
  auth: {
    prefix: '/api/auth',
    version: '1.0.0',
    cors: { /* CORS settings */ }
  },
  hr: {
    prefix: '/api/hr',
    version: '1.0.0',
    cors: { /* CORS settings */ }
  }
};
```

### Rate Limiting
- Default: 100 requests per 15 minutes per IP/user
- Auth endpoints: 20 requests per 5 minutes
- HR endpoints: 200 requests per 15 minutes

### CORS Configuration
Service-specific CORS settings with support for:
- Multiple allowed origins
- Credential handling
- Custom headers

## 📊 Database Schema

### User Model
```prisma
model User {
  id                String   @id @default(uuid())
  email             String   @unique
  password          String
  firstName         String
  lastName          String
  isActive          Boolean  @default(true)
  emailVerified     Boolean  @default(false)
  lastLoginAt       DateTime?
  passwordChangedAt DateTime @default(now())
  employee          Employee? @relation(fields: [employeeId], references: [id])
  employeeId        String?  @unique
  roles             UserRole[]
  refreshTokens     RefreshToken[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### Role and Permission Models
```prisma
model Role {
  id          String      @id @default(uuid())
  name        String      @unique
  description String?
  permissions RolePermission[]
  users       UserRole[]
}

model Permission {
  id          String          @id @default(uuid())
  name        String          @unique
  description String?
  resource    String          // e.g., 'employee', 'recruitment'
  action      String          // e.g., 'create', 'read', 'update', 'delete'
  roles       RolePermission[]
}
```

## 🛠️ Setup and Configuration

### 1. Environment Variables
```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hr_system

# Node Environment
NODE_ENV=development
```

### 2. Database Migration
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed default roles and permissions
npm run db:seed
```

### 3. Default Users
After seeding, the following users are created:
- **Super Admin**: `admin@company.com` / `admin123`
- **HR Admin**: `hr@company.com` / `admin123`

⚠️ **Important**: Change these passwords after first login!

## 🔍 API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/logout-all` - Logout from all devices
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/roles-permissions` - Get user roles and permissions

### Admin Endpoints (Require admin permissions)
- `POST /api/auth/assign-role` - Assign role to user
- `POST /api/auth/remove-role` - Remove role from user
- `POST /api/auth/create-default-roles` - Create default roles and permissions
- `POST /api/auth/clean-expired-tokens` - Clean expired refresh tokens

### Service Endpoints (For other services)
- `POST /api/auth/verify-token` - Verify JWT token
- `POST /api/auth/check-permission` - Check user permission

## 🔒 Security Features

### Password Security
- Bcrypt hashing with salt rounds of 12
- Password change forces re-login on all devices
- Password history tracking

### Token Security
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- Automatic token cleanup
- HttpOnly cookies for refresh tokens

### Rate Limiting
- IP-based and user-based rate limiting
- Service-specific rate limits
- Automatic cleanup of old rate limit data

### CORS Protection
- Service-specific CORS configuration
- Credential handling
- Origin validation

## 🧪 Testing the System

### 1. Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@company.com",
    "password": "testPassword123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@company.com",
    "password": "testPassword123"
  }'
```

### 3. Access Protected Resource
```bash
curl -X GET http://localhost:3000/api/hr/employees \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🚀 Future Enhancements

### Microservice Architecture
The system is designed to support microservice architecture:
- Service discovery
- Request forwarding
- Service-specific configurations
- Independent scaling

### Advanced Features
- Multi-factor authentication (MFA)
- OAuth2 integration
- API key management
- Audit logging
- Session management

### Monitoring and Analytics
- Authentication metrics
- Permission usage analytics
- Security event logging
- Performance monitoring

## 📝 Best Practices

### For Developers
1. Always use the provided middleware functions
2. Follow the permission naming convention: `resource:action`
3. Use `requireEmployeeAccess()` for employee data endpoints
4. Implement proper error handling
5. Log security events

### For Administrators
1. Regularly rotate JWT secrets
2. Monitor authentication logs
3. Review and update permissions regularly
4. Use strong passwords for admin accounts
5. Enable audit logging in production

### For Security
1. Use HTTPS in production
2. Implement proper CORS policies
3. Regular security audits
4. Monitor for suspicious activities
5. Keep dependencies updated

## 🆘 Troubleshooting

### Common Issues

#### 1. "Invalid or expired token"
- Check if the access token is included in the Authorization header
- Verify the token hasn't expired
- Ensure the JWT_SECRET is correct

#### 2. "Permission denied"
- Check if the user has the required permission
- Verify the permission name is correct
- Ensure the user's role has the permission assigned

#### 3. "User not found or inactive"
- Check if the user exists in the database
- Verify the user's `isActive` status
- Ensure the user-employee relationship is correct

#### 4. Database connection issues
- Verify DATABASE_URL is correct
- Check if the database is running
- Ensure Prisma client is generated

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
LOG_LEVEL=debug
```

This will provide detailed authentication and authorization logs.

## 📞 Support

For issues or questions regarding the authentication system:
1. Check the logs for detailed error messages
2. Verify the configuration matches this documentation
3. Test with the provided curl examples
4. Review the database schema and seed data

---

**Last Updated**: January 2025
**Version**: 1.0.0
