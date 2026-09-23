# Application Security Testing Checklist

## Purpose

This document defines a thorough security-testing plan for the application. It is intended for testing systems you own or are explicitly authorized to assess.

The goal is to identify vulnerabilities across authentication, authorization, APIs, data handling, secrets, databases, frontend behavior, infrastructure, dependencies, and deployment configuration.

---

# 1. Testing Principles

- Test only authorized environments and accounts.
- Prefer a staging/development environment over production.
- Use synthetic/test accounts and non-sensitive test data.
- Never expose real credentials in test reports.
- Do not intentionally destroy data or disrupt availability.
- Record every finding with:
  - Vulnerability
  - Affected endpoint/component
  - Preconditions
  - Reproduction steps
  - Expected behavior
  - Actual behavior
  - Severity
  - Recommended remediation
- Retest every fixed vulnerability.

### Severity

| Severity | Meaning |
|---|---|
| Critical | Direct compromise, authentication bypass, arbitrary server-side execution, or major sensitive-data exposure |
| High | Significant unauthorized access, privilege escalation, or sensitive data access |
| Medium | Limited unauthorized access, security-control bypass, or meaningful information disclosure |
| Low | Minor weakness with limited practical impact |
| Informational | Hardening opportunity or security observation |

---

# 2. Authentication Testing

## 2.1 Registration

- [ ] Can users register without required fields?
- [ ] Can invalid email addresses be registered?
- [ ] Can duplicate accounts be created?
- [ ] Is email verification enforced where required?
- [ ] Can users manipulate the registration workflow to skip onboarding?
- [ ] Can a user select an unauthorized role?
- [ ] Can a user change their role from `STUDENT` to `TEACHER` or another privileged role?
- [ ] Are onboarding steps enforced server-side?
- [ ] Can registration endpoints be abused for account enumeration?
- [ ] Is rate limiting applied?
- [ ] Are disposable/test emails handled according to product requirements?

## 2.2 Login

- [ ] Invalid credentials fail safely.
- [ ] No sensitive information is returned in error messages.
- [ ] Login attempts are rate limited.
- [ ] Brute-force protection exists.
- [ ] Session creation occurs only after successful authentication.
- [ ] Authentication state cannot be forged through client-side values.
- [ ] Redirect URLs cannot be abused for open redirects.

## 2.3 Session Management

- [ ] Session tokens are not exposed to JavaScript unnecessarily.
- [ ] Cookies use `Secure` where applicable.
- [ ] Cookies use `HttpOnly` where applicable.
- [ ] Cookies use appropriate `SameSite` settings.
- [ ] Logout invalidates/revokes the session where appropriate.
- [ ] Expired sessions cannot access protected resources.
- [ ] A previously authenticated session cannot access another account after logout/login.
- [ ] Session fixation is prevented.
- [ ] Sensitive operations require appropriate re-authentication where necessary.

## 2.4 Clerk Authentication

For Clerk-based authentication:

- [ ] Every protected server route validates the Clerk session.
- [ ] Backend authorization does not trust client-side Clerk state alone.
- [ ] User IDs are obtained from the authenticated server-side session.
- [ ] Webhook signatures are verified.
- [ ] Clerk webhook events are handled idempotently.
- [ ] Deleted/suspended users cannot continue accessing protected application resources.
- [ ] Role information cannot be modified by manipulating frontend state.
- [ ] Redirect parameters are validated.

---

# 3. Authorization Testing

Authorization vulnerabilities are particularly important because authentication only proves **who** the user is; authorization determines **what they are allowed to do**.

## 3.1 Horizontal Privilege Escalation

Test with two different users:

```text
User A
User B
```

- [ ] User A cannot access User B's profile.
- [ ] User A cannot modify User B's profile.
- [ ] User A cannot access User B's interviews.
- [ ] User A cannot access User B's resumes.
- [ ] User A cannot access User B's projects.
- [ ] User A cannot access User B's generated resources.
- [ ] User A cannot access User B's private files.
- [ ] User A cannot access User B's recommendations.

Test changing resource identifiers:

```text
/api/users/<USER_A>
→
/api/users/<USER_B>
```

