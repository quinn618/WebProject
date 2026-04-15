# GhassraCore Frontend

A modern, responsive student management and academic collaboration platform built with vanilla HTML, CSS, and JavaScript.

## Overview

**Ghassra Core** is a comprehensive frontend application designed for students and academic institutions. It provides a seamless interface for managing academic documents, notes, earnings, payments, and user profiles—all with a clean, intuitive design.

## Features

- **🔐 Authentication System**
  - User registration with institute verification
  - Secure login with JWT token-based sessions
  - Logout functionality with secure token management

- **👤 User Profile Management**
  - View and manage personal profile information
  - Institute and academic level tracking
  - Secure profile updates

- **📝 Notes Management**
  - Create, read, and manage study notes
  - Organized note repository
  - Quick access to learning materials

- **📄 Document Management**
  - Upload and download academic documents
  - Document sharing and organization
  - File management interface

- **💰 Earnings & Payments**
  - Track earnings and financial transactions
  - View payment history
  - Earnings dashboard

- **🛒 Purchases**
  - Manage purchased items
  - Purchase history tracking
  - Transaction details

- **💬 Support**
  - Customer support and help section
  - User assistance and inquiries

## Project Structure

```
frontend/final_frontend_style/
├── api/
│   ├── auth.api.js          # Authentication API (login, register, logout)
│   ├── config.js            # API configuration & shared utilities
│   ├── documents.api.js      # Document management API
│   ├── payments.api.js       # Payment processing API
│   ├── profile.api.js        # User profile API
│   └── purchases.api.js      # Purchase management API
├── assets/
│   ├── css/
│   │   ├── style_auth.css                 # Authentication pages styling
│   │   ├── style_main.css                 # Main application styling
│   │   ├── style_profile_welcome.css      # Landing page styling
│   │   ├── shared.css                     # Common styles
│   │   ├── notes.css                      # Notes page styling
│   │   ├── profile.css                    # Profile page styling
│   │   ├── earnings.css                   # Earnings dashboard styling
│   │   └── downloads.css                  # Downloads page styling
│   ├── images/              # Application images and icons
│   └── js/                  # Character logic files
└── pages/
    ├── index.html           # Landing/Home page
    ├── auth.html            # Login/Registration page
    ├── main.html            # Main dashboard
    ├── profile.html         # User profile page
    ├── notes.html           # Notes management page
    ├── downloads.html       # Downloads/Documents page
    ├── earnings.html        # Earnings dashboard
    └── support.html         # Support and help page
```

## Technology Stack

- **Frontend Framework:** Vanilla JavaScript (ES6+)
- **Markup:** HTML5
- **Styling:** CSS3
- **Fonts:** Google Fonts (Plus Jakarta Sans, Be Vietnam Pro)
- **Icons:** Material Symbols Outlined
- **Authentication:** JWT (JSON Web Tokens)
- **Storage:** LocalStorage (for token persistence)

## Installation & Setup

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Backend API server running (configured in `api/config.js`)

### Steps

1. **Clone or setup the project:**

   ```bash
   cd frontend/final_frontend_style
   ```

2. **Configure API Connection:**
   Edit `api/config.js` and update the `BASE_URL`:

   ```javascript
   const API_CONFIG = {
     BASE_URL: "https://your-backend-domain.com/backend/api",
     TIMEOUT_MS: 10_000,
   };
   ```

3. **Serve the application:**
   Use any local server (live-server, Python http.server, etc.):

   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js live-server
   npx live-server
   ```

4. **Access the application:**
   Open `http://localhost:8000/pages/index.html` in your browser

## API Integration

The frontend communicates with a backend REST API through modular API services:

### Available API Modules

| Module             | Purpose                 | Endpoints                                                                 |
| ------------------ | ----------------------- | ------------------------------------------------------------------------- |
| `auth.api.js`      | User authentication     | `/auth/login.php`, `/auth/register.php`, `/auth/logout.php`               |
| `profile.api.js`   | User profile management | `/profile/get.php`, `/profile/update.php`                                 |
| `documents.api.js` | Document management     | `/documents/upload.php`, `/documents/list.php`, `/documents/download.php` |
| `payments.api.js`  | Payment processing      | `/payments/list.php`, `/payments/process.php`                             |
| `purchases.api.js` | Purchase management     | `/purchases/list.php`, `/purchases/create.php`                            |

### Authentication Flow

1. User registers/logs in via `auth.html`
2. Backend returns JWT token
3. Token is stored in `localStorage` under key `gc_token`
4. Token is automatically included in all subsequent API requests
5. Token cleared on logout

## Page Routes

| Route                   | Purpose                 |
| ----------------------- | ----------------------- |
| `/pages/index.html`     | Landing page & home     |
| `/pages/auth.html`      | Login & registration    |
| `/pages/main.html`      | Main dashboard          |
| `/pages/profile.html`   | User profile management |
| `/pages/notes.html`     | Notes management        |
| `/pages/downloads.html` | Document downloads      |
| `/pages/earnings.html`  | Earnings dashboard      |
| `/pages/support.html`   | Support & help          |

## Browser Support

- Chrome/Chromium (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)

## Development Guidelines

### Adding New Features

1. **Create API Module** (if backend endpoint needed):
   - Add new file in `/api/` folder
   - Follow the pattern from existing API modules
   - Export functions as a module pattern

2. **Create Page** (if UI needed):
   - Add new HTML file in `/pages/` folder
   - Link required CSS from `/assets/css/`
   - Import necessary API modules

3. **Add Styles**:
   - Create new CSS file or modify existing ones
   - Follow existing naming conventions
   - Ensure responsive design

### Code Standards

- Use semantic HTML5 elements
- Maintain consistent naming conventions
- Document functions with JSDoc comments
- Use `const` and `let` (avoid `var`)
- Implement error handling for API calls

## Configuration

### API Base URL

Configure in `api/config.js`:

```javascript
const API_CONFIG = {
  BASE_URL: "https://your-backend-domain.com/backend/api",
  TIMEOUT_MS: 10_000,
};
```

### Storage Keys

- `gc_token` - JWT authentication token

## Security Considerations

- ✅ JWT tokens stored in localStorage for session management
- ✅ HTTPS recommended for production deployment
- ✅ Token cleared on logout
- ✅ CORS configuration required on backend
- ⚠️ Sensitive data should not be stored in localStorage

## Troubleshooting

### No API response

- Check `BASE_URL` in `api/config.js` is correct
- Ensure backend server is running
- Check browser console for CORS errors
- Verify network requests in DevTools

### Authentication issues

- Clear localStorage: `localStorage.clear()`
- Verify backend is returning valid JWT tokens
- Check token format and expiration

### Styling not loading

- Verify CSS file paths in HTML head
- Check browser console for 404 errors
- Clear browser cache (Ctrl+Shift+Del)

## Future Enhancements

- [ ] Real-time notifications
- [ ] Dark mode theme
- [ ] Mobile app version
- [ ] Advanced search functionality
- [ ] File upload with progress tracking
- [ ] User preferences/settings
- [ ] Accessibility improvements (WCAG 2.1)

## License

Proprietary - All rights reserved

## Contact & Support

For support or questions, please access the support section within the application or contact your administrator.

---

**Last Updated:** April 2026  
**Version:** 1.0  
**Status:** Production Ready
