# Ghassra Core - Knowledge Sharing Platform

A modern web application where students can upload, share, and trade educational notes and documents. Built with PHP, MySQL, and vanilla JavaScript.

## Features

✨ **User System**

- User registration and authentication with JWT tokens
- Profile management with aura points (reputation system)
- Student institute tracking

📚 **Document Management**

- Upload PDF notes and documents
- Organize by filiere (major) and matiere (subject)
- Public document discovery and search
- Free and paid document support

💰 **Marketplace**

- Buy and sell educational documents
- Track sales and purchases
- Demo payment gateway (ready for integration)

🏆 **Aura Points System**

- Earn +10 points for uploading documents
- Earn +15 points when someone buys your document
- Lose -5 points when deleting documents
- Build reputation on the platform

📊 **Statistics & Analytics**

- Track documents uploaded
- Monitor sales count
- View purchase history
- Real-time stats on user profile

## Tech Stack

**Backend:**

- PHP 8.2
- MySQL / MariaDB
- PDO (PHP Data Objects)

**Frontend:**

- Vanilla JavaScript (ES6+)
- HTML5
- CSS3 with custom variables

**Server:**

- Apache 2.4
- XAMPP local development

## Prerequisites

Before you begin, ensure you have:

- **XAMPP** (Apache + MySQL + PHP) - [Download here](https://www.apachefriends.org/)
- **Git** (for version control)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd Ghassra
```

### Step 2: Install XAMPP

1. Download XAMPP from [apachefriends.org](https://www.apachefriends.org/)
2. Install to default location: `C:\xampp`
3. Complete the installation

### Step 3: Copy Project to XAMPP

Copy the `Ghassra` folder to XAMPP's htdocs directory:

**Option A (using File Explorer):**

- Copy `C:\web dev\Ghassra`
- Paste into `C:\xampp\htdocs\`

**Option B (using Command Line):**

```bash
# Using PowerShell
Copy-Item -Path "C:\web dev\Ghassra" -Destination "C:\xampp\htdocs\Ghassra" -Recurse
```

**Option C (using lowercase path):**

```bash
# Alternative path (if needed)
cp -r Ghassra C:\xampp\htdocs\ghassra
```

### Step 4: Start XAMPP Services

1. Open **XAMPP Control Panel**
2. Click **Start** next to Apache
3. Click **Start** next to MySQL
4. Both should show green status

### Step 5: Create Database

1. Open your browser and go to: `http://localhost/phpmyadmin`
2. Click **New** (or **+** icon)
3. Create database named: `ghassra_core`
4. Click **Create**

### Step 6: Import Database Schema

1. In phpMyAdmin, click on `ghassra_core` database
2. Go to **Import** tab
3. Click **Choose File**
4. Select: `backend/config/BD.sql` (or `ghassra_core.sql`)
5. Click **Import**

### Step 7: Open the Application

In your browser, navigate to:

```
http://localhost/Ghassra/frontend/final_frontend_style/pages/index.html
```

**Or use lowercase variant:**

```
http://localhost/ghassra/frontend/final_frontend_style/pages/index.html
```

## Project Structure

```
Ghassra/
├── backend/
│   ├── api/
│   │   ├── auth/              # Authentication endpoints
│   │   │   ├── login.php
│   │   │   ├── logout.php
│   │   │   └── register.php
│   │   ├── documents/         # Document management
│   │   │   ├── list.php
│   │   │   ├── detail.php
│   │   │   ├── upload.php
│   │   │   ├── download.php
│   │   │   └── delete.php
│   │   ├── profile/           # User profile
│   │   │   ├── get.php
│   │   │   └── update.php
│   │   ├── payments/          # Payment processing
│   │   │   ├── initiate.php
│   │   │   └── verify.php
│   │   └── purchases/         # Purchase history
│   │       └── history.php
│   ├── config/
│   │   ├── db.php             # Database configuration
│   │   ├── cors.php           # CORS headers
│   │   └── BD.sql             # Database schema
│   ├── middleware/
│   │   └── auth.php           # Token verification
│   └── uploads/               # Uploaded PDF documents
│
├── frontend/
│   └── final_frontend_style/
│       ├── api/               # JavaScript API modules
│       │   ├── config.js
│       │   ├── auth.api.js
│       │   ├── documents.api.js
│       │   ├── payments.api.js
│       │   ├── profile.api.js
│       │   └── purchases.api.js
│       ├── assets/
│       │   ├── css/           # Stylesheets
│       │   ├── images/        # Static images
│       │   └── js/            # Page scripts
│       │       ├── auth_js.js
│       │       ├── main_js.js
│       │       ├── notes.js
│       │       ├── profile.js
│       │       ├── shared.js
│       │       └── downloads.js
│       └── pages/             # HTML pages
│           ├── index.html
│           ├── auth.html
│           ├── main.html
│           ├── notes.html
│           ├── profile.html
│           ├── downloads.html
│           ├── earnings.html
│           └── support.html
│
└── README.md
```

## Getting Started

### Create Your First Account

1. Navigate to the **Index** page (linked above)
2. Click **Sign Up** or go to `auth.html`
3. Fill in:
   - Full Name
   - Email address
   - Password (min 6 chars, must include uppercase, number, special char)
   - Institute Code
4. Click **Register**
5. You'll be redirected to login

### Login

1. Enter your email and password
2. Click **Login**
3. You're now logged in and can access all features

### Upload a Document

1. Go to **Profile** page → **Upload New Note**
2. Fill in the form:
   - **Note Title:** e.g., "Statistics Exam Prep"
   - **Year Level:** Select your year (e.g., 2nd Year)
   - **Subject:** e.g., Math
   - **Description:** Brief description of content
   - **Price:** Leave at 0 for free, or set a price in TND
3. Click **Click to Upload** and select a PDF file
4. Click **Submit**
5. ✅ Document uploaded! Check your profile for aura +10 points

### View All Documents (Resources)

1. Click **Resources** in the navigation
2. Browse all uploaded documents by students
3. Search by title or description
4. Filter by subject/filiere
5. Click **Download** for free documents
6. Click **Buy** for paid documents

### View Your Notes

1. Click **My Notes** in the sidebar
2. See all documents you've uploaded
3. Delete notes (aura -5 points)
4. Download your own documents

### Check Your Profile

1. Click **Profile** in the sidebar
2. View your stats:
   - **Aura Points** (reputation)
   - **Notes Uploaded**
   - **Total Sold** (documents other users bought from you)
   - **Total Purchased** (documents you bought)
3. Update your profile information
4. Change your password

## API Endpoints

### Authentication

- `POST /api/auth/register.php` - Create new account
- `POST /api/auth/login.php` - Login user
- `GET /api/auth/logout.php` - Logout user

### Documents

- `GET /api/documents/list.php` - Get all documents
- `GET /api/documents/detail.php?id=X` - Get document details
- `POST /api/documents/upload.php` - Upload new document
- `GET /api/documents/download.php?id=X` - Download document
- `POST /api/documents/delete.php` - Delete own document

### Profile

- `GET /api/profile/get.php` - Get current user profile
- `POST /api/profile/update.php` - Update profile info

### Payments

- `POST /api/payments/initiate.php` - Start purchase
- `POST /api/payments/verify.php` - Confirm payment (demo)

### Purchases

- `GET /api/purchases/history.php` - Get purchase history

## Database Schema

### Users Table (`utilisateurs`)

- `id` - User ID (auto-increment)
- `nom` - Full name
- `email` - Email address (unique)
- `mot_de_passe` - Hashed password
- `code_institut` - Institute code
- `aura_points` - Reputation score (0 by default)
- `sold_count` - Number of documents sold (0 by default)
- `solde_portefeuille` - Wallet balance
- `date_inscription` - Registration date
- `est_actif` - Active status (1/0)

### Documents Table (`documents`)

- `id` - Document ID
- `titre` - Document title
- `description` - Document description
- `chemin_fichier` - File path (e.g., `uploads/doc_xxx.pdf`)
- `prix` - Price in TND
- `utilisateur_id` - Owner user ID
- `matiere_id` - Subject ID
- `statut` - Status (`valide`, `supprime`)
- `type_fichier` - MIME type
- `taille_fichier` - File size in bytes
- `date_upload` - Upload timestamp

### Transactions Table (`transactions`)

- `id` - Transaction ID
- `utilisateur_id` - Buyer user ID
- `document_id` - Document purchased
- `montant` - Amount paid
- `type` - Transaction type (`achat`)
- `statut` - Status (`en_attente`, `complete`, `cancelled`)
- `date_transaction` - Transaction date

## Aura Points System

**How to Earn Aura:**

- ⬆️ **+10 points** - Upload a new document
- ⬆️ **+15 points** - Someone buys your document
- **Bonus:** Daily login streaks, community engagement (future)

**How to Lose Aura:**

- ⬇️ **-5 points** - Delete your own document
- ⬇️ **Penalty:** Spam/inappropriate content removal (future)

**Level Progression (Future):**

- Aura 0-50: Newbie
- Aura 51-200: Active Contributor
- Aura 201-500: Expert
- Aura 500+: Elite Scholar

## Features to Come

- 🔔 Notifications system
- ⭐ User ratings and reviews
- 💬 Comments on documents
- 🏅 Achievement badges
- 📱 Mobile app
- 🌐 Real payment gateway integration
- 📈 Advanced analytics dashboard
- 🔍 AI-powered search and recommendations

## Troubleshooting

### "Table doesn't exist" Error

**Solution:** Reimport the database schema from `backend/config/BD.sql`

### Port 80 Already in Use

**Solution:**

1. Change Apache port in XAMPP settings, or
2. Stop the service using port 80:
   ```powershell
   netstat -ano | findstr :80
   taskkill /PID <PID> /F
   ```

### Cannot Connect to Database

**Solution:**

1. Ensure MySQL is running in XAMPP Control Panel
2. Check database credentials in `backend/config/db.php`
3. Verify `ghassra_core` database exists in phpMyAdmin

### API Returns 404

**Solution:**

1. Check your URL uses correct case: `/Ghassra/` (capital G) or `/ghassra/` (lowercase)
2. Ensure Apache is running
3. Verify file paths in the URL match actual file structure

### Login Token Expired

**Solution:**

- Refresh the page or logout/login again
- Tokens expire after 24 hours (configurable)

## Contact & Support

- **Email:** support@ghassra.local
- **Issues:** Create an issue on GitHub
- **Contributions:** Fork and submit pull requests

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy sharing! 🎓📚**