Authorization must be checked server-side for every resource.

## 3.2 Vertical Privilege Escalation

Test:

```text
STUDENT
TEACHER
ADMIN
```

- [ ] Student cannot access teacher-only APIs.
- [ ] Student cannot access admin APIs.
- [ ] Teacher cannot access admin APIs.
- [ ] Role cannot be changed through request-body manipulation.
- [ ] Role cannot be changed through query parameters.
- [ ] Role cannot be changed through client-side state.
- [ ] Hidden frontend buttons are not treated as authorization controls.
- [ ] Server-side role checks exist for privileged operations.

---

# 4. IDOR / BOLA Testing

Test every endpoint accepting identifiers.

Examples:

```text
/project/:projectId
/interview/:interviewId
/resume/:resumeId
/profile/:profileId
```

Attempt to replace an ID with another valid user's ID.

Check:

- [ ] GET
- [ ] POST
- [ ] PUT
- [ ] PATCH
- [ ] DELETE

A resource must be accessible only when the authenticated user is authorized to access it.

---

# 5. API Security

## 5.1 Endpoint Discovery

Inventory:

- [ ] Public endpoints
- [ ] Authenticated endpoints
- [ ] Teacher endpoints
- [ ] Student endpoints
- [ ] Admin endpoints
- [ ] Webhooks
- [ ] Internal APIs
- [ ] Cron/Trigger jobs
- [ ] Upload endpoints
- [ ] AI/LLM endpoints

For every endpoint document:

```text
Method
Path
Authentication required?
Role required?
Input
Output
Rate limit
Sensitive data returned?
```

## 5.2 HTTP Method Testing

For each protected endpoint test whether changing:

```text
GET
POST
PUT
PATCH
DELETE
```

can bypass authorization.

Example:

```http
GET /api/profile/123
```

should not become exploitable simply by switching to:

```http
DELETE /api/profile/123
```

## 5.3 Parameter Tampering

Test manipulation of:

- [ ] userId
- [ ] role
- [ ] email
- [ ] ownership fields
- [ ] price
- [ ] status
- [ ] permissions
- [ ] completion state
- [ ] IDs
- [ ] timestamps

Never trust security-sensitive values supplied by the client.

---

# 6. Injection Testing

## 6.1 SQL Injection

Test every user-controlled database query.

Look for unsafe patterns such as string concatenation:

```ts
`SELECT * FROM users WHERE email = '${email}'`
```

Use parameterized queries/prepared statements.

Test inputs such as:

```text
'
"
' OR '1'='1
```

Do not perform destructive database testing.

## 6.2 NoSQL Injection

For MongoDB, test whether request bodies can inject query operators.

Potentially dangerous structures include:

```json
{
  "email": {
    "$ne": null
  }
}
```

and:

```json
{
  "$or": []
}
```

- [ ] User input is validated.
- [ ] Unexpected MongoDB operators are rejected.
- [ ] Query objects are not directly constructed from request bodies.
- [ ] Authentication queries cannot be manipulated.

## 6.3 Command Injection

Check whether user input reaches:

- shell commands
- child processes
- system utilities
- deployment scripts

User-controlled input must never be concatenated into shell commands.

## 6.4 LDAP Injection

Only applicable if LDAP is used.

## 6.5 Template Injection

Test user-controlled data passed into:

- server-side templates
- email templates
- document generation
- AI prompts
- dynamic rendering systems

---

# 7. Cross-Site Scripting (XSS)

Test:

- [ ] Reflected XSS
- [ ] Stored XSS
- [ ] DOM-based XSS

Potential locations:

- profile names
- bios
- teacher descriptions
- resume content
- interview answers
- comments
- search parameters
- URL parameters

Use harmless test payloads in authorized environments, for example:

```html
<script>alert('XSS')</script>
```

Also test HTML attribute contexts and URL contexts.

- [ ] React escaping is preserved.
- [ ] `dangerouslySetInnerHTML` is reviewed.
- [ ] HTML sanitization exists where HTML is intentionally supported.
- [ ] User-generated Markdown/HTML is sanitized.

---

