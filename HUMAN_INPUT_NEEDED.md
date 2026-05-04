# Human Input Required

## Before deploying to production, you need to provide:

### 1. Stripe (for billing)
- Create a Stripe account at stripe.com
- Create two products: "Pro Monthly" (19 USD/month) and "Pro Annual" (190 USD/year)
- Get your API keys from the Stripe Dashboard
- Set up a webhook endpoint pointing to your domain + /api/webhooks/stripe

Required env vars:
- STRIPE_SECRET_KEY=sk_live_...
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
- STRIPE_WEBHOOK_SECRET=whsec_...
- STRIPE_PRO_MONTHLY_PRICE_ID=price_...
- STRIPE_PRO_ANNUAL_PRICE_ID=price_...

### 2. Resend (for email notifications)
- Create a Resend account at resend.com
- Verify your sending domain
- Get your API key

Required env vars:
- RESEND_API_KEY=re_...
- EMAIL_FROM=noreply@yourdomain.com

### 3. Domain & Deployment
- Set NEXT_PUBLIC_APP_URL to your production domain
- The DATABASE_URL defaults to file:/data/app.db in the Docker container

### 4. Auth Secret
- Generate a secure AUTH_SECRET: openssl rand -base64 32
- The Dockerfile includes a default — override this in production!

### 5. Gmail Integration (future)
- When implementing Gmail receipt sync, you will need Google OAuth credentials
- GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from Google Cloud Console
- Enable Gmail API and request gmail.readonly scope

### 6. Cron Job
- Set CRON_SECRET to a random string
- Schedule a daily GET request to /api/cron/recompute with Bearer auth
- This runs recurring detection and anomaly detection across all workspaces
