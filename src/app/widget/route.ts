const LATEST_WIDGET_VERSION = 'v1'

export function GET(request: Request): Response {
  const url = new URL(request.url)
  url.pathname = `/widget/${LATEST_WIDGET_VERSION}/widget.js`
  return Response.redirect(url, 302)
}
