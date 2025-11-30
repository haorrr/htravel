# Travel Super-App - Backend API

Production-ready RESTful API for a comprehensive travel platform with AI-powered features.

## Features

- 🔐 **Authentication & Profile**: JWT-based auth with access/refresh tokens, user profiles with avatar uploads
- 🤖 **AI Landmark Recognition**: Upload photos to identify landmarks using Google Gemini Vision API
- 🗺️ **Interactive Map & Check-ins**: Track visited locations, visualize travel history on map
- 📝 **Travel Blog CMS**: Admin-controlled content management with categories
- 🎨 **AI Virtual Travel**: Generate AI photos combining selfies with destination backgrounds
- 📍 **Google Maps Integration**: Places search, nearby attractions, reviews & ratings

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL 8.0+ with Sequelize ORM
- **Authentication**: JWT + Bcryptjs
- **File Uploads**: Multer + Sharp
- **External APIs**: Google Gemini AI, Google Maps Platform
- **Validation**: Zod
- **Testing**: Jest + Supertest
- **Logging**: Winston

## Getting Started

### Prerequisites

- Node.js 18+ LTS
- MySQL 8.0+
- Google Maps API Key
- Google Gemini API Key

### Installation

1. **Clone the repository** (or you're already in it)

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your actual credentials
nano .env
```

Required environment variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - MySQL connection
- `JWT_SECRET`, `JWT_REFRESH_SECRET` - Strong secrets (256-bit minimum)
- `GOOGLE_MAPS_API_KEY` - Get from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
- `GEMINI_API_KEY` - Get from [Google AI Studio](https://ai.google.dev/) (Click "Get API key")

**To get Gemini API Key (Free)**:
1. Go to https://ai.google.dev/
2. Click "Get API key in Google AI Studio"
3. Sign in with your Google account
4. Click "Create API Key"
5. Copy the key and paste it in `.env` file

4. **Create MySQL database**:
```sql
CREATE DATABASE travel_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. **Run database migrations**:
```bash
# Run all migrations to create tables
npm run migrate

# Seed initial data (admin user + categories)
npm run seed
```

**Default Admin Credentials** (change in production!):
- Email: `admin@htravel.com`
- Password: `admin123456`

6. **Start development server**:
```bash
npm run dev
```

Server will start on `http://localhost:3000`

### Database Scripts

```bash
npm run migrate         # Run pending migrations
npm run migrate:undo    # Rollback last migration
npm run seed            # Seed database with initial data
npm run seed:undo       # Remove seeded data
npm run db:reset        # Reset database (undo all + migrate + seed)
```

### Verify Setup

Test the health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-11-24T15:30:00.000Z",
  "uptime": 5.123
}
```

## Project Structure

```
htravel-api/
├── src/
│   ├── config/           # Database & constants
│   ├── controllers/      # HTTP request handlers
│   ├── services/         # Business logic
│   ├── models/           # Sequelize models
│   ├── middleware/       # Auth, validation, errors
│   ├── routes/           # API routes
│   ├── utils/            # Helpers, logger
│   └── app.js            # Express configuration
├── tests/                # Unit & integration tests
├── uploads/              # User-uploaded files
├── logs/                 # Application logs
├── .env                  # Environment variables (GITIGNORED)
├── server.js             # Entry point
└── package.json
```

## API Endpoints

### Authentication (Phase 03)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login with JWT
- `POST /api/auth/refresh` - Refresh access token

### User Profile (Phase 03)
- `GET /api/user/profile` - Get authenticated user
- `PUT /api/user/profile` - Update profile (avatar, bio)

### AI Features (Phase 04 & 07)
- `POST /api/ai/identify-landmark` - Upload image for landmark recognition (Vietnamese response)
- `POST /api/ai/virtual-travel` - Generate AI virtual travel photo (selfie + destination)
- `GET /api/ai/virtual-travel/history` - Get user's virtual travel history
- `GET /api/ai/status` - Get AI service status (Gemini + Imagen)

### Check-ins & Map (Phase 05)
- `POST /api/user/check-in` - Record location visit
- `GET /api/user/map-history` - Get visited provinces

### Blog/Articles (Phase 06)
- `GET /api/articles` - List articles (public)
- `POST /api/articles` - Create article (admin only)
- `PUT /api/articles/:id` - Update article (admin only)
- `DELETE /api/articles/:id` - Delete article (admin only)

### Google Maps Places (Phase 08)
- `GET /api/places/search` - Text search for places (query, lat, lng, radius, type)
- `GET /api/places/nearby` - Search places nearby (lat, lng, radius, type, keyword)
- `GET /api/places/details/:placeId` - Get comprehensive place details with reviews
- `GET /api/places/types` - Get list of available place types
- `GET /api/places/status` - Get Places service status

## Development

### Scripts

```bash
npm run dev        # Start with nodemon (auto-reload)
npm start          # Production start
npm test           # Run tests with coverage
npm run test:watch # Watch mode for tests
npm run lint       # ESLint code check
```

### Database Migrations

```bash
# Create new migration
npx sequelize-cli migration:generate --name migration-name

# Run migrations
npx sequelize-cli db:migrate

# Rollback migration
npx sequelize-cli db:migrate:undo
```

## Testing

Run all tests:
```bash
npm test
```

Run specific test file:
```bash
npm test -- tests/unit/authService.test.js
```

Watch mode:
```bash
npm run test:watch
```

## Security

- ✅ SQL injection prevention (Sequelize parameterized queries)
- ✅ Password hashing (Bcrypt 10 rounds)
- ✅ JWT token authentication
- ✅ File upload validation (MIME type + magic bytes)
- ✅ Rate limiting (100 req/15min per IP)
- ✅ Helmet.js security headers
- ✅ CORS whitelist
- ✅ Input validation (Zod schemas)

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets (256-bit minimum)
- [ ] Configure database connection pooling
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure CORS for production domain
- [ ] Enable database backups
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure log aggregation
- [ ] Restrict API keys by IP/domain
- [ ] Set up CI/CD pipeline

### Docker Deployment (Coming in Phase 09)

```bash
docker build -t htravel-api .
docker run -p 3000:3000 --env-file .env htravel-api
```

## Documentation

- **Tech Stack**: `docs/tech-stack.md`
- **Implementation Plan**: `plans/251124-1528-travel-superapp-api/plan.md`
- **Phase Details**: `plans/251124-1528-travel-superapp-api/phase-*.md`

## Contributing

This is a final year project. For collaboration:

1. Follow three-layer architecture (Controllers → Services → Models)
2. Write tests for new features
3. Follow YAGNI, KISS, DRY principles
4. Use conventional commit messages

## License

MIT

## Support

For issues or questions, refer to the implementation plan and phase documentation.

---

**Status**: Phase 08 Complete ✅ | Ready for Deployment 🚀
**Last Updated**: 2025-11-25
