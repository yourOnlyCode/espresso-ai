# Project Structure

```
espresso-ai/
│
├── backend/                          # Node.js/Express Backend
│   ├── src/
│   │   ├── config/                   # Configuration files
│   │   │   ├── database.ts          # PostgreSQL connection pool
│   │   │   └── redis.ts             # Redis client configuration
│   │   │
│   │   ├── controllers/              # Request handlers
│   │   │   ├── auth.controller.ts   # Authentication (register, login, profile)
│   │   │   ├── document.controller.ts # Document CRUD + PDF generation + AI
│   │   │   ├── template.controller.ts # Template management
│   │   │   ├── workflow.controller.ts # Workflow & approval management
│   │   │   └── analytics.controller.ts # Dashboard & reporting
│   │   │
│   │   ├── middleware/               # Express middleware
│   │   │   ├── auth.ts              # JWT authentication & authorization
│   │   │   ├── validation.ts        # Request validation (Joi)
│   │   │   └── audit.ts             # Audit logging middleware
│   │   │
│   │   ├── routes/                   # API route definitions
│   │   │   ├── auth.routes.ts       # /api/auth/*
│   │   │   ├── document.routes.ts   # /api/documents/*
│   │   │   ├── template.routes.ts   # /api/templates/*
│   │   │   ├── workflow.routes.ts   # /api/workflows/*
│   │   │   └── analytics.routes.ts  # /api/analytics/*
│   │   │
│   │   ├── services/                 # Business logic services
│   │   │   ├── s3.service.ts        # AWS S3 document storage
│   │   │   ├── document-generation.service.ts # PDF generation (Puppeteer)
│   │   │   └── ai.service.ts        # OpenAI integration
│   │   │
│   │   ├── database/                 # Database management
│   │   │   └── migrate.ts           # Database schema creation
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │
│   │   └── server.ts                 # Express app entry point
│   │
│   ├── package.json                  # Backend dependencies
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── .env.example                  # Environment variables template
│   └── Dockerfile.dev                # Development Docker image
│
├── frontend/                         # Next.js/React Frontend
│   ├── src/
│   │   ├── app/                      # Next.js 14 App Router
│   │   │   ├── page.tsx             # Landing page (/)
│   │   │   ├── layout.tsx           # Root layout
│   │   │   ├── globals.css          # Global styles (Tailwind)
│   │   │   │
│   │   │   ├── login/               # Login page
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── register/            # Registration page
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── dashboard/           # Dashboard with analytics
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── documents/           # Document management
│   │   │   │   └── page.tsx         # Document list
│   │   │   │
│   │   │   └── templates/           # Template library
│   │   │       └── page.tsx
│   │   │
│   │   ├── components/               # Reusable React components
│   │   │
│   │   ├── lib/                      # Utilities & configurations
│   │   │   ├── api.ts               # Axios API client
│   │   │   └── store.ts             # Zustand state management
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │
│   │   └── types/                    # TypeScript type definitions
│   │
│   ├── public/                       # Static assets
│   ├── package.json                  # Frontend dependencies
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── next.config.js                # Next.js configuration
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── postcss.config.js             # PostCSS configuration
│   └── Dockerfile.dev                # Development Docker image
│
├── shared/                           # Shared code (types, utils)
│
├── infrastructure/                   # Infrastructure as Code
│   ├── terraform/                    # Terraform configurations
│   └── cloudformation/               # CloudFormation templates
│
├── docker-compose.yml                # Local development environment
├── setup.bat                         # Windows quick start script
│
├── README.md                         # Project overview & setup
├── API_DOCUMENTATION.md              # Complete API reference
├── DEPLOYMENT.md                     # Production deployment guide
└── BUSINESS_STRATEGY.md              # Business plan & strategy

```

## Key Technologies

### Backend Stack
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL 14+
- **Cache:** Redis 6+
- **Storage:** AWS S3
- **PDF Generation:** Puppeteer + pdf-lib
- **AI:** OpenAI GPT-4
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Joi
- **Security:** Helmet, bcrypt, rate-limiting

### Frontend Stack
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** Axios + React Query
- **Forms:** React Hook Form
- **Notifications:** React Hot Toast
- **Icons:** Lucide React
- **Charts:** Recharts

### Infrastructure
- **Cloud Provider:** AWS
- **Compute:** ECS Fargate
- **Database:** RDS PostgreSQL
- **Cache:** ElastiCache Redis
- **Storage:** S3
- **CDN:** CloudFront
- **Load Balancer:** Application Load Balancer
- **Monitoring:** CloudWatch
- **CI/CD:** GitHub Actions

## Database Schema

### Core Tables (11 tables)

