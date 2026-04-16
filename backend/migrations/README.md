# Database Migration

## Setup Instructions

### Quick Start (Recommended)

Run the migration script to create the database with schema and demo data:

```bash
php migrate.php
```

This will:

- ✓ Create `ghassra_core` database
- ✓ Create all tables (schema)
- ✓ Load 7 test users (3 buyers + 4 sellers)
- ✓ Load 18 documents (8 free + 10 paid)
- ✓ Load 15 transactions with balance transfers
- ✓ Load access history (downloads/purchases/uploads)

### Manual Setup

If you prefer to run SQL manually:

```bash
mysql -u root -p < data_seed.sql
```

## Test Accounts

All test users have password: **`demo123456`**

### Buyers (can purchase documents)

- `test@example.com` - Balance: 906.00
- `houda@gmail.com` - Balance: 894.50
- `arij@gmail.com` - Balance: 896.50

### Sellers (can upload documents)

- `ahmed.mansouri@isimm.edu` - Balance: 565.50 (4 sales)
- `fatima.benali@isimm.edu` - Balance: 334.50 (4 sales)
- `mohammed.saidi@isimm.edu` - Balance: 1089.50 (4 sales)
- `leila.khaled@isimm.edu` - Balance: 218.00 (1 sale)

## Files in This Folder

- **`migrate.php`** - PHP migration runner (executes data_seed.sql)
- **`data_seed.sql`** - Complete database dump with schema + demo data
- **`README.md`** - This file

## Database Info

- **Database Name**: `ghassra_core`
- **Host**: localhost
- **User**: root
- **Password**: (empty by default in XAMPP)

## Notes

- The migration includes all demo data for immediate testing
- Each user has pre-loaded transactions and balances
- PDF files are referenced in documents (backend/uploads/doc\_\*.pdf)
- Aura points system is active and tracks user reputation
