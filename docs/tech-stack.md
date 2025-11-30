# Technology Stack - Travel Super-App Backend API

## Overview
Production-ready RESTful API for a comprehensive travel platform with AI-powered features.

## Core Stack

### Runtime & Framework
- **Node.js v18+ LTS** - Latest stable runtime for production reliability
- **Express.js v4.x** - Battle-tested, minimal overhead web framework
- **Why**: Industry standard, extensive ecosystem, proven scalability

### Database & ORM
- **MySQL 8.0+** - Relational database for structured data
- **Sequelize v6.x** - Promise-based ORM with TypeScript support
- **Why**: ACID compliance, complex relationships (Users ↔ CheckIns ↔ Articles), automatic SQL injection prevention

### Authentication & Security
- **JWT (jsonwebtoken)** - Access/Refresh token pattern
- **Bcryptjs** - Password hashing (10 rounds minimum)
- **Helmet.js** - Security headers
- **express-rate-limit** - DDoS protection
- **Why**: Stateless auth, industry-standard security patterns

### File Management
- **Multer** - Multipart/form-data handling
- **Storage**: Disk with randomized filenames or cloud (S3/Cloudinary)
- **Validation**: MIME type + magic bytes verification
- **Why**: Secure file uploads for avatars, landmark photos, article thumbnails

### External APIs
- **Axios** - HTTP client for external services
- **Google Gemini Vision API** - AI landmark recognition
- **Google Gemini Image Gen** - Virtual travel photo generation
- **Google Maps Platform**:
  - Places API (Text Search, Nearby Search, Place Details)
  - Geocoding API (Coordinates ↔ Location names)
- **Why**: Robust error handling, interceptors for auth/retry logic

### Validation
- **Zod** - TypeScript-first schema validation
- **Alternative**: Joi if no TypeScript
- **Why**: Runtime type safety, better DX than manual validation

### Testing
- **Jest** - Unit & integration tests
- **Supertest** - HTTP endpoint testing
- **Why**: Industry standard, excellent mocking capabilities

### Logging & Monitoring
- **Winston** or **Pino** - Structured logging
- **Morgan** - HTTP request logging
- **Why**: Production debugging, audit trails

## Architecture Pattern

### Three-Layer Architecture
```
┌─────────────────┐
│   Controllers   │ ← HTTP layer (request/response)
└────────┬────────┘
         │
┌────────▼────────┐
│    Services     │ ← Business logic
└────────┬────────┘
         │
┌────────▼────────┐
│     Models      │ ← Data layer (Sequelize)
└─────────────────┘
```

### Project Structure
```
src/
├── config/
│   ├── database.js         # Sequelize connection
│   └── constants.js        # App-wide constants
├── controllers/            # Request handlers
│   ├── authController.js
│   ├── userController.js
│   ├── aiController.js
│   ├── articleController.js
│   └── placesController.js
├── services/               # Business logic
│   ├── authService.js
│   ├── geminiService.js    # AI integration
│   └── googleMapsService.js
├── models/                 # Sequelize models
│   ├── index.js            # Association setup
│   ├── User.js
│   ├── CheckIn.js
│   ├── Category.js
│   ├── Article.js
│   └── VirtualTrip.js
├── middleware/
│   ├── authMiddleware.js   # verifyToken, verifyAdmin
│   ├── validation.js       # Zod schemas
│   ├── errorHandler.js
│   └── uploadMiddleware.js # Multer config
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── aiRoutes.js
│   ├── articleRoutes.js
│   └── placesRoutes.js
├── utils/
│   ├── logger.js
│   ├── responseFormatter.js
│   └── errorTypes.js
└── app.js                  # Express app setup
```

## Database Schema

### Models & Relationships

**Users** (1:N with CheckIns, Articles, VirtualTrips)
- id (PK), email (unique), password (hashed), name, avatarUrl, bio, role (ENUM: user/admin)

**CheckIns** (N:1 with Users)
- id (PK), userId (FK), locationName, latitude, longitude, province, visitDate

**Categories** (1:N with Articles)
- id (PK), name, slug (unique)

**Articles** (N:1 with Users, N:1 with Categories)
- id (PK), title, content, thumbnailUrl, authorId (FK), categoryId (FK)

