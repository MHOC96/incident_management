# AGENTS.md

# University of Sri Jayewardenepura
# Incident Reporting & Resolution Management System

This document defines the engineering rules, architecture, security requirements, permission model, workflow rules, deployment architecture, and implementation standards for developers and AI coding agents working on this repository.

**Read this document before modifying the project.**

---

# 1. Project Mission

Build a professional Incident Reporting & Resolution Management System for the University of Sri Jayewardenepura.

The system allows university students to report incidents such as:

- Broken doors
- Damaged furniture
- Water leaks
- Plumbing issues
- Electrical problems
- Cleanliness problems
- Security incidents
- Student conflicts
- Infrastructure problems
- Other university-related incidents

The system must support the complete operational lifecycle:

```text
Student
   ↓
Submit Incident
   ↓
Admin Review
   ↓
Verified / Rejected
   ↓
Dean Review
   ↓
Assign Responsible Party
   ↓
Responsible Official
   ↓
Progress Updates
   ↓
Resolution
   ↓
Dean Review
   ↓
Closed
```

This is an institutional management system, not simply a public complaint form.

---

# 2. Product Principles

All implementation decisions must preserve the following principles.

## 2.1 Institutional

The application must feel like an official university information system.

It must not look like:

- Generic SaaS software
- Startup dashboard
- AI-generated UI template
- Crypto application
- Gaming interface
- Social media platform

---

## 2.2 Professional

The application must prioritize:

- clarity
- trust
- consistency
- accessibility
- information hierarchy
- predictable workflows

---

## 2.3 Simple

Use the simplest architecture that satisfies the requirements.

Do not introduce infrastructure simply because it is technically interesting.

---

## 2.4 Secure

Security must be enforced on the backend.

Never depend on frontend visibility for authorization.

---

## 2.5 Maintainable

Prefer:

- clear names
- small modules
- reusable components
- explicit business logic
- predictable API contracts
- documented assumptions

Avoid unnecessary abstractions.

---

# 3. Final Technology Stack

The approved architecture is:

```text
Frontend:
Next.js
React
TypeScript
Tailwind CSS

Frontend Deployment:
Vercel

Backend:
Django
Django REST Framework

Backend Deployment:
Railway

Database:
PostgreSQL
Railway

Media:
Cloudinary
```

Optional:

```text
UI Components:
shadcn/ui

Icons:
Lucide
```

---

# 4. Deployment Architecture

The production deployment should use:

```text
                         USERS
                           │
                           ▼
                  ┌─────────────────┐
                  │     Vercel      │
                  │    Next.js      │
                  └────────┬────────┘
                           │
                         HTTPS
                           │
                           ▼
                  ┌─────────────────┐
                  │     Railway     │
                  │ Django REST API │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │     Railway     │
                  │   PostgreSQL    │
                  └─────────────────┘

                  ┌─────────────────┐
                  │   Cloudinary    │
                  │ Incident Media  │
                  └─────────────────┘
```

---

# 5. Vercel Frontend

The Next.js frontend should be deployed on Vercel.

Vercel is the preferred frontend deployment for this project because it is well suited to Next.js applications and provides efficient global delivery.

Do not move the frontend to Railway solely because the backend is hosted there.

The frontend and backend may be hosted on different platforms.

This is intentional.

---

# 6. Railway Backend

Django and PostgreSQL should run on Railway.

Recommended structure:

```text
Railway Project

├── Django API
│
└── PostgreSQL
```

The Django API and PostgreSQL database should be deployed in the **same Railway region** whenever possible.

This reduces unnecessary network latency between the application server and database.

---

# 7. Region Strategy

The majority of expected users are university users in Sri Lanka.

The backend and database should therefore be deployed in a Railway region that provides good practical latency to Sri Lankan users while maintaining low latency between:

```text
Django
   ↓
PostgreSQL
```

Do not select different regions for Django and PostgreSQL without a specific reason.

---

# 8. Frontend ↔ Backend Architecture

The frontend communicates with Django through REST APIs.

```text
Next.js
   ↓
HTTPS
   ↓
Django REST API
   ↓
PostgreSQL
```

The frontend should not directly connect to PostgreSQL.

The frontend should not contain database credentials.

---

# 9. Image Storage

Incident images must not be stored as large binary objects directly in PostgreSQL.

Use Cloudinary for incident media.

Conceptually:

```text
Student
   ↓
Next.js
   ↓
Django
   ↓
Cloudinary
   ↓
Image URL/reference
   ↓
PostgreSQL
```

