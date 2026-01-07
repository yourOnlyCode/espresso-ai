# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register Organization & User
Create a new organization and admin user.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "john@acmefinancial.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "Acme Financial Services",
  "industry": "banking"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "john@acmefinancial.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
Authenticate existing user.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@acmefinancial.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "john@acmefinancial.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Profile
Get current user profile.

**Endpoint:** `GET /auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "john@acmefinancial.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "admin",
  "organization_name": "Acme Financial Services",
  "subscription_tier": "professional"
}
```

---

## Document Endpoints

### Create Document
Create a new document.

**Endpoint:** `POST /documents`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Anti-Money Laundering Training Manual",
  "description": "Comprehensive AML training for new employees",
  "documentType": "training",
  "templateId": "uuid-of-template",
  "content": {
    "html": "<h1>AML Training</h1><p>Content here...</p>",
    "sections": [
      {
        "title": "Introduction",
        "content": "..."
      }
    ]
  },
  "metadata": {
    "department": "Compliance",
    "version": "1.0",
    "effectiveDate": "2024-01-01"
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "organization_id": "uuid",
  "template_id": "uuid",
  "created_by": "uuid",
  "title": "Anti-Money Laundering Training Manual",
  "description": "Comprehensive AML training for new employees",
  "document_type": "training",
  "status": "draft",
  "content": {...},
  "metadata": {...},
  "version": 1,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### List Documents
Get all documents with optional filtering.

**Endpoint:** `GET /documents?status=draft&documentType=training&page=1&limit=20`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by status (draft, published, archived)
- `documentType` (optional): Filter by document type
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:** `200 OK`
```json
{
  "documents": [
    {
      "id": "uuid",
      "title": "Anti-Money Laundering Training Manual",
      "description": "Comprehensive AML training",
      "document_type": "training",
      "status": "draft",
      "version": 1,
      "created_by_name": "John Doe",
      "template_name": "Training Manual Template",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

### Get Document by ID
Get a specific document with full details.

**Endpoint:** `GET /documents/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Anti-Money Laundering Training Manual",
  "description": "Comprehensive AML training",
  "document_type": "training",
  "status": "draft",
  "content": {...},
  "metadata": {...},
  "version": 3,
  "created_by_name": "John Doe",
  "template_name": "Training Manual Template",
  "template_content": {...},
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-16T14:20:00Z"
}
```

### Update Document
Update an existing document.

**Endpoint:** `PUT /documents/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": {...},
  "status": "published",
  "metadata": {...}
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Updated Title",
  "status": "published",
  "version": 4,
  "updated_at": "2024-01-17T09:15:00Z"
}
```

### Delete Document
Delete a document (admin/manager only).

**Endpoint:** `DELETE /documents/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Document deleted successfully"
}
```

### Generate PDF
Generate a PDF from document template.

**Endpoint:** `POST /documents/:id/generate-pdf`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "variables": {
    "employeeName": "Jane Smith",
    "department": "Compliance",
    "date": "2024-01-15",
    "customField": "value"
  }
}
```

**Response:** `200 OK`
```json
{
  "fileUrl": "https://s3.amazonaws.com/bucket/org-id/document.pdf",
  "message": "PDF generated successfully"
}
```

### Analyze Document with AI
Get AI-powered analysis and suggestions.

**Endpoint:** `POST /documents/:id/analyze`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "classification": {
    "category": "Training Material",
    "confidence": 0.95
  },
  "improvements": [
    "Consider adding more specific examples in section 2",
    "The compliance section could benefit from recent regulatory updates",
    "Add a glossary of terms for better clarity"
  ]
}
```

### Get Document Versions
Get version history of a document.

**Endpoint:** `GET /documents/:id/versions`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "document_id": "uuid",
    "version_number": 3,
    "content": {...},
    "created_by_name": "John Doe",
    "change_summary": "Updated compliance section",
    "created_at": "2024-01-16T14:20:00Z"
  },
  {
    "id": "uuid",
    "document_id": "uuid",
    "version_number": 2,
    "content": {...},
    "created_by_name": "Jane Smith",
    "created_at": "2024-01-15T16:45:00Z"
  }
]
```

---

## Template Endpoints

### Create Template
Create a new document template (admin/manager only).

**Endpoint:** `POST /templates`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Compliance Training Template",
  "description": "Standard template for compliance training materials",
  "category": "training",
  "industry": "banking",
  "templateType": "document",
  "content": {
    "html": "<h1>{{title}}</h1><p>{{content}}</p>",
    "structure": [...]
  },
  "variables": [
    {
      "name": "title",
      "type": "string",
      "required": true
    },
    {
      "name": "department",
      "type": "string",
      "required": false
    }
  ],
  "isPublic": false
}
```

**Response:** `201 Created`

### List Templates
Get all available templates.

**Endpoint:** `GET /templates?category=training&industry=banking`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `category` (optional): Filter by category
- `industry` (optional): Filter by industry
- `isPublic` (optional): Filter public templates

**Response:** `200 OK`

---

## Workflow Endpoints

### Create Workflow
Create an approval workflow (admin/manager only).

**Endpoint:** `POST /workflows`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Policy Approval Workflow",
  "description": "Three-step approval for policy documents",
  "triggerType": "manual",
  "steps": [
    {
      "type": "approval",
      "name": "Manager Review",
      "assignedTo": "manager-user-id",
      "order": 1
    },
    {
      "type": "approval",
      "name": "Compliance Review",
      "assignedTo": "compliance-user-id",
      "order": 2
    },
    {
      "type": "approval",
      "name": "Executive Approval",
      "assignedTo": "exec-user-id",
      "order": 3
    }
  ]
}
```

**Response:** `201 Created`

### Start Workflow
Start a workflow for a document.

**Endpoint:** `POST /workflows/:id/start`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "documentId": "uuid",
  "data": {
    "priority": "high",
    "deadline": "2024-01-30"
  }
}
```

**Response:** `201 Created`

### Approve Workflow Step
Approve a workflow step.

**Endpoint:** `POST /workflows/approvals/:approvalId/approve`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "comments": "Approved. Looks good for publication."
}
```

**Response:** `200 OK`

### Reject Workflow Step
Reject a workflow step.

**Endpoint:** `POST /workflows/approvals/:approvalId/reject`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "comments": "Please revise section 3 for clarity."
}
```

**Response:** `200 OK`

---

## Analytics Endpoints

### Get Dashboard
Get dashboard statistics.

**Endpoint:** `GET /analytics/dashboard`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "documents": {
    "total_documents": 145,
    "draft_count": 23,
    "published_count": 122,
    "total_storage": 524288000
  },
  "templates": {
    "total_templates": 15
  },
  "workflows": {
    "total_workflows": 8,
    "completed_workflows": 45,
    "active_workflows": 3
  },
  "recentActivity": [
    {
      "action": "CREATE",
      "resource_type": "document",
      "user_name": "John Doe",
      "created_at": "2024-01-17T10:30:00Z"
    }
  ]
}
```

### Get Document Analytics
Get document creation analytics over time.

**Endpoint:** `GET /analytics/documents?startDate=2024-01-01&endDate=2024-01-31`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Get User Activity
Get user activity statistics.

**Endpoint:** `GET /analytics/users`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Get Compliance Report
Get compliance-related metrics.

**Endpoint:** `GET /analytics/compliance`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Document not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

API requests are limited to 100 requests per 15 minutes per IP address.

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642428000
```
