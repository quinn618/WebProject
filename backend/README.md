# Ghassra Backend API

The backend API for Ghassra - a modern knowledge-sharing platform where students can upload, share, and trade educational documents and notes.

## 🚀 Quick Start

### Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache with mod_rewrite enabled (or equivalent server with URL rewriting)

### Installation

1. **Clone or download the project**

   ```bash
   cd backend
   ```

2. **Configure database connection**

   Edit `config/db.php` with your database credentials:

   ```php
   $host = 'localhost';     // Your DB host
   $db   = 'ghassra_core';  // Your DB name
   $user = 'root';          // Your DB user
   $pass = '';              // Your DB password
   ```

3. **Create the database**

   Import the database schema:

   ```bash
   mysql -u root -p ghassra_core < config/ghassra_core.sql
   ```

4. **Set file permissions**

   Ensure the `uploads/` directory is writable:

   ```bash
   chmod 755 uploads/
   ```

5. **Start your local server**
   ```bash
   php -S localhost:8000
   ```

## 📁 Project Structure

```
backend/
├── api/                          # API endpoints
│   ├── auth/                     # Authentication
│   │   ├── login.php            # User login
│   │   ├── logout.php           # User logout
│   │   └── register.php         # User registration
│   ├── documents/               # Document management
│   │   ├── list.php             # Get all documents
│   │   ├── detail.php           # Get single document
│   │   ├── upload.php           # Upload new document
│   │   ├── download.php         # Download document
│   │   └── delete.php           # Delete document
│   ├── payments/                # Payment operations
│   │   ├── initiate.php         # Initiate payment
│   │   └── verify.php           # Verify payment
│   ├── profile/                 # User profile
│   │   ├── get.php              # Get user profile
│   │   └── update.php           # Update user profile
│   └── purchases/               # Purchase history
│       └── history.php          # Get user purchases
├── config/                      # Configuration files
│   ├── db.php                   # Database connection
│   ├── cors.php                 # CORS headers
│   └── ghassra_core.sql         # Database schema
├── middleware/                  # Middleware functions
│   └── auth.php                 # JWT token verification
└── uploads/                     # Uploaded files storage
```

## 🔐 Authentication

The API uses JWT (JSON Web Token) authentication.

### Token Format

Tokens are base64-encoded JSON:

```json
{
  "user_id": 1,
  "exp": 1735689600
}
```

### Usage

Include the token in the `Authorization` header:

```
Authorization: Bearer {token_here}
```

Protected endpoints will verify the token and return a 401 error if:

- Token is missing
- Token is invalid
- Token has expired

## 📡 API Endpoints

### Authentication

| Method | Endpoint                 | Description       | Protected |
| ------ | ------------------------ | ----------------- | --------- |
| POST   | `/api/auth/register.php` | Register new user | ❌        |
| POST   | `/api/auth/login.php`    | Login user        | ❌        |
| POST   | `/api/auth/logout.php`   | Logout user       | ✅        |

### Documents

| Method | Endpoint                              | Description          | Protected |
| ------ | ------------------------------------- | -------------------- | --------- |
| GET    | `/api/documents/list.php`             | Get all documents    | ❌        |
| GET    | `/api/documents/detail.php?id={id}`   | Get document details | ❌        |
| POST   | `/api/documents/upload.php`           | Upload document      | ✅        |
| GET    | `/api/documents/download.php?id={id}` | Download document    | ❌        |
| DELETE | `/api/documents/delete.php?id={id}`   | Delete document      | ✅        |

### Payments

| Method | Endpoint                     | Description      | Protected |
| ------ | ---------------------------- | ---------------- | --------- |
| POST   | `/api/payments/initiate.php` | Initiate payment | ✅        |
| POST   | `/api/payments/verify.php`   | Verify payment   | ✅        |

### Profile

| Method | Endpoint                  | Description         | Protected |
| ------ | ------------------------- | ------------------- | --------- |
| GET    | `/api/profile/get.php`    | Get user profile    | ✅        |
| PUT    | `/api/profile/update.php` | Update user profile | ✅        |

### Purchases

| Method | Endpoint                     | Description          | Protected |
| ------ | ---------------------------- | -------------------- | --------- |
| GET    | `/api/purchases/history.php` | Get purchase history | ✅        |

## 📝 Example Requests

### User Registration

```bash
curl -X POST http://localhost:8000/api/auth/register.php \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword",
    "password_confirm": "securepassword",
    "institute_code": "ENSIAS2024"
  }'
```

### User Login

```bash
curl -X POST http://localhost:8000/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword"
  }'
```

### Upload Document

```bash
curl -X POST http://localhost:8000/api/documents/upload.php \
  -H "Authorization: Bearer {token}" \
  -F "file=@notes.pdf" \
  -F "title=Math Notes" \
  -F "filiere=Computer Science" \
  -F "matiere=Calculus"
```

## 💾 Database Schema

The database includes the following main tables:

- **users** - User accounts with authentication and profile data
- **documents** - Uploaded documents and notes
- **purchases** - Transaction records for purchased documents
- **aura_points** - Reputation system tracking

For detailed schema information, see `config/ghassra_core.sql`

## 🏆 Aura Points System

Users earn and lose points based on activities:

- **+10 points** - Upload a new document
- **+15 points** - Someone purchases your document
- **-5 points** - Delete your document

## 🔧 Configuration

### CORS Headers

CORS is configured in `config/cors.php` to allow:

- All origins (`*`)
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Content-Type, Authorization

Modify as needed for production security.

### Database

Edit `config/db.php` to change:

- Host, database name, username, password
- PDO attributes and error handling

## 🚨 Error Handling

The API returns consistent JSON responses:

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message in French or English"
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad request / validation error
- `401` - Unauthorized (missing/invalid token)
- `405` - Method not allowed
- `500` - Server error

## 📦 Dependencies

- **PDO** - Database abstraction (PHP built-in)
- **JSON** - Data serialization (PHP built-in)
- **File Upload** - Native PHP file handling

No external dependencies required!

## 🛡️ Security Considerations

- Always validate user input before database operations
- Use parameterized queries to prevent SQL injection
- Verify JWT tokens on protected endpoints
- Validate file uploads (type, size)
- Store passwords hashed (if implementing, not visible in current code)
- Use HTTPS in production
- Implement rate limiting for login attempts
- Set strong CORS policies in production

## 🐛 Troubleshooting

### Database Connection Error

- Check MySQL is running
- Verify credentials in `config/db.php`
- Ensure database `ghassra_core` exists

### CORS Errors

- Check `config/cors.php` headers are set correctly
- Ensure frontend URL is allowed
- Test with `curl` to isolate backend issues

### File Upload Issues

- Check `uploads/` directory exists and is writable
- Verify file size limits in PHP configuration
- Check file type validations in `documents/upload.php`

### Token Errors

- Ensure `Authorization` header format is correct: `Bearer {token}`
- Check token hasn't expired
- Verify token is properly base64-encoded JSON

## 📞 Support

For issues or questions, please refer to the main project README or contact the development team.

## 📄 License

This project is part of Ghassra - Knowledge Sharing Platform