1. **organizations** - Multi-tenant organizations
2. **users** - User accounts with RBAC
3. **documents** - Document records with versioning
4. **document_versions** - Version history
5. **templates** - Document templates
6. **workflows** - Workflow definitions
7. **workflow_instances** - Workflow executions
8. **approvals** - Approval records
9. **audit_logs** - Complete audit trail
10. **tags** - Document tags
11. **integrations** - Third-party integrations

## API Endpoints (25+ endpoints)

### Authentication (3)
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile

### Documents (8)
- GET /api/documents
- GET /api/documents/:id
- POST /api/documents
- PUT /api/documents/:id
- DELETE /api/documents/:id
- POST /api/documents/:id/generate-pdf
- POST /api/documents/:id/analyze
- GET /api/documents/:id/versions

### Templates (6)
- GET /api/templates
- GET /api/templates/:id
- POST /api/templates
- PUT /api/templates/:id
- DELETE /api/templates/:id
- POST /api/templates/:id/use

### Workflows (6)
- GET /api/workflows
- POST /api/workflows
- POST /api/workflows/:id/start
- GET /api/workflows/instances
- POST /api/workflows/approvals/:id/approve
- POST /api/workflows/approvals/:id/reject

### Analytics (4)
- GET /api/analytics/dashboard
- GET /api/analytics/documents
- GET /api/analytics/users
- GET /api/analytics/compliance

## Features Implemented

### ✅ Core Features
- Multi-tenant architecture
- User authentication & authorization (JWT)
- Role-based access control (admin, manager, user)
- Document CRUD operations
- Version control with full history
- Template system with variables
- PDF generation from templates
- Workflow engine with approvals
- AI-powered document analysis
- Comprehensive audit logging
- Analytics dashboard
- Real-time notifications

### ✅ Security Features
- JWT authentication
- Password hashing (bcrypt)
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection prevention (parameterized queries)
- XSS protection
- Encrypted storage (S3 AES256)
- Audit trail for all actions

### ✅ Compliance Features
- Complete audit logs
- Document version history
- Approval workflows
- User activity tracking
- Compliance reporting
- Secure document storage
- Access control

## Development Workflow

### Local Development
1. Clone repository
2. Run `setup.bat` (Windows) or manual setup
3. Start PostgreSQL and Redis (via Docker or local)
4. Run migrations: `cd backend && npm run migrate`
5. Start backend: `cd backend && npm run dev`
6. Start frontend: `cd frontend && npm run dev`

### With Docker Compose
```bash
docker-compose up
```

### Testing
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Deployment
See DEPLOYMENT.md for complete production deployment guide.

## Environment Variables

### Backend (.env)
- Database: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- Redis: REDIS_HOST, REDIS_PORT
- JWT: JWT_SECRET, JWT_EXPIRES_IN
- AWS: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME
- OpenAI: OPENAI_API_KEY
- Stripe: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- Email: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
- Frontend: FRONTEND_URL

### Frontend
- API_URL: Backend API endpoint

## Code Quality

### TypeScript
- Strict mode enabled
- Type safety throughout
- Interface definitions for all data structures

### Code Organization
- Separation of concerns
- Controller → Service → Database pattern
- Reusable middleware
- Modular architecture

### Error Handling
- Centralized error handling
- Proper HTTP status codes
- Descriptive error messages
- Error logging

## Performance Optimizations

- Redis caching for frequently accessed data
- Database indexing on key columns
- Connection pooling (PostgreSQL)
- CDN for static assets (S3 + CloudFront)
- Lazy loading in frontend
- Code splitting (Next.js automatic)
- Image optimization

## Scalability

- Multi-tenant architecture
- Horizontal scaling (ECS Fargate)
- Database read replicas
- Redis cluster support
- S3 for unlimited storage
- Auto-scaling policies
- Load balancing

## Monitoring & Observability

- CloudWatch logs
- Application metrics
- Error tracking
- Performance monitoring
- Audit logs
- User activity tracking

## Next Steps

1. **Immediate:**
   - Set up development environment
   - Configure AWS services
   - Run initial migrations
   - Test all endpoints

2. **Short-term (Week 1-2):**
   - Add more templates
   - Implement e-signature integration
   - Add CRM integrations
   - Build mobile responsive views

3. **Medium-term (Month 1-3):**
   - Launch beta with first customers
   - Gather feedback
   - Iterate on features
   - Build sales materials

4. **Long-term (Month 3-12):**
   - Scale customer base
   - Add advanced features
   - Build mobile apps
   - Expand to new markets

## Support & Documentation

- README.md - Project overview
- API_DOCUMENTATION.md - Complete API reference
- DEPLOYMENT.md - Production deployment
- BUSINESS_STRATEGY.md - Business plan
- Inline code comments
- TypeScript type definitions

---

**Built for Financial Services L&D Teams**
**Focused on Compliance, Training, and Policy Documentation**
**Ready for Production Deployment** 🚀