# 8. CSRF Testing

For state-changing endpoints:

```text
POST
PUT
PATCH
DELETE
```

check:

- [ ] Appropriate SameSite cookie configuration.
- [ ] CSRF protection where required.
- [ ] Origin/Referer validation where appropriate.
- [ ] APIs using bearer tokens are designed appropriately.
- [ ] Cross-origin requests are restricted.

---

# 9. CORS Testing

Check:

- [ ] No unrestricted production CORS unless intentionally required.
- [ ] `Access-Control-Allow-Origin: *` is not combined with credentials.
- [ ] Only trusted origins are allowed.
- [ ] Preflight behavior is correct.
- [ ] Development origins are not accidentally allowed in production.

---

# 10. API Key and Secret Exposure

## 10.1 Source Code

Search the repository for:

```text
API_KEY
SECRET
PASSWORD
TOKEN
PRIVATE_KEY
DATABASE_URL
MONGODB_URI
STRIPE_SECRET
OPENAI_API_KEY
GEMINI_API_KEY
GROQ_API_KEY
CLERK_SECRET
```

- [ ] No production secrets committed to Git.
- [ ] No secrets in `.env.example`.
- [ ] No secrets in frontend source.
- [ ] No secrets in logs.
- [ ] No secrets in error responses.
- [ ] No secrets in URLs.
- [ ] No secrets embedded in generated files.

## 10.2 Git History

Check the complete repository history, not only the current files.

```bash
git log --all --full-history
```

Use secret-scanning tooling where appropriate.

If a real secret was committed:

1. Revoke/rotate it immediately.
2. Remove it from repository history.
3. Verify the replacement secret is not exposed.
4. Check CI/CD logs and deployment artifacts.

## 10.3 Frontend Exposure

Remember:

```text
NEXT_PUBLIC_*
```

variables are intentionally exposed to browsers.

Never put:

```text
DATABASE_PASSWORD
CLERK_SECRET_KEY
STRIPE_SECRET_KEY
PRIVATE_API_KEY
```

in public environment variables.

---

# 11. Sensitive Data Exposure

Check API responses for:

- [ ] Password hashes
- [ ] Authentication tokens
- [ ] API keys
- [ ] Database credentials
- [ ] Internal IDs
- [ ] Private profile information
- [ ] Other users' data
- [ ] Internal error details
- [ ] Stack traces
- [ ] LLM provider credentials
- [ ] Private file URLs

Return only fields required by the client.

---

# 12. Database Security

## MongoDB

- [ ] Database users use strong passwords.
- [ ] Least-privilege database permissions are used.
- [ ] Database is not publicly exposed unnecessarily.
- [ ] Network access is restricted where practical.
- [ ] Application uses TLS.
- [ ] Production credentials are separate from development credentials.
- [ ] Database backups are protected.
- [ ] Sensitive fields are protected appropriately.
- [ ] User ownership checks exist before CRUD operations.

## Prisma / SQL

- [ ] Parameterized queries are used.
- [ ] Raw SQL is reviewed.
- [ ] Database user has minimum required privileges.
- [ ] Production database credentials are protected.

---

# 13. File Upload Security

If the application supports uploads:

- [ ] Validate file type.
- [ ] Validate MIME type server-side.
- [ ] Validate extension server-side.
- [ ] Enforce file-size limits.
- [ ] Generate safe filenames.
- [ ] Prevent path traversal.
- [ ] Do not trust client-provided filenames.
- [ ] Scan files where appropriate.
- [ ] Prevent executable files where unnecessary.
- [ ] Verify access permissions for private files.
- [ ] Ensure private storage URLs cannot be accessed by unauthorized users.

Test filenames such as:

```text
../../test.txt
../../../file
```

and unusual extensions.

---

# 14. Path Traversal

Test endpoints accepting filenames or paths.

Examples:

```text
../
../../
..%2F
%2e%2e%2f
```

Verify users cannot access arbitrary server files.

---

# 15. SSRF

If the application fetches URLs supplied by users, test:

- [ ] Internal network addresses
- [ ] Localhost
- [ ] Cloud metadata endpoints
- [ ] Private IP ranges
- [ ] Redirect chains