The database should store the appropriate Cloudinary reference rather than the full image binary.

---

# 10. Caching

Caching is optional.

Do not add Redis merely because caching is considered a "production" feature.

Initial architecture should work without Redis.

Possible future cache candidates:

```text
Public incident listings
Categories
Locations
Dashboard aggregates
Responsible-party lists
```

Do not indiscriminately cache sensitive information.

---

# 11. Redis

Redis is **not required** for the initial project.

Do not add Redis unless a genuine requirement appears, such as:

- high-volume caching
- background job queues
- distributed throttling
- other demonstrated performance requirements

The system should remain functional without Redis.

---

# 12. Celery

Celery is not required initially.

Do not introduce a background worker architecture for ordinary:

```text
CRUD
authentication
incident updates
assignments
```

Use synchronous API operations unless a task is genuinely long-running.

---

# 13. WebSockets

WebSockets are not required initially.

Do not introduce WebSockets merely to make the architecture appear advanced.

Use:

```text
REST APIs
normal data refresh
polling where justified
```

Real-time communication can be introduced only if a real product requirement appears.

---

# 14. Sessions and Authentication

The primary architecture is:

```text
Next.js
   ↓
Django REST API
```

Use an authentication mechanism appropriate for a separate frontend and API architecture.

JWT authentication is acceptable.

Conceptually:

```text
POST /api/auth/login/
        ↓
Django
        ↓
Access Token
Refresh Token
```

Authentication strategy must be applied consistently across the application.

Do not simultaneously introduce unrelated authentication mechanisms without a clear reason.

---

# 15. Student Account Creation

Students cannot self-register.

Student accounts are provisioned from the university student roster.

```text
MC number  = username
CPM number = initial password
```

Students sign in with the MC and CPM numbers issued by the university.

After a successful sign-in, a student may change the initial CPM password.

Students must never be able to select privileged roles.

Do not accept:

```text
role=DEAN
role=ADMIN
role=OFFICIAL
```

as a trusted client-controlled value.

---

# 16. Official Account Creation

University officials must not self-register.

Official accounts are created by the Dean.

Examples:

```text
Vice Chancellor
Head of Department
Maintenance Officer
Security Officer
Other Authorized Official
```

Workflow:

```text
Dean
   ↓
Create Official Account
   ↓
Invitation sent
   ↓
Official activates account
   ↓
Official creates password
   ↓
Account becomes active
```

The Dean should not need to know the official's permanent password.

---

# 17. Roles

Use these application roles:

```text
STUDENT
ADMIN
DEAN
OFFICIAL
```

Do not add roles unless a business requirement requires them.

---

# 18. Official Positions

Official position is separate from application role.

Supported positions:

```text
VICE_CHANCELLOR
HOD
MAINTENANCE_OFFICER
SECURITY_OFFICER
OTHER
```

Example:

```text
role = OFFICIAL
position = MAINTENANCE_OFFICER
```

Do not use position names as a substitute for permission checks.

---

# 19. Authority Model

The Dean has the highest application authority.

Conceptually:

```text
DEAN
 │
 ├── ADMIN
 │
 ├── OFFICIAL
 │    ├── Vice Chancellor
 │    ├── HOD
 │    ├── Maintenance Officer
 │    ├── Security Officer
 │    └── Other
 │
 └── STUDENT
```

This is an **application permission model**, not a complete representation of the University's real organizational hierarchy.

---

# 20. Student Permissions

Students may:

```text
Create their own incident reports
View their own incidents
View public incidents
Track permitted incident progress
Read permitted communications
Send permitted incident communications
```

Students may not:

```text
Verify incidents
Reject incidents
Assign incidents
Manage official users
Manage responsible parties
Change official priority
Close incidents
```

---

# 21. Admin Permissions

Admin may:

```text
View submitted incidents
Review incidents
Verify incidents
Reject incidents
Request more information
```

Admin may not:

```text
Create Dean accounts
Promote themselves
Override Dean permissions
Perform unrestricted system management
```

---

# 22. Dean Permissions

The Dean is the highest application authority.

The Dean may:

```text
View authorized incidents
Assign incidents
Reassign incidents
Set priority
Review incident progress
Close incidents
Create official accounts
Read official accounts
Update official accounts
Deactivate official accounts
Reactivate official accounts
Manage responsible parties
Manage appropriate categories
Manage applicable locations
Manage relevant application settings
```

The Dean must not bypass application security mechanisms or directly manipulate the database through the UI.

---

# 23. Official Permissions

Officials may:

