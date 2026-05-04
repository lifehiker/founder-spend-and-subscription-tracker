const VENDOR_ALIASES: Record<string, string> = {
  openai: "openai",
  "open ai": "openai",
  "openai.com": "openai",
  anthropic: "anthropic",
  "anthropic.com": "anthropic",
  "claude.ai": "anthropic",
  aws: "aws",
  "amazon web services": "aws",
  "amazon aws": "aws",
  "aws.amazon": "aws",
  "amzn aws": "aws",
  google: "google",
  "google cloud": "google",
  "google llc": "google",
  "google *": "google",
  vercel: "vercel",
  "vercel.com": "vercel",
  notion: "notion",
  "notion.so": "notion",
  slack: "slack",
  "slack.com": "slack",
  "slack technologies": "slack",
  github: "github",
  "github.com": "github",
  "github, inc": "github",
  stripe: "stripe",
  "stripe.com": "stripe",
  netlify: "netlify",
  "netlify.com": "netlify",
  digitalocean: "digitalocean",
  "digital ocean": "digitalocean",
  "digitalocean.com": "digitalocean",
  figma: "figma",
  "figma.com": "figma",
  linear: "linear",
  "linear.app": "linear",
  zoom: "zoom",
  "zoom.us": "zoom",
  "zoom video": "zoom",
  loom: "loom",
  "loom.com": "loom",
  airtable: "airtable",
  "airtable.com": "airtable",
  dropbox: "dropbox",
  "dropbox.com": "dropbox",
  hubspot: "hubspot",
  "hubspot.com": "hubspot",
  intercom: "intercom",
  "intercom.io": "intercom",
  mixpanel: "mixpanel",
  "mixpanel.com": "mixpanel",
  amplitude: "amplitude",
  "amplitude.com": "amplitude",
  datadog: "datadog",
  "datadog.com": "datadog",
  "datadoghq": "datadog",
  sentry: "sentry",
  "sentry.io": "sentry",
  postmark: "postmark",
  "postmark.com": "postmark",
  "postmarkapp": "postmark",
  sendgrid: "sendgrid",
  "sendgrid.com": "sendgrid",
  twilio: "twilio",
  "twilio.com": "twilio",
  cloudflare: "cloudflare",
  "cloudflare.com": "cloudflare",
  replicate: "replicate",
  "replicate.com": "replicate",
  heroku: "heroku",
  "heroku.com": "heroku",
  mongodb: "mongodb",
  "mongodb.com": "mongodb",
  "mongo atlas": "mongodb",
  supabase: "supabase",
  "supabase.com": "supabase",
  planetscale: "planetscale",
  "planetscale.com": "planetscale",
  railway: "railway",
  "railway.app": "railway",
  render: "render",
  "render.com": "render",
  "fly.io": "fly",
  flyio: "fly",
};

export function normalizeMerchant(raw: string): string {
  // Clean the raw string
  let cleaned = raw.toLowerCase();
  // Remove common card suffixes like "TST*", "SQ *", "*"
  cleaned = cleaned.replace(/^(tst\*|sq \*|sq\*|pp\*|paypal\s*\*)/i, "");
  // Remove trailing numbers (last4 digits), dates
  cleaned = cleaned.replace(/\s+\d{4,}\s*$/, "");
  // Remove special characters except spaces and dots
  cleaned = cleaned.replace(/[^a-z0-9\s.]/g, " ");
  // Collapse multiple spaces
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  // Remove trailing .com, .io etc for matching
  const withoutTld = cleaned.replace(/\.(com|io|app|net|org|us|co)$/g, "");

  // Check aliases
  for (const [alias, key] of Object.entries(VENDOR_ALIASES)) {
    if (cleaned.includes(alias) || withoutTld.includes(alias)) {
      return key;
    }
  }

  // Return a normalized version of the cleaned string
  return withoutTld || cleaned;
}

export function getVendorDisplayName(normalizedKey: string): string {
  const displayNames: Record<string, string> = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    aws: "Amazon Web Services",
    google: "Google",
    vercel: "Vercel",
    notion: "Notion",
    slack: "Slack",
    github: "GitHub",
    stripe: "Stripe",
    netlify: "Netlify",
    digitalocean: "DigitalOcean",
    figma: "Figma",
    linear: "Linear",
    zoom: "Zoom",
    loom: "Loom",
    airtable: "Airtable",
    dropbox: "Dropbox",
    hubspot: "HubSpot",
    intercom: "Intercom",
    mixpanel: "Mixpanel",
    amplitude: "Amplitude",
    datadog: "Datadog",
    sentry: "Sentry",
    postmark: "Postmark",
    sendgrid: "SendGrid",
    twilio: "Twilio",
    cloudflare: "Cloudflare",
    replicate: "Replicate",
  };

  return displayNames[normalizedKey] ?? normalizedKey
    .split(/[-_\s]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
