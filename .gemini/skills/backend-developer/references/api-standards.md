# API Design Standards

Guidelines for building RESTful APIs that are clean, predictable, and easy to consume.

## Resource-Based Routing
Use nouns for resource paths and HTTP methods for actions.
- `GET /api/v1/journals` - List journals.
- `POST /api/v1/journals` - Create a new journal.
- `GET /api/v1/accounts/:id` - Get account details.
- `PUT /api/v1/accounts/:id` - Update account.

## Request & Response Format
- **Content-Type:** Always `application/json`.
- **Response Structure:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional feedback"
}
```

## Error Handling
Use standard HTTP status codes:
- `200 OK`: Success.
- `201 Created`: Successfully created a resource.
- `400 Bad Request`: Validation error or invalid input.
- `401 Unauthorized`: Authentication required.
- `403 Forbidden`: Insufficient permissions.
- `404 Not Found`: Resource does not exist.
- `500 Internal Server Error`: Server-side bug.

## Pagination & Filtering
For list endpoints, support query parameters:
- `?page=1&limit=20`
- `?type=INCOME`
- `?start_date=2023-01-01&end_date=2023-01-31`