```text
View incidents assigned to them
View authorized incident information
Communicate on assigned incidents
Update progress
Upload relevant evidence
Mark assigned work as resolved
```

Officials may not:

```text
Create administrators
Create Dean accounts
Manage arbitrary users
Assign themselves arbitrary incidents
Modify unrelated incidents
Change system-wide settings
Close incidents
```

---

# 24. Backend Authorization

Every privileged API operation must be enforced by Django.

Never rely solely on:

```text
hidden button
hidden menu
frontend route protection
localStorage role
client-side condition
```

Frontend authorization is for user experience.

Backend authorization is the actual security boundary.

---

# 25. Object-Level Authorization

A user must only access specific incidents they are authorized to access.

For example, changing:

```text
/incidents/123
```

to:

```text
/incidents/124
```

must not allow unauthorized access to another person's private incident.

Every sensitive request must evaluate:

```text
Who is the authenticated user?
What role do they have?
What incident are they accessing?
Are they authorized for that specific incident?
```

---

# 26. Incident Lifecycle

Use controlled incident statuses:

```text
SUBMITTED
UNDER_REVIEW
VERIFIED
REJECTED
FORWARDED_TO_DEAN
ASSIGNED
IN_PROGRESS
RESOLVED
CLOSED
```

Normal workflow:

```text
SUBMITTED
    ↓
UNDER_REVIEW
    ↓
VERIFIED
    ↓
FORWARDED_TO_DEAN
    ↓
ASSIGNED
    ↓
IN_PROGRESS
    ↓
RESOLVED
    ↓
CLOSED
```

Rejection:

```text
UNDER_REVIEW
    ↓
REJECTED
```

---

# 27. Status Transition Rules

Status changes must be validated by the backend.

Do not allow arbitrary state changes.

For example:

```text
SUBMITTED
→ UNDER_REVIEW

UNDER_REVIEW
→ VERIFIED
→ REJECTED

VERIFIED
→ FORWARDED_TO_DEAN

FORWARDED_TO_DEAN
→ ASSIGNED

ASSIGNED
→ IN_PROGRESS

IN_PROGRESS
→ RESOLVED

RESOLVED
→ CLOSED
```

Do not allow arbitrary transitions such as:

```text
SUBMITTED → CLOSED
```

without an explicit requirement and corresponding backend rule.

---

# 28. Incident Identifier

The server must generate incident identifiers.

Recommended format:

```text
INC-2026-00142
```

Students must never be able to create their own incident identifiers.

---

# 29. Incident Data

An incident should contain at minimum:

```text
Incident Number
Title
Description
Category
Location
Visibility
Reporter
Status
Created At
Updated At
```

Potential fields:

```text
Priority
Incident Image
Verified At
Resolved At
Closed At
```

---

# 30. Incident Visibility

Supported values:

```text
PUBLIC
PRIVATE
RESTRICTED
```

## PUBLIC

Anyone can view the approved public information.

## PRIVATE

Only authorized university users and permitted participants may access the incident.

## RESTRICTED

Only explicitly authorized users may access the incident.

---

# 31. Public Incident Privacy

Public incidents must never expose:

```text
Student phone number
Student email
MC number
Private communications
Internal notes
Restricted data
Sensitive personal information
```

Public serializers must explicitly choose what information is returned.

---

# 32. Incident Categories

Use controlled categories such as:

```text
INFRASTRUCTURE
MAINTENANCE
WATER_PLUMBING
ELECTRICAL
CLEANLINESS
SECURITY
STUDENT_CONFLICT
ACADEMIC
IT_TECHNOLOGY
SAFETY
OTHER
```

The exact list may evolve.

---

# 33. Incident Priority

Supported values:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Students may describe the severity of an incident, but official priority should be controlled by authorized university personnel.

The Dean has authority to update priority.

---

# 34. Responsible Parties

Do not hard-code specific individuals into business logic.

Use responsible-party entities.

Examples:

```text
Maintenance Division
Security Division
Department
Vice Chancellor's Office
Other Authorized Office
```

The relationship should be:

```text
Incident
   ↓
Responsible Party
   ↓
Official
```

not:

```text
Incident
   ↓
Hard-coded maintenance user ID
```

---

# 35. Assignment

The Dean is the primary assignment authority.

An assignment should contain:

```text
Incident
Assigned Official
Assigned By
Assigned At
Assignment Comment
```

Reassignment may be supported by the Dean.

---

# 36. Official Resolution Flow

Officials may progress assigned incidents:

```text
ASSIGNED
   ↓
IN_PROGRESS
   ↓
RESOLVED
```