Implement URL allowlisting where possible.

Do not test cloud metadata endpoints against production infrastructure without explicit authorization.

---

# 16. Open Redirect

Test:

```text
/sign-in?redirect_url=https://example.com
```

Verify redirects are restricted to trusted application URLs.

Avoid accepting arbitrary external destinations.

---

# 17. Rate Limiting and Abuse Protection

Apply appropriate limits to:

- [ ] Login
- [ ] Registration
- [ ] Password recovery
- [ ] OTP/email verification
- [ ] AI generation
- [ ] Interview generation
- [ ] Resume generation
- [ ] File uploads
- [ ] Expensive API operations
- [ ] Webhooks where appropriate

Test whether an attacker can repeatedly trigger expensive LLM/API operations.

For AI applications, rate limiting is especially important because unauthorized requests can generate significant provider costs.

---

# 18. AI/LLM Security

If the application uses Gemini, Groq, OpenAI, or other providers:

## Prompt Injection

Test whether user-controlled content can manipulate system instructions.

Sources include:

- Resume text
- Interview answers
- Uploaded documents
- Teacher descriptions
- Job descriptions
- External resources

## Data Leakage

Verify prompts do not accidentally contain:

- API keys
- database credentials
- other users' data
- private system instructions
- internal application data

## Tool/Function Abuse

If the LLM can call tools:

- [ ] Validate tool arguments server-side.
- [ ] Enforce authorization independently of the model.
- [ ] Never allow the model to decide user permissions.
- [ ] Restrict dangerous tools.
- [ ] Log tool execution.

## Cost Abuse

- [ ] Authenticate expensive AI endpoints.
- [ ] Rate limit requests.
- [ ] Set provider-side usage limits.
- [ ] Validate maximum input size.
- [ ] Prevent users from controlling unlimited token generation.

---

# 19. Webhook Security

For Clerk, Stripe, or other webhooks:

- [ ] Verify webhook signatures.
- [ ] Reject unsigned requests.
- [ ] Validate event types.
- [ ] Validate payload structure.
- [ ] Implement idempotency.
- [ ] Prevent replay attacks where applicable.
- [ ] Do not trust user-provided webhook metadata.
- [ ] Return appropriate HTTP status codes.

---

# 20. Business Logic Testing

Security bugs often exist even when authentication is implemented correctly.

Test:

- [ ] Can a user complete an action without completing required onboarding?
- [ ] Can a student access teacher-only functionality?
- [ ] Can a teacher impersonate another teacher?
- [ ] Can users manipulate subscription status?
- [ ] Can users bypass usage limits?
- [ ] Can users repeatedly claim one-time rewards?
- [ ] Can users modify completion status directly?
- [ ] Can users skip required payment/verification steps?
- [ ] Can users reuse expired resources?
- [ ] Can users submit the same operation repeatedly?

Never rely on frontend restrictions for business rules.

---

# 21. Security Headers

Verify production responses contain appropriate headers.

Review:

```text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
X-Frame-Options
```

Do not blindly copy a CSP; configure it according to the application's actual requirements.

---

# 22. Error Handling

Verify production errors do not reveal:

- [ ] Stack traces
- [ ] Database queries
- [ ] File paths
- [ ] Environment variables
- [ ] API keys
- [ ] Internal service URLs
- [ ] Framework internals
- [ ] User information

Use generic production error responses and detailed server-side logging.

---

# 23. Dependency Security

Run:

```bash
npm audit
```

Also inspect:

```bash
npm outdated
```

Review:

- [ ] Critical vulnerabilities
- [ ] High-severity vulnerabilities
- [ ] Abandoned dependencies
- [ ] Unnecessary packages
- [ ] Suspicious packages
- [ ] Transitive dependencies

Use automated dependency scanning in CI.

---

# 24. GitHub Security

Enable:

- [ ] Secret scanning
- [ ] Push protection
- [ ] Dependabot alerts
- [ ] Dependabot security updates
- [ ] Branch protection
- [ ] Required pull-request reviews for important branches
- [ ] CI security checks

Never commit:

```text
.env
.env.local
.env.production
credentials.json
private keys
service-account JSON
```

Use `.gitignore`.

---

# 25. Vercel / Deployment Security

Check:

- [ ] Production secrets are stored only in Vercel environment variables.
- [ ] Preview deployments don't receive unnecessary production secrets.
- [ ] Development secrets are separated from production.
- [ ] Debug mode is disabled in production.
- [ ] Source maps are reviewed for sensitive information.
- [ ] Server-only environment variables remain server-side.
- [ ] Deployment logs do not contain credentials.
- [ ] Old deployments cannot expose sensitive environment configuration.
- [ ] API routes enforce authentication independently of frontend routing.

---

# 26. Next.js Security

Review:

- [ ] Server Actions authorization.
- [ ] Route Handler authorization.
- [ ] Middleware is not the only authorization layer.
- [ ] Server Components don't expose secrets to Client Components.
- [ ] Sensitive data is not passed into client components unnecessarily.
- [ ] `NEXT_PUBLIC_*` variables contain only public information.
- [ ] Dynamic routes validate ownership.
- [ ] Redirect destinations are validated.
- [ ] File/system access is restricted.

---

# 27. Logging and Monitoring

Logs should help detect attacks without exposing secrets.

Log appropriate security events:

- Login failures
- Account creation
- Role changes
- Permission changes
- Suspicious access attempts
- Excessive API usage
- Webhook failures
- Administrative actions

Do not log:

```text
Passwords
Session tokens
API keys
Database credentials
Full authentication headers
Sensitive personal data
```

---

# 28. Security Regression Tests

Create automated tests for every discovered vulnerability.

Example:

```text
test("student cannot access admin endpoint")
test("user cannot access another user's interview")
test("teacher cannot modify another teacher's profile")
test("unauthenticated user cannot access protected route")
test("role cannot be changed through request body")
test("private resource cannot be accessed without ownership")
```

Security fixes should become permanent automated tests whenever practical.

---

# 29. Final Security Checklist

Before production release:

- [ ] Authentication tested
- [ ] Authorization tested
- [ ] IDOR/BOLA tested
- [ ] Role escalation tested
- [ ] API endpoints reviewed
- [ ] SQL injection tested
- [ ] NoSQL injection tested
- [ ] XSS tested
- [ ] CSRF reviewed
- [ ] CORS reviewed
- [ ] SSRF reviewed
- [ ] Path traversal tested
- [ ] File uploads tested
- [ ] Secrets scanned
- [ ] Git history scanned
- [ ] API key exposure checked
- [ ] Database permissions reviewed
- [ ] Webhooks verified
- [ ] Rate limits tested
- [ ] AI prompt injection tested
- [ ] AI cost abuse tested
- [ ] Sensitive response data reviewed
- [ ] Security headers reviewed
- [ ] Error handling reviewed
- [ ] Dependencies scanned
- [ ] Vercel configuration reviewed
- [ ] Clerk configuration reviewed
- [ ] Security logging reviewed
- [ ] Critical findings fixed
- [ ] High findings fixed or formally accepted
- [ ] Regression tests added

---

# 30. Recommended Testing Order

For an application using Clerk + Next.js + MongoDB + Vercel + AI APIs, prioritize testing in this order:

```text
1. Authentication
        ↓
2. Authorization / RBAC
        ↓
3. IDOR / BOLA
        ↓
4. API endpoint security
        ↓
5. Secrets / API-key exposure
        ↓
6. Database / NoSQL injection
        ↓
7. XSS
        ↓
8. File uploads / storage
        ↓
9. Webhooks
        ↓
10. Rate limiting / abuse
        ↓
11. AI prompt injection / data leakage
        ↓
12. Business logic
        ↓
13. Deployment configuration
        ↓
14. Dependencies
        ↓
15. Security regression tests
```

The highest-value principle is:

> **Never trust security-sensitive data supplied by the client.**

A user can modify JavaScript, API requests, request bodies, headers, URLs, cookies, and frontend state. Authentication, authorization, ownership, role, pricing, limits, and other security-sensitive decisions must ultimately be validated on the server.
