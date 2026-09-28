# Widget embedding guide

```html
<script
  src="https://status.example/widget/v1/widget.js"
  data-service="my-service"
  data-poll-interval-ms="60000"
  data-target="#status-banner-slot"
  async
></script>
```

## Attributes

| Attribute | Required | Default | Purpose |
|---|---|---|---|
| `data-service` | yes | — | The registered service slug to check. |
| `data-poll-interval-ms` | no | `60000` | Poll interval in milliseconds (minimum `15000`). |
| `data-target` | no | inserted after the `<script>` tag | CSS selector for the element the banner renders into. |

The widget renders inside a shadow root, so it does not inherit the host page's CSS. A failed status
fetch is ignored silently and does not affect the host page.