The official should provide a useful resolution statement where appropriate.

Example:

```text
"Damaged classroom door has been repaired."
```

Officials must not directly close an incident.

---

# 37. Dean Closure

Final closure belongs to the Dean.

```text
Official
   ↓
RESOLVED
   ↓
Dean Review
   ↓
CLOSED
```

The Dean may return the incident for additional work when necessary.

---

# 38. Communication

Communication is incident-specific.

Messages belong to the incident.

Example:

```text
Dean:
Please inspect the damaged door.

Maintenance Officer:
A technician has been assigned.

Dean:
Please confirm completion.

Maintenance Officer:
The door has been repaired.
```

Do not build a general-purpose messaging or social platform.

---

# 39. Timeline

The incident detail page should show operational progress through a timeline.

Possible events:

```text
Incident submitted
Incident reviewed
Incident verified
Incident assigned
Work started
Progress updated
Resolution reported
Incident closed
```

The timeline should be based on actual application events.

---

# 40. No Audit Log Feature

Do not implement a dedicated audit logging subsystem.

Do not create:

```text
AuditLog
AuditEvent
AuditTrail
SystemHistoryLog
```

as a general-purpose feature.

The system only needs operational information such as:

```text
Incident status
Assignments
Messages
Created timestamps
Updated timestamps
Resolution information
```

Do not add audit logging unless project requirements explicitly change.

---

# 41. Rate Limiting

Rate limiting is recommended.

Prioritize:

```text
Login
Registration
Password reset
Public APIs
Incident creation
Communication endpoints
```

Use Django REST Framework throttling or an equivalent backend-controlled mechanism.

Do not rely only on frontend controls.

---

# 42. Caching Strategy

Do not prematurely optimize.

Initial system:

```text
Next.js
   ↓
Django
   ↓
PostgreSQL
```

is sufficient.

Introduce caching only when there is a demonstrated use case.

Potential future candidates:

```text
Public incident listing
Public statistics
Categories
Locations
Dashboard aggregates
```

---

# 43. Database Strategy

Use PostgreSQL.

Django and PostgreSQL should be deployed close together in the same Railway region whenever possible.

Use relational modeling.

Avoid storing related IDs in strings.

Bad:

```text
assigned_users = "4,12,18"
```

Prefer:

```text
ForeignKey
ManyToManyField
OneToOneField
```

where appropriate.

---

# 44. Custom User Model

Use a custom Django user model from the beginning.

Do not build the entire application around the default Django user and plan to replace it later.

The conceptual structure is:

```text
User
----
id
name
email
phone
mc_number
role
position
status
department
year
created_at
updated_at
```

Only store fields genuinely required by the application.

---

# 45. Account Status

Recommended account statuses:

```text
INVITED
ACTIVE
INACTIVE
SUSPENDED
```

Prefer deactivation over permanent deletion where historical incident relationships exist.

---

# 46. Official Account Invitation

The invitation system should avoid password sharing.

Preferred:

```text
Dean
   ↓
Create Official Account
   ↓
Invitation Email
   ↓
Activation Link
   ↓
Set Password
   ↓
Account Active
```

Do not place passwords inside email messages.

Do not place permanent passwords in URLs.

---

# 47. Passwords

Never store plain-text passwords.

Use Django's secure password handling.

Never expose password hashes through APIs.

Never send passwords back to the frontend.

---

# 48. Secrets

Never hard-code:

```text
Django SECRET_KEY
Database password
JWT secrets
Cloudinary secret
Email credentials
Third-party API keys
```

Use environment variables.

Provide:

```text
.env.example
```

with placeholder names only.

---

# 49. CORS

Configure production CORS explicitly.

Do not use unrestricted origins in production without a documented reason.

The Vercel production frontend origin must be explicitly allowed by Django.

---

# 50. HTTPS

Production communication must use HTTPS.

The frontend must communicate with the Django API through HTTPS.

Do not send authentication credentials over plain HTTP in production.

---

# 51. API Design

Use clear REST APIs.

Examples:

```text
GET    /api/incidents/
POST   /api/incidents/

GET    /api/incidents/{id}/
PATCH  /api/incidents/{id}/

POST   /api/incidents/{id}/verify/
POST   /api/incidents/{id}/reject/
POST   /api/incidents/{id}/assign/
POST   /api/incidents/{id}/resolve/
POST   /api/incidents/{id}/close/

GET    /api/incidents/{id}/messages/
POST   /api/incidents/{id}/messages/
```

