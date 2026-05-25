# API Documentation

## Base URL
```
Development:  http://localhost:5000
Production:   https://api.yourdomain.com
```

## Authentication

All API endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

### Get Tokens

**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "QUALITY_MANAGER"
  }
}
```

### Refresh Token

**POST** `/api/auth/refresh`
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User

**GET** `/api/auth/me`

Response:
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "QUALITY_MANAGER",
  "organization": {
    "id": "org-123",
    "name": "Acme Corp"
  }
}
```

---

## Assessments

### Create Assessment

**POST** `/api/assessments`

Body:
```json
{
  "title": "Q1 2026 Self-Assessment",
  "description": "Initial assessment of QMS",
  "auditType": "SELF_ASSESSMENT",
  "scope": "All processes",
  "objectives": "Evaluate compliance",
  "dueDate": "2026-04-30",
  "templateId": "template-123"
}
```

### List Assessments

**GET** `/api/assessments`

Query Parameters:
- `page` (default: 1)
- `limit` (default: 20)
- `status` (DRAFT, IN_PROGRESS, COMPLETED, ARCHIVED)
- `search` (search by title)
- `sort` (createdAt, updatedAt, status)

Response:
```json
{
  "data": [
    {
      "id": "assessment-123",
      "title": "Q1 2026 Self-Assessment",
      "status": "IN_PROGRESS",
      "overallScore": 2.1,
      "createdAt": "2026-03-01T00:00:00Z",
      "leadAuditor": {...}
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### Get Assessment Details

**GET** `/api/assessments/{id}`

Response:
```json
{
  "id": "assessment-123",
  "title": "Q1 2026 Self-Assessment",
  "description": "...",
  "status": "IN_PROGRESS",
  "overallScore": 2.1,
  "sectionScores": {
    "4": 2.5,
    "5": 2.0,
    "6": 1.8
  },
  "teamMembers": [...],
  "responses": [...]
}
```

### Update Assessment

**PUT** `/api/assessments/{id}`

Body:
```json
{
  "title": "Updated Title",
  "status": "COMPLETED",
  "completedDate": "2026-03-31"
}
```

### Clone Assessment

**POST** `/api/assessments/{id}/clone`

Body:
```json
{
  "title": "Q2 2026 Self-Assessment"
}
```

### Submit Assessment Response

**POST** `/api/assessments/{id}/responses`

Body:
```json
{
  "questionId": "question-123",
  "sectionId": "section-123",
  "score": 2,
  "justification": "Partially compliant - evidence available",
  "actionProposal": "Implement X by end of month",
  "isDraft": false
}
```

### Get Assessment Responses

**GET** `/api/assessments/{id}/responses`

Response:
```json
{
  "data": [
    {
      "id": "response-123",
      "questionId": "question-123",
      "score": 2,
      "justification": "...",
      "evidence": [...],
      "createdBy": {...}
    }
  ]
}
```

### Generate PDF Report

**GET** `/api/assessments/{id}/report`

Returns binary PDF file.

### Export as CSV

**GET** `/api/assessments/export`

Query Parameters:
- `assessmentId` (required)
- `format` (csv, json)

Returns CSV file.

---

## Non-Conformities (NCRs)

### Create NCR

**POST** `/api/assessments/{assessmentId}/non-conformities`

Body:
```json
{
  "responseId": "response-123",
  "title": "Missing procedure documentation",
  "description": "Section 4 procedure not documented",
  "severity": "MAJOR",
  "rootCause": "Process not formalized"
}
```

### List NCRs

**GET** `/api/assessments/{assessmentId}/non-conformities`

Query Parameters:
- `status` (OPEN, IN_PROGRESS, CLOSED, VERIFIED)
- `severity` (CRITICAL, MAJOR, MINOR)

### Auto-Generate NCRs

**POST** `/api/assessments/{assessmentId}/non-conformities/generate`

Automatically creates NCRs from all Score=1 responses.

### Update NCR

**PUT** `/api/non-conformities/{id}`

Body:
```json
{
  "status": "IN_PROGRESS",
  "rootCause": "Training gaps",
  "rootCauseMethod": "5_WHYS"
}
```

### Transition NCR Status

**POST** `/api/non-conformities/{id}/transition`

Body:
```json
{
  "newStatus": "CLOSED"
}
```

Allowed transitions:
- OPEN → IN_PROGRESS
- IN_PROGRESS → CLOSED
- CLOSED → VERIFIED

---

## Corrective Actions

### Create Corrective Action

**POST** `/api/non-conformities/{ncrId}/actions`

Body:
```json
{
  "description": "Document section 4 procedures",
  "assignedToId": "user-456",
  "priority": "HIGH",
  "targetDate": "2026-04-15"
}
```

### List Actions for NCR

**GET** `/api/non-conformities/{ncrId}/actions`

### Update Action

**PUT** `/api/actions/{id}`

Body:
```json
{
  "status": "COMPLETED",
  "completedDate": "2026-04-10",
  "notes": "All procedures documented and reviewed"
}
```

### Verify Action Effectiveness

**POST** `/api/actions/{id}/verify`

Body:
```json
{
  "isEffective": true,
  "verificationNotes": "Follow-up assessment shows compliance",
  "verifiedDate": "2026-05-01"
}
```

---

## Standards

### Get Section Tree

**GET** `/api/standards/sections`

Response:
```json
{
  "data": [
    {
      "id": "section-4",
      "sectionNumber": "4",
      "title": "Context of the organization",
      "children": [
        {
          "id": "section-4-1",
          "sectionNumber": "4.1",
          "title": "Understanding the organization",
          "children": []
        }
      ]
    }
  ]
}
```

### Get Section Details

**GET** `/api/standards/sections/{id}`

Response:
```json
{
  "id": "section-4",
  "sectionNumber": "4",
  "title": "Context of the organization",
  "description": "...",
  "questions": [...]
}
```

### List Questions

**GET** `/api/standards/questions`

Query Parameters:
- `sectionId` (filter by section)
- `search` (search text)

### Import Questions from CSV

**POST** `/api/standards/import`

Multipart form-data:
- `file` (CSV file)

CSV Format:
```
questionNumber,questionText,sectionId,guidance,score1Criteria,score2Criteria,score3Criteria
4.1.1,Is context understood?,section-4-1,Consider internal/external factors,...,...,...
```

---

## Dashboard

### Overview Stats

**GET** `/api/dashboard`

Response:
```json
{
  "totalAssessments": 15,
  "activeAssessments": 3,
  "completedAssessments": 12,
  "averageScore": 2.1,
  "nonConformities": 12,
  "openNCRs": 3,
  "correctiveActions": 8,
  "completedActions": 5
}
```

### Section Breakdown

**GET** `/api/dashboard/sections`

Response:
```json
{
  "data": [
    {
      "sectionNumber": "4",
      "title": "Context of organization",
      "averageScore": 2.3,
      "responseCount": 5
    }
  ]
}
```

### Trends

**GET** `/api/dashboard/trends`

Query Parameters:
- `timeframe` (30d, 90d, 1y)

Response:
```json
{
  "data": [
    {
      "date": "2026-03-01",
      "averageScore": 1.9,
      "assessmentCount": 1
    }
  ]
}
```

---

## Users

### List Users

**GET** `/api/users`

Query Parameters:
- `role` (SYSTEM_ADMIN, QUALITY_MANAGER, etc.)
- `search` (search by name/email)
- `isActive` (true/false)

### Update User

**PUT** `/api/users/{id}`

Body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "department": "Quality"
}
```

