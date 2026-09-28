# service-status-notice

A small server that shows a status/maintenance notice for other services. It supports three
integration modes:

| Mode | Trigger | Identity source | Endpoint | Auth |
|---|---|---|---|---|
| A — full-page replacement | Reverse proxy intercepts a 502/503/504 | `?service=` query, else `Host` header | `GET /notice` | none |
| B — direct status lookup | Your own backend or tooling calls it | `?service=` query (required) | `GET /api/v1/status` | none, rate-limited |
| C — embeddable widget | A `<script>` tag on your page | `data-service` attribute | `GET /widget/v1/widget.js` | none |

## Quick start

```bash
git clone <this repo>
cd service-status-notice
npm install
npm run build && npm start
```

No separate migration step is required — the SQLite database is created and migrated automatically
on boot.

## Integration guide

**Mode A — reverse proxy:**

```nginx
location / {
    proxy_pass http://upstream_service;
    proxy_intercept_errors on;
    error_page 502 503 504 = @service_notice;
}
location @service_notice {
    proxy_pass http://notice_server/notice;
    proxy_set_header X-Forwarded-Host $host;
}
```

**Mode A — self-detected redirect:**

```ts
if (!isHealthy) return Response.redirect('https://status.example/notice?service=my-service', 302)
```

**Mode C — embeddable widget:**

```html
<script src="https://status.example/widget/v1/widget.js"
        data-service="my-service" data-poll-interval-ms="60000"
        data-target="#status-banner-slot" async></script>
```

Full contract details: [docs/contract/openapi.yaml](docs/contract/openapi.yaml).

## API versioning

Three independent version spaces: the HTTP contract (`/api/v{N}`, `/widget/v{N}/`), the DB schema
(Drizzle migrations), and the package (semver). Breaking contract changes ship as a new version path
alongside the old one, which stays available for at least 90 days.

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `NOTICE_DB_PATH` | `./data/notice.sqlite3` | SQLite file location |
| `PORT` | `3000` | HTTP port |

## Development

```bash
npm install
npm run dev
npm test
npm run gen:contract   # after changing src/contract/v1/schemas.ts
```

## License

MIT — see [LICENSE](LICENSE).
