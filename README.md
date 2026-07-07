# image-transform-worker

A Cloudflare Worker edge API that fetches remote images and transforms them on demand.

Current implementation focuses on **SVG → PNG** conversion using `@resvg/resvg-wasm`, with a modular route and processor structure ready for future formats (WebP, JPEG) and operations (resize, optimisation).

## Features

- Cloudflare Workers runtime + TypeScript
- REST-style endpoints:
  - `GET /svg-to-png/<encoded-image-url>`
  - `GET /transform/<format>/<encoded-image-url>`
- Optional query parameters:
  - `width`
  - `height`
  - `quality`
  - `background`
- Cloudflare Cache API integration for transformed results
- `Cache-Control` headers for edge/browser caching
- CORS support (`GET`, `OPTIONS`)
- URL validation and SSRF protections:
  - allow only `http`/`https`
  - block localhost/private/metadata IP targets
  - block `.local` hosts
- Source size limits (5MB)
- Graceful JSON error responses

## Project Structure

- `/src/index.ts` – Worker entrypoint and request pipeline
- `/src/routes/router.ts` – Route matching
- `/src/processors/svgToPng.ts` – SVG renderer module
- `/src/utils/*` – validation, options parsing, CORS, errors
- `/test/*.test.ts` – focused unit tests

## Setup

### Prerequisites

- Node.js 20+
- npm
- Cloudflare account (for deployment)

### Install

```bash
npm install
```

## Local Development

```bash
npm run dev
```

Wrangler will start a local Worker runtime.

## Build, Lint, and Test

```bash
npm run lint
npm run build
npm test
```

## Deployment (Wrangler)

1. Authenticate Wrangler:

```bash
npx wrangler login
```

2. Deploy:

```bash
npx wrangler deploy
```

## API Usage

### Convert SVG URL to PNG

```http
GET /svg-to-png/https%3A%2F%2Fexample.com%2Flogo.svg
```

### Convert with options

```http
GET /svg-to-png/https%3A%2F%2Fexample.com%2Flogo.svg?width=512&background=%23ffffff
```

### Generic transform route

```http
GET /transform/png/https%3A%2F%2Fexample.com%2Flogo.svg?width=512
```

> `png` is currently supported. The `/transform/<format>/...` route is designed to support future processors.

## Configuration

Copy the example env file if needed:

```bash
cp .dev.vars.example .dev.vars
```

Available optional variable:

- `BLOCKED_HOSTS`: Comma-separated hostnames to block during remote fetch validation.

## Supported Transformations

- ✅ SVG to PNG (`/svg-to-png/...`, `/transform/png/...`)
- 🚧 Planned: WebP/JPEG output, additional resizing/optimisation presets