Endpoints should have a clear purpose.

Avoid generic:

```text
POST /api/action/
```

patterns where a specific endpoint would be clearer.

---

# 52. Serializers

Never blindly return full model objects.

Avoid exposing:

```python
fields = "__all__"
```

on sensitive models without reviewing the information returned.

Public and private serializers should expose different information where necessary.

---

# 53. API Validation

Validate data:

```text
Frontend
Backend
Database where appropriate
```

Frontend validation improves experience.

Backend validation protects the system.

Database constraints protect data integrity.

---

# 54. Pagination

Incident lists must be paginated.

Do not load thousands of incidents into the browser in one request.

Use server-side pagination for:

```text
Public incidents
Student incidents
Admin incidents
Dean incidents
Official assigned incidents
```

---

# 55. Database Indexing

Add indexes to fields frequently used for:

```text
incident number
status
category
location
created_at
reporter
assigned official
visibility
```

Indexes should be based on actual query patterns.

Do not create unnecessary indexes everywhere.

---

# 56. Query Optimization

Django queries should be written carefully.

Use appropriate:

```text
select_related()
prefetch_related()
```

for relational data where needed.

Avoid N+1 queries in:

```text
incident lists
dashboard tables
assignment lists
communication views
```

---

# 57. Frontend Architecture

Use:

```text
Next.js
React
TypeScript
Tailwind CSS
```

Keep business logic separated from presentation where practical.

Recommended areas:

```text
components/
services/
hooks/
lib/
types/
```

---

# 58. TypeScript Rules

Prefer explicit types.

Example:

```ts
type IncidentStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED"
  | "FORWARDED_TO_DEAN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";
```

Avoid broad types such as:

```ts
status: string;
```

when the value is controlled.

Avoid unnecessary:

```ts
any
```

---

# 59. Component Architecture

Create reusable components.

Examples:

```text
Button
Input
Select
Badge
Dialog
Table
Pagination
Toast
IncidentStatus
IncidentPriority
IncidentTimeline
IncidentForm
```

Do not copy the same implementation into multiple pages.

---

# 60. UI Source of Truth

When modifying the interface, read:

```text
DESIGN.md
```

before implementing major visual changes.

`DESIGN.md` defines:

```text
Colors
Typography
Spacing
Borders
Radius
Layout
Animation
Responsive behavior
Visual hierarchy
```

Do not introduce unrelated visual systems.

---

# 61. Anti-AI-Slop UI Rules

The application must avoid:

```text
Excessive gradients
Glassmorphism
Huge rounded cards
Neon colors
Decorative blobs
3D illustrations
AI-generated people
Excessive shadows
Over-animation
Card overload
Giant marketing typography
Random decorative icons
```

Use:

```text
Institutional colors
Strong typography
Subtle borders
Moderate radius
Clean tables
Controlled spacing
Clear status indicators
```

---

# 62. Institutional Visual Language

The interface should communicate:

```text
Trust
Authority
Calmness
Professionalism
Reliability
Clarity
```

It should resemble:

```text
University Portal
+
Administrative Case Management
+
Professional Government Service
```

It should not resemble:

```text
Generic SaaS Dashboard
```

---

# 63. Public Experience

Public users do not need an account to:

```text
View public incidents
Search public incidents
Filter public incidents
View public incident details
```

Public users cannot:

```text
Submit incidents
View private incidents
View restricted incidents
View reporter information
View internal communication
```

---

# 64. Student Experience

Students should be able to:

```text
Sign in with MC number and CPM number
Change password after first sign-in
View public incidents
Submit an incident
Upload an image
Choose visibility
Track own incidents
Read permitted updates
Communicate where permitted
```

The submission workflow should be short and easy to understand.

---

# 65. Admin Experience

The Admin's primary task is verification.

Prioritize:

```text
Pending Reports
Incident Details
Evidence
Verify
Reject
Request More Information
```

Do not overwhelm the Admin with unrelated system management.

---

# 66. Dean Experience

The Dean dashboard must make it easy to answer:

```text
What needs my attention?

Who is responsible?

What is currently in progress?

Which incidents are high priority?

What has been resolved?

Which incidents can be closed?
```

The Dean has the strongest management interface.

---

# 67. Official Experience

An official should see a focused workspace containing:

```text
Assigned Incidents
Priority
Location
Description
Evidence
Communication
Progress
Resolution Action
```

Do not expose unrelated administrative functionality.

---

# 68. Form Rules

Forms must:

- have visible labels
- use clear field descriptions
- validate inline
- explain errors
- preserve entered data where possible
- clearly mark required fields

