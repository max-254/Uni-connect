# Authentication API Documentation

## Overview

This document provides detailed information about the authentication API endpoints, request/response formats, and security features.

## Base URL

```
https://your-api-domain.com/api/auth
```

## Endpoints

### User Registration

**Endpoint:** `POST /auth/register`

**Description:** Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd123",
  "name": "John Doe",
  "preferredLanguage": "en"
}
```

**Required Fields:**
- `email`: Valid email format
- `password`: Minimum 12 characters, must include uppercase, lowercase, number, and special character

**Optional Fields:**
- `name`: User's full name (2-100 characters)
- `preferredLanguage`: Preferred language code (en, es, fr)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `409 Conflict`: Email already exists
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

### Email Verification

**Endpoint:** `GET /auth/verify-email/:token`

**Description:** Verify user email address with token.

**URL Parameters:**
- `token`: 64-character verification token

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email verification successful. You can now log in."
}
```

**Error Responses:**
- `400 Bad Request`: Invalid or expired token
- `500 Internal Server Error`: Server error

---

### User Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and create session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd123",
  "rememberMe": false
}
```

**Required Fields:**
- `email`: User's email address
- `password`: User's password

**Optional Fields:**
- `rememberMe`: Boolean to extend session duration (default: false)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "csrfToken": "f8e1c4a2d3b5e6f7c8a9b0c1d2e3f4a5"
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Email not verified
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

**Security Notes:**
- Session cookie is set as HTTP-only, secure, and SameSite=Strict
- CSRF token is returned for use in subsequent requests
- Rate limited to 5 attempts per IP per minute

---

### User Logout

**Endpoint:** `POST /auth/logout`

**Description:** End user session and clear cookies.

**Headers:**
- `X-CSRF-Token`: CSRF token from login response

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Invalid CSRF token
- `500 Internal Server Error`: Server error

---

### Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Description:** Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Required Fields:**
- `email`: User's email address

**Response (200 OK):**
```json
{
  "success": true,
  "message": "If your email is registered, you will receive a password reset link shortly."
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

**Security Notes:**
- Response is the same whether email exists or not to prevent email enumeration
- Rate limited to 3 requests per email per hour

---

### Reset Password

**Endpoint:** `POST /auth/reset-password`

**Description:** Reset user password with token.

**Request Body:**
```json
{
  "token": "f8e1c4a2d3b5e6f7c8a9b0c1d2e3f4a5...",
  "password": "NewSecureP@ssw0rd123"
}
```

**Required Fields:**
- `token`: 128-character reset token
- `password`: New password (must meet security requirements)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

**Error Responses:**
- `400 Bad Request`: Invalid token or password requirements not met
- `500 Internal Server Error`: Server error

**Security Notes:**
- Token is validated for format and expiration
- All active sessions are invalidated after password reset
- Used token is immediately deleted

---

### Get Current User

**Endpoint:** `GET /auth/me`

**Description:** Get current authenticated user information.

**Headers:**
- `Cookie`: Session cookie (set during login)

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

## Security Features

### Password Security
- Passwords are hashed using Argon2id with the following parameters:
  - Memory: 64MB
  - Iterations: 3
  - Parallelism: 4
- Unique salt per password (16 bytes minimum)
- Password requirements:
  - Minimum 12 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

### Session Management
- HTTP-only, secure cookies with SameSite=Strict
- CSRF token protection for all state-changing operations
- Default session timeout: 2 hours
- Extended session (remember me): 30 days
- Sessions stored in Redis with appropriate TTL

### Rate Limiting
- Global rate limit: 100 requests per IP per 15 minutes
- Login: 5 attempts per IP per minute
- Registration: 10 attempts per IP per hour
- Forgot password: 3 requests per email per hour

### Security Headers
- Content-Security-Policy
- Strict-Transport-Security
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy
- Feature-Policy/Permissions-Policy

### Audit Logging
- All authentication events are logged
- Logs include timestamp, user ID, IP address, and user agent
- Failed authentication attempts are tracked

### GDPR Compliance
- User data export functionality
- Account deletion with data anonymization
- Consent management
- Data minimization principles applied

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "param": "email",
      "msg": "Invalid email format"
    }
  ]
}
```

The `errors` array is only included for validation errors.