# DocAuto - Document Automation SaaS Platform

A complete document automation platform built for financial services, focusing on compliance training, policy documentation, and regulatory reporting.

## 🎯 Target Market

**Primary Niche:** Financial Services Learning & Development
- Regional banks and credit unions
- Wealth management firms
- Insurance companies
- Compliance-heavy mid-market firms (50-500 employees)

**Key Use Cases:**
- Compliance training materials (AML, risk management)
- Policy documentation with approval workflows
- Audit trail generation
- Regulatory reporting automation
- Employee onboarding documentation

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL (primary database)
- Redis (caching & sessions)
- AWS S3 (document storage)
- OpenAI GPT-4 (AI features)

**Frontend:**
- Next.js 14 + React 18
- TypeScript
- Tailwind CSS
- Zustand (state management)
- React Query (data fetching)

**Infrastructure:**
- Multi-tenant architecture
- RESTful API design
- JWT authentication
- Role-based access control (RBAC)
- Comprehensive audit logging

## 📋 Features

### Core Features
✅ **Document Management**
- Create, read, update, delete documents
- Version control with full history
- Document locking for concurrent editing
- PDF generation from templates
- AI-powered document analysis

✅ **Template System**
- Pre-built industry templates
- Custom template creation
- Variable substitution
- Template marketplace (public/private)
- Usage analytics

✅ **Workflow Engine**
- Approval workflows
- Multi-step routing
- Automated notifications
- Workflow instances tracking
- Approval/rejection with comments

✅ **Analytics & Reporting**
- Dashboard with key metrics
- Document analytics
- User activity tracking
- Compliance reporting
- Audit trail

✅ **Security & Compliance**
- Multi-tenant isolation
- Audit logging for all actions
- Role-based permissions
- Encrypted storage (S3 AES256)
- JWT authentication

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- AWS Account (for S3)
- OpenAI API Key

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=docauto
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_secure_secret_key_here
JWT_EXPIRES_IN=7d

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_BUCKET_NAME=docauto-documents

# OpenAI
OPENAI_API_KEY=your_openai_key

# Frontend URL
FRONTEND_URL=http://localhost:3001
```

4. **Create PostgreSQL database:**
```bash
createdb docauto
```

5. **Run database migrations:**
```bash
npm run migrate
```

6. **Start development server:**
```bash
npm run dev
```

Backend will run on `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

Frontend will run on `http://localhost:3001`

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new organization & user
POST   /api/auth/login       - Login user
GET    /api/auth/profile     - Get user profile (authenticated)
```

### Documents
```
GET    /api/documents              - List all documents
GET    /api/documents/:id          - Get document by ID
POST   /api/documents              - Create new document
PUT    /api/documents/:id          - Update document
DELETE /api/documents/:id          - Delete document (admin/manager)
POST   /api/documents/:id/generate-pdf  - Generate PDF
POST   /api/documents/:id/analyze  - AI analysis
GET    /api/documents/:id/versions - Get version history
```

### Templates
```
GET    /api/templates        - List all templates
GET    /api/templates/:id    - Get template by ID
POST   /api/templates        - Create template (admin/manager)
PUT    /api/templates/:id    - Update template (admin/manager)
DELETE /api/templates/:id    - Delete template (admin/manager)
POST   /api/templates/:id/use - Increment usage count
```

### Workflows
```
GET    /api/workflows                    - List all workflows
POST   /api/workflows                    - Create workflow (admin/manager)
POST   /api/workflows/:id/start          - Start workflow instance
GET    /api/workflows/instances          - Get workflow instances
POST   /api/workflows/approvals/:id/approve - Approve step
POST   /api/workflows/approvals/:id/reject  - Reject step
```

### Analytics
```
GET    /api/analytics/dashboard   - Dashboard statistics
GET    /api/analytics/documents   - Document analytics
GET    /api/analytics/users       - User activity
GET    /api/analytics/compliance  - Compliance report
```

## 🗄️ Database Schema

### Core Tables

**organizations** - Multi-tenant organizations
- id, name, industry, subscription_tier, subscription_status
- max_users, max_documents, storage_limit_gb
- stripe_customer_id

**users** - User accounts
- id, organization_id, email, password_hash
- first_name, last_name, role, is_active

**documents** - Document records
- id, organization_id, template_id, created_by
- title, description, document_type, status
- content (JSONB), metadata (JSONB)
- file_url, version, is_locked

**templates** - Document templates
- id, organization_id, created_by
- name, description, category, industry
- content (JSONB), variables (JSONB)
- is_public, usage_count

**workflows** - Workflow definitions
- id, organization_id, name, description
- trigger_type, steps (JSONB), is_active

**workflow_instances** - Workflow executions
- id, workflow_id, document_id
- status, current_step, assigned_to, data (JSONB)

**approvals** - Approval records
- id, document_id, workflow_instance_id
- approver_id, status, comments

**audit_logs** - Audit trail
- id, organization_id, user_id
- action, resource_type, resource_id
- details (JSONB), ip_address, user_agent

## 🔐 Authentication & Authorization

### JWT Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Roles
- **admin** - Full access to organization
- **manager** - Create/edit templates, workflows, documents
- **user** - Create/edit own documents, view templates

### Multi-Tenancy
All data is isolated by organization_id. Users can only access data within their organization.

## 🎨 Frontend Pages

- `/` - Landing page
- `/login` - User login
- `/register` - Organization & user registration
- `/dashboard` - Analytics dashboard
- `/documents` - Document list
- `/documents/:id` - Document detail/edit
- `/templates` - Template library
- `/workflows` - Workflow management

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Deployment

### Backend Deployment (AWS)

1. **Set up RDS PostgreSQL**
2. **Set up ElastiCache Redis**
3. **Set up S3 bucket**
4. **Deploy to ECS/Fargate or EC2**
5. **Configure environment variables**
6. **Run migrations**

### Frontend Deployment (Vercel)

```bash
cd frontend
vercel deploy --prod
```

Or deploy to AWS Amplify, Netlify, etc.

## 💰 Pricing Strategy

**Freemium Tier:**
- 5 documents/month
- Basic templates
- 1 user

**Professional - $25/user/month:**
- Unlimited documents
- Advanced templates
- Workflows
- AI features
- 5 users minimum

**Enterprise - $50/user/month:**
- Everything in Professional
- Custom integrations
- Dedicated support
- SSO
- Custom templates

## 🛣️ Roadmap

**Phase 1 (MVP)** ✅
- Core document CRUD
- Template system
- Basic workflows
- User authentication

**Phase 2 (Q1 2024)**
- E-signature integration (DocuSign)
- CRM integrations (Salesforce, HubSpot)
- Advanced AI features
- Mobile app

**Phase 3 (Q2 2024)**
- Custom branding
- API webhooks
- Advanced analytics
- Compliance frameworks (SOX, FINRA)

## 📞 Support

For support, email support@docauto.com or visit our documentation at docs.docauto.com

## 📄 License

Proprietary - All rights reserved

---

Built with ❤️ for Financial Services L&D Teams
