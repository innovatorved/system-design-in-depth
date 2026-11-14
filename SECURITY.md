# Security Policy

## Supported Versions

`system-design-in-depth` is deployed continuously from the `main` branch to `https://system-design-in-depth.vedgupta.in`. Security fixes are applied directly to `main`.

## Architecture & Threat Surface

- The platform is a static client-side site with **no server-side database, user accounts, or secret credentials**.
- Interactive build labs execute inside sandboxed browser Web Workers via `@innovatorved/code-lab`.
- Strict response headers (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Strict-Transport-Security`) are enforced via `_headers`.

## Reporting a Vulnerability

If you discover a security issue (such as an XSS vector in markdown/simulator rendering, CSP bypass, or sandbox escape):

1. **Please do not open a public GitHub issue.**
2. Report it privately via [GitHub Private Vulnerability Reporting](https://github.com/innovatorved/system-design-in-depth/security/advisories/new).
3. Include a minimal reproduction URL or payload and expected vs. actual behavior.

We aim to acknowledge reports within 72 hours and publish a fix promptly.