Do not depend solely on placeholder text.

Bad:

```text
[ Enter title... ]
```

Better:

```text
Incident Title
[_____________________]
```

---

# 69. Image Upload Rules

Image uploads should support:

```text
Preview
Validation
Progress feedback
Remove
Retry after failure
```

Validate:

```text
File type
File size
Upload status
```

Do not trust only the file extension.

---

# 70. Mobile Experience

The system must work on:

```text
Mobile
Tablet
Laptop
Desktop
Large Desktop
```

Incident reporting should be especially convenient on mobile because students may report incidents while physically near the problem.

---

# 71. Responsive Rules

Mobile layouts should:

```text
Use one-column forms
Reduce table complexity
Convert complex tables to records where appropriate
Provide accessible navigation
Maintain large enough touch targets
```

Do not simply shrink desktop layouts.

---

# 72. Error Handling

User-facing errors must be understandable.

Avoid exposing raw:

```text
Stack traces
SQL errors
Internal paths
Secret configuration
```

Bad:

```text
IntegrityError: duplicate key value...
```

Better:

```text
We couldn't complete this request.
Please try again.
```

Technical details may be logged internally for debugging.

---

# 73. Loading States

Use skeleton loading for major page content.

Buttons performing operations should clearly indicate loading.

Example:

```text
[ Submitting... ]
```

Disable repeated submission while the request is processing.

---

# 74. Duplicate Submission Prevention

Incident submission must protect against accidental duplicates.

Frontend:

```text
Disable submit while processing.
```

Backend:

```text
Handle retries safely where appropriate.
```

Do not assume a client request is always sent only once.

---

# 75. Empty States

Examples:

Student:

```text
You haven't reported any incidents yet.
```

Public:

```text
No public incidents found.
```

Official:

```text
No incidents are currently assigned to you.
```

Admin:

```text
There are no reports awaiting verification.
```

Empty states should explain what is happening.

---

# 76. Notifications

Use notifications only when they provide operational value.

Useful notifications:

```text
Incident submitted
Incident verified
Incident rejected
Incident assigned
Incident status changed
Incident resolved
Incident closed
New incident communication
```

In-app notifications are sufficient initially.

Email can be introduced later.

---

# 77. Search and Filtering

Search should support relevant incident properties such as:

```text
Incident ID
Title
Location
Category
```

Administrative users may additionally search by:

```text
Reporter
Assigned Official
Status
Priority
```

Filters may include:

```text
Status
Category
Priority
Location
Visibility
```

Do not build complicated filtering interfaces without need.

---

# 78. Analytics

Use analytics only when useful.

Potential Dean-level metrics:

```text
Total incidents
Open incidents
Resolved incidents
Average resolution time
Incidents by category
Incidents by location
```

Do not create meaningless vanity metrics.

---

# 79. Performance

Performance priorities:

```text
1. Efficient PostgreSQL queries
2. Efficient Django API responses
3. Proper pagination
4. Image optimization
5. Efficient Next.js rendering
6. Avoid unnecessary network requests
7. Avoid unnecessary JavaScript
8. Appropriate caching when justified
```

Do not add infrastructure merely for perceived performance.

---

# 80. Frontend Performance

Next.js pages should avoid unnecessary client-side rendering.

Prefer server rendering/static rendering where appropriate.

Use client components only when browser interactivity requires them.

Avoid unnecessarily downloading large libraries.

Optimize incident images before delivery where possible.

---

# 81. API Performance

API responses should contain only required information.

Avoid returning complete nested objects when a summary is sufficient.

For example, incident lists should not include the complete communication history of every incident.

---

# 82. Database Performance

Use:

```text
Indexes
Pagination
select_related
prefetch_related
Query optimization
Aggregation
```

where appropriate.

Avoid repeated database queries inside loops.

---

# 83. Vercel and Railway Performance

The split deployment:

```text
Next.js → Vercel
Django → Railway
PostgreSQL → Railway
```

is intentional.

Do not treat the separate frontend/backend hosting arrangement as an architectural problem by itself.

The most important network consideration is:

```text
Django
   ↔
PostgreSQL
```

These should remain close together.

---

# 84. Environment Configuration

Frontend and backend environment variables must be clearly separated.

Frontend may contain public configuration such as:

```text
NEXT_PUBLIC_API_URL
```

Backend must contain secrets such as:

```text
DJANGO_SECRET_KEY
DATABASE_URL
CLOUDINARY_API_SECRET
JWT_SECRET
EMAIL_PASSWORD
```

