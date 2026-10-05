# Ninja ScamShield - AI Email Threat & Fraud Detection

A modern Vue 3 web interface for classifying scam, phishing, malware, and financial fraud emails via remote **Ninja REST API** calls.

## Features

- **Folder Batch Scanner**: Select a local directory containing `.eml` files; all messages are parsed and analyzed sequentially against the remote Ninja API.
- **Form Composer & Raw MIME Ingestion**: Cut & paste an email body or full RFC-822 headers for instant classification.
- **Threat Intelligence**: Dynamic 0–4 score radial gauge, Gemma/Jev AI reasoning summaries, extracted Indicators of Compromise (suspicious URLs, domain spoofing, flagged attachment hashes), and SPF/DKIM/DMARC authentication checks.
- **API Key & Remote Hosting Support**: Configurable remote Ninja API URL and API Key with automatic browser `localStorage` persistence and environment variable support.
- **Real-Time Dynamic Stats**: Summaries (Total Scanned, Scam/Threats, Benign/Safe, Average Score) appear only after actual scans are executed.

---

## Configuration & Environment Variables

You can configure your remote Ninja endpoint and API key either directly in the web UI (via the **Config & API Key** panel in the navbar) or by setting environment variables in `frontend-vue/.env`:

```env
# URL where your remote Ninja API is hosted
VITE_NINJA_API_URL=https://ninja-api.yourdomain.com

# Ninja API Key / Bearer token
VITE_NINJA_API_KEY=your_api_key_here
```

See [`frontend-vue/.env.example`](frontend-vue/.env.example) for reference.

---

## Getting Started

### 1. Install Dependencies
```sh
cd frontend-vue
npm install
```

### 2. Run the Development Server
```sh
npm run dev
```
Open **http://localhost:3000** (or http://localhost:3001) in your browser.

### 3. Build for Production
```sh
npm run build
```

---

## Sample Test Emails

Test `.eml` messages are provided in the [`sample_emails/`](sample_emails/) directory for testing folder batch scanning:
- `paypal_urgent_suspension.eml` (Phishing)
- `ceo_wire_transfer_bec.eml` (Financial Fraud / BEC)
- `dhl_package_trojan.eml` (Malware Dropper)
- `bitcoin_blackmail_threat.eml` (Extortion)
- `github_dependabot_advisory.eml` (Benign Advisory)