### Change User Role

**POST** `/api/users/{id}/change-role`

Body:
```json
{
  "role": "INTERNAL_AUDITOR"
}
```

### Toggle User Active Status

**POST** `/api/users/{id}/toggle-active`

Body:
```json
{
  "isActive": false
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...},
  "timestamp": "2026-03-01T12:00:00Z"
}
```

### Common Error Codes

- `UNAUTHORIZED` - Missing or invalid token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input
- `CONFLICT` - Resource conflict
- `INTERNAL_ERROR` - Server error

---

## Rate Limiting

- 100 requests per minute per user
- 1000 requests per hour per user

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640000000
```

---

## Pagination

Standard pagination format:

Query Parameters:
- `page` (default: 1)
- `limit` (default: 20, max: 100)

Response:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "pages": 8,
    "hasMore": true
  }
}
```

---

## File Upload (Evidence)

**POST** `/api/responses/{responseId}/evidence`

Multipart form-data:
- `file` (binary file, max 50MB)
- `description` (text)
- `type` (DOCUMENT, IMAGE, VIDEO, OTHER)

Supported formats:
- Documents: PDF, DOC, DOCX, XLS, XLSX
- Images: JPG, PNG, GIF
- Video: MP4, MOV

Response:
```json
{
  "id": "evidence-123",
  "fileName": "procedure.pdf",
  "type": "DOCUMENT",
  "fileSize": 1024000,
  "uploadedAt": "2026-03-01T12:00:00Z"
}
```

**GET** `/api/evidence/{id}/download`

Downloads the file.

**DELETE** `/api/evidence/{id}`

Deletes the evidence file.

---

## Webhooks (Future)

Subscribe to events:
- assessment.created
- assessment.completed
- ncr.created
- action.completed

See DEPLOYMENT.md for webhook configuration.

---

Last Updated: March 24, 2026
Version: 1.0