Never expose backend secrets through Next.js public environment variables.

---

# 85. Git Rules

Use descriptive commits.

Good:

```text
feat: add incident submission workflow
feat: add dean official account management
feat: add incident assignment
fix: prevent unauthorized private incident access
fix: validate incident status transitions
perf: optimize incident list queries
```

Avoid:

```text
update
changes
final
test
stuff
```

---

# 86. Database Migrations

Every model change must have a migration.

Use:

```bash
python manage.py makemigrations
python manage.py migrate
```

Do not casually delete migration files.

---

# 87. Testing Requirements

Test important business rules.

Minimum areas:

```text
Student roster import
Login with MC and CPM
Student password change
Login
Incident creation
Public/private visibility
Admin verification
Admin rejection
Dean assignment
Official access
Official progress updates
Official resolution
Dean closure
Unauthorized access
Rate-limited endpoints
```

Permission tests are especially important.

---

# 88. Minimum Permission Test Matrix

The application must ensure:

```text
Student
→ cannot verify

Student
→ cannot assign

Student
→ cannot close

Student
→ cannot manage users

Admin
→ cannot perform Dean-only operations

Official
→ cannot manage users

Official
→ cannot assign arbitrary incidents

Official
→ cannot close incidents

Dean
→ can perform authorized management operations
```

---

# 89. Before Modifying Existing Code

AI coding agents must inspect the relevant existing implementation before making changes.

At minimum inspect:

```text
Relevant model
Serializer
View/API endpoint
Permission class
Frontend page
Component
Types
Tests
```

Do not blindly rewrite large parts of the system.

---

# 90. Before Adding Dependencies

Before installing a new dependency, determine:

```text
Is it actually necessary?
Can existing framework functionality solve this?
Does it increase deployment complexity?
Does it create a security concern?
Does it increase bundle size?
```

Prefer existing functionality when practical.

---

# 91. Avoid Overengineering

Do not introduce:

```text
Microservices
Kafka
RabbitMQ
Redis Cluster
GraphQL
Kubernetes
Event Sourcing
CQRS
WebSockets
```

without a genuine requirement.

The application is a university incident management system, not a hyperscale distributed platform.

---

# 92. No Hidden Backdoors

Do not create undocumented administrative accounts.

Never hard-code:

```text
Dean credentials
Administrator passwords
Secret login routes
Privilege escalation endpoints
```

There must be no hidden way to become Dean.

---

# 93. Initial Dean Provisioning

The initial Dean account must be provisioned through a controlled deployment/administrative procedure.

Public registration must never allow a user to choose:

```text
DEAN
ADMIN
```

as their role.

After the initial Dean account exists:

```text
Dean
   ↓
Creates Official Accounts
```

---

# 94. Role Escalation Protection

Never trust a role value submitted from a client.

Bad:

```json
{
  "name": "John",
  "role": "DEAN"
}
```

unless the backend independently authorizes that operation.

Role assignment must be controlled entirely by the backend.

---

# 95. User Deactivation

When an official should no longer access the application:

```text
ACTIVE
   ↓
INACTIVE
```

Do not automatically delete the user if the user is referenced by historical incidents.

Historical operational relationships should remain valid.

---

# 96. Incident Data Ownership

Students can create incidents and track their own reports.

Operational control belongs to authorized university staff.

Students cannot change:

```text
verification result
official assignment
official priority
final resolution
closure status
```

unless the requirements explicitly change.

---

# 97. API Security Checklist

Before considering a sensitive API complete, verify:

```text
Authentication required?
Correct role required?
Object-level authorization?
Input validation?
Sensitive fields excluded?
Rate limiting where appropriate?
Error response safe?
Database query optimized?
```

---

# 98. Production Checklist

Before production deployment:

```text
DEBUG=False
Production SECRET_KEY configured
Production database configured
CORS restricted
HTTPS enabled
Allowed hosts configured
Environment variables configured
Cloudinary configured
Database migrations applied
Static/media configuration verified
Rate limiting configured
Authentication tested
Permissions tested
Private incident access tested
Public serializer reviewed
Frontend production API URL configured
```

---

# 99. UI Implementation Rule

When implementing UI, follow this sequence:

```text
1. Understand the user's task
2. Determine required information
3. Determine the primary action
4. Remove unnecessary elements
5. Apply DESIGN.md
6. Implement responsive behavior
7. Validate accessibility
```

Do not begin by adding decorative styling.

---

# 100. Definition of Done

A feature is complete only when:

