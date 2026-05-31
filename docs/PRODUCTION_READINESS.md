# FlowOS Production Readiness

## Ready For Controlled Field Testing

- Multi-tenant organization model
- Invite-only workspace onboarding
- Role-aware authorization
- Project membership controls
- Task assignment and drag-and-drop workflow
- Client/department and cross-sector project metadata
- Comments and activity
- Authenticated project file sharing
- Company directory profile viewer
- Organization audit trail
- Health endpoint
- Frontend and backend production builds

## Required Before Public Commercial Launch

- HTTPS and production domain configuration
- Secret manager configuration
- MySQL automated backups and restore drill
- Persistent file-storage volume, backup policy, retention policy, and malware scanning
- SMTP provider, email verification, and password reset
- Refresh-token rotation and session management
- Rate limiting and brute-force protection
- Flyway database migrations
- Structured logs, metrics, error monitoring, and alerting
- Privacy policy, terms of service, and data-processing terms
- Billing and subscription enforcement
- Automated API, authorization, and browser-flow tests

## Release Gate

Do not onboard paying customers until every required launch item is verified in staging and production.
