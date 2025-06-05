Pat’s Home Poker Game Website
Overview
This is a static, responsive website built to provide a clean and accessible resource for players of a home poker game. It features hand rankings, house rules, etiquette, and more - all presented in a mobile-friendly and performant layout.

Features
 - Responsive Design: Custom CSS Grid layout for mobile and desktop.

 - Security Headers: Strict security headers including CSP, HSTS, and more.

 - Performance Optimized: Fingerprinted assets with long-term cache control.

 - Cloudflare Pages Hosting: Deployed on Cloudflare Pages for global CDN delivery.

 - Mobile First: Designed with mobile-first media queries and testing across browsers.

Technical Details
Static Site: Built with HTML, CSS, and JS; no backend currently.

Asset Fingerprinting: CSS/JS files are hashed (style.abc123.css) and injected into HTML automatically for cache-busting.

_headers File: Sets strict HTTP headers for both security and caching.

Deployment: Git-based deployment to Cloudflare Pages.

Tooling: Custom script to handle hash generation and HTML updates.

Security
Content-Security-Policy: Limits external resource loading to protect against XSS.

Strict-Transport-Security: Enforces HTTPS connections.

X-Frame-Options, X-Content-Type-Options, and Referrer-Policy: Additional layers of browser-side protection.

License
© 2025 Pat’s Home Poker Game. All rights reserved.

This site is a personal project and not commercially affiliated. The copyright notice is informational, no formal registration is implied.