**VirtualTrips** (N:1 with Users)
- id (PK), userId (FK), originalImage, generatedImage, destinationName

### Sequelize Associations
```javascript
User.hasMany(CheckIn, { foreignKey: 'userId' });
User.hasMany(Article, { foreignKey: 'authorId' });
User.hasMany(VirtualTrip, { foreignKey: 'userId' });

Category.hasMany(Article, { foreignKey: 'categoryId' });

CheckIn.belongsTo(User, { foreignKey: 'userId' });
Article.belongsTo(User, { as: 'author', foreignKey: 'authorId' });
Article.belongsTo(Category, { foreignKey: 'categoryId' });
VirtualTrip.belongsTo(User, { foreignKey: 'userId' });
```

## API Endpoints

### Authentication & Profile
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login (returns JWT)
- `GET /api/user/profile` - Get authenticated user
- `PUT /api/user/profile` - Update profile (avatar/bio)

### AI Features
- `POST /api/ai/identify-landmark` - Upload image → Gemini Vision → {name, history, funFact}
- `POST /api/ai/virtual-travel` - Selfie + destination → AI image generation

### Check-in & Map
- `POST /api/user/check-in` - Save location visit
- `GET /api/user/map-history` - Visited provinces for map coloring

### Travel Blog (CMS)
- `GET /api/articles` - Public list
- `GET /api/articles/:id` - Single article
- `POST /api/articles` - Create (admin only)
- `PUT /api/articles/:id` - Update (admin only)
- `DELETE /api/articles/:id` - Delete (admin only)

### Google Maps Proxy
- `GET /api/places/search?query=...` - Text search
- `GET /api/places/nearby?lat=...&lng=...` - Nearby places
- `GET /api/places/details/:placeId` - Reviews & ratings

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=travel_app
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-256-bits
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google APIs
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
GEMINI_API_KEY=your-gemini-api-key

# File Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

## Security Best Practices

1. **Authentication**: JWT with httpOnly cookies over HTTPS
2. **Password**: Bcrypt 10+ rounds, never log passwords
3. **SQL Injection**: Sequelize parameterized queries (automatic)
4. **File Upload**: Validate MIME + magic bytes, randomized names
5. **Rate Limiting**: 100 req/15min per IP
6. **CORS**: Whitelist frontend domain only
7. **Headers**: Helmet.js for security headers
8. **Input Validation**: Zod schemas on all endpoints

## Performance Optimizations

1. **Database**: Connection pooling (max: 20), eager loading, pagination
2. **Caching**: Redis for Google Maps responses (30-day limit)
3. **API Costs**: Field masking (Places API), local landmark DB fallback
4. **Images**: Compress avatars/thumbnails, lazy loading
5. **Queries**: Selective attributes, indexes on foreign keys

## Testing Strategy

- **Unit Tests**: Services & utility functions
- **Integration Tests**: API endpoints with test DB
- **Coverage Target**: 80% minimum
- **CI/CD**: GitHub Actions for automated testing

## Deployment Checklist

- [ ] Node.js 18+ LTS environment
- [ ] MySQL 8.0+ with automated backups
- [ ] Environment variables secured (AWS Secrets Manager, etc.)
- [ ] HTTPS certificate (Let's Encrypt)
- [ ] API keys restricted by IP/referrer
- [ ] Logging aggregation (CloudWatch, Datadog)
- [ ] Error monitoring (Sentry)
- [ ] Database migrations tested
- [ ] Load balancing (if needed)

## Cost Estimates

**Gemini AI**:
- Free tier: 5 RPM, 25 req/day
- Paid: $0.075-0.30/M tokens (use Flash for cost savings)

**Google Maps**:
- $200/month free credit
- Places API: $17/1K requests (field masking reduces cost)
- Geocoding: $5/1K requests (cache aggressively)

**Optimization**: Caching + fallback DB can reduce API costs by 70%+

## Development Workflow

1. **Feature branches**: `feature/landmark-recognition`
2. **Commit format**: Conventional Commits
3. **PR reviews**: Required before merge
4. **Testing**: All tests must pass
5. **Documentation**: Update inline and API docs

---

**Target**: Final year project / Startup MVP quality
**Standards**: Production-ready, secure, well-commented code