```text
Backend works
Authorization is correct
Validation exists
Database behavior is correct
Frontend works
Responsive behavior works
Errors are handled
Relevant tests exist
Sensitive data is protected
No unrelated functionality is broken
```

A feature is not complete merely because the screen renders successfully.

---

# 101. AI Coding Agent Rules

Before making changes, an AI coding agent must:

```text
Read AGENTS.md
Read DESIGN.md for UI work
Inspect existing code
Identify affected roles
Identify affected APIs
Identify affected database models
Preserve existing business rules
Implement the smallest correct change
Run relevant tests
```

The agent must not:

```text
Invent major requirements
Add unnecessary infrastructure
Add Audit Logs
Add Redis without need
Add Celery without need
Add WebSockets without need
Create hidden admin accounts
Expose private incident data
Allow frontend-only authorization
Change Dean authority without explicit requirement
Introduce AI-slop UI
```

---

# 102. Ambiguous Requirements

When requirements are ambiguous, prefer this order:

```text
1. Explicit current project requirements
2. AGENTS.md
3. DESIGN.md
4. Existing implementation
5. Existing API contracts
6. Framework best practices
```

Do not invent major business behavior silently.

When assumptions are necessary, keep them consistent with the existing architecture.

---

# 103. Source of Truth

For engineering decisions:

```text
Project Requirements
      ↓
AGENTS.md
      ↓
DESIGN.md
      ↓
Existing Architecture
      ↓
Framework Best Practices
```

If a new explicit requirement conflicts with this document, the new requirement wins and `AGENTS.md` should subsequently be updated.

---

# 104. Final Architecture

The intended system is:

```text
                         PUBLIC USER
                              │
                              ▼
                         VERCEL
                         Next.js
                              │
                              │ HTTPS
                              ▼
                    RAILWAY DJANGO API
                              │
              ┌───────────────┼───────────────┐
              │               │               │
       Authentication     Permissions     Rate Limiting
              │               │
              └───────────────┼───────────────┘
                              │
                              ▼
                     RAILWAY POSTGRESQL
                              │
                              │
                              ▼
                         CLOUDINARY
                         Incident Images
```

Business workflow:

```text
                         STUDENT
                            │
                            ▼
                     Submit Incident
                            │
                            ▼
                     ┌─────────────┐
                     │    ADMIN    │
                     │   Review    │
                     └──────┬──────┘
                            │
                    ┌───────┴───────┐
                    ▼               ▼
                 REJECTED        VERIFIED
                                    │
                                    ▼
                                  DEAN
                                    │
                         Assign Responsible
                              Official
                                    │
                                    ▼
                           OFFICIAL
                                    │
                         ┌──────────┴──────────┐
                         ▼                     ▼
                   IN PROGRESS             Messages
                         │
                         ▼
                      RESOLVED
                         │
                         ▼
                        DEAN
                         │
                         ▼
                       CLOSED
```

---

# 105. Non-Negotiable Rules

The following rules must remain true unless the project requirements explicitly change:

1. Students may not self-register. They sign in with university MC and CPM numbers.
2. Officials may not self-register.
3. The Dean creates and manages official accounts.
4. The Dean has the highest application authority.
5. Backend authorization is mandatory.
6. Frontend authorization is never sufficient security.
7. Public incidents must not expose reporter personal information.
8. Private and restricted incidents must be protected at the API level.
9. Officials may work only on incidents they are authorized to access.
10. Officials can mark work as resolved.
11. The Dean closes incidents.
12. No dedicated Audit Log subsystem is required.
13. Redis is optional.
14. Caching is optional.
15. Celery is optional and unnecessary initially.
16. WebSockets are unnecessary initially.
17. Rate limiting should protect abuse-sensitive endpoints.
18. Next.js should be deployed on Vercel.
19. Django should be deployed on Railway.
20. PostgreSQL should be deployed on Railway close to Django.
21. Incident images should use Cloudinary.
22. UI must follow `DESIGN.md`.
23. The application must avoid AI-generated SaaS aesthetics.
24. The system must remain simple until real requirements justify additional infrastructure.

---

# END OF AGENTS.md
## Visual reference update — 8 September 2026

The current user request is to redesign the frontend to match https://www.sjp.ac.lk/.
Follow the current visual specification at the beginning of DESIGN.md for the
reference colors, typography, masthead, page layouts, and footer. This supersedes
older conflicting appearance examples only; application behavior and security
requirements above remain unchanged.

The university reference is visual only: do not copy university services, resource
links, contact details, or promotional content into the incident system.
