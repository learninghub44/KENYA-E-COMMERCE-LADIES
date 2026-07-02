function sanitizeInput(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

function sanitizeUrl(url: string): string {
  const allowedProtocols = ["https:", "http:", "mailto:", "tel:"]
  try {
    const parsed = new URL(url)
    if (!allowedProtocols.includes(parsed.protocol)) return ""
    return url
  } catch {
    if (url.startsWith("/") || url.startsWith("#")) return url
    return ""
  }
}

const cspConfig = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-eval'", "'unsafe-inline'", "https://*.googletagmanager.com"],
  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  "img-src": ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://*.googleusercontent.com", "https://avatars.githubusercontent.com"],
  "font-src": ["'self'", "https://fonts.gstatic.com"],
  "connect-src": ["'self'", "https://*.supabase.co"],
  "frame-src": ["'none'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
}

function buildCspHeader(): string {
  return Object.entries(cspConfig)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ")
}

function sanitizeFileName(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.\./g, ".")
    .substring(0, 255)
}

function isValidFileType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(mimeType)
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "")
}

export { sanitizeInput, sanitizeUrl, buildCspHeader, sanitizeFileName, isValidFileType, stripHtml, cspConfig }
