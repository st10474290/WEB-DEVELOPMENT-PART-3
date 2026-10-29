# Trecia's Grill — WEDE5020 Part 3 (GitHub work intentionally excluded)

## Project overview
A responsive multi-page restaurant website for the WEDE5020 Part 3 task. It contains six main pages plus `index.html` for static hosting: Home, About, Services, Dishes, Order/Enquiry, and Contact.

## Run and test locally
Because service cards are loaded from `data/services.json`, run through a local HTTP server rather than opening a file directly:

1. Extract this folder.
2. Open a terminal in `Trecias_Grill_Part2`.
3. Run `python -m http.server 8000`.
4. Open `http://localhost:8000/`.

No package build is needed. Leaflet map tiles and AJAX form submissions require an internet connection.

## Part 3 requirements implemented in the code
- **Interactive elements:** responsive mobile navigation; accessible image lightbox/modal; expandable interactions can be added through the shared `data-accordion-trigger` / `aria-controls` pattern; visible hover/focus transitions and motion with reduced-motion support.
- **Interactive map:** Leaflet map using OpenStreetMap tiles with approximate Pretoria and Johannesburg service-area markers. The map explicitly does not claim a verified restaurant street address.
- **Dynamic content:** service cards load from `data/services.json` using `fetch`, with a JavaScript fallback.
- **Search and sort:** dish gallery supports live filtering and alphabetical A–Z/Z–A sorting.
- **Lightbox:** dish images open in an enlarged accessible overlay; close button, Escape, backdrop, keyboard activation and focus restoration are supported.
- **Menu and estimate calculator:** sample per-portion prices and live ZAR total/portion count. Estimates are not confirmed restaurant prices.
- **Forms:** enquiry and contact forms use HTML5 constraints plus inline validation messages. They submit asynchronously using `fetch` (AJAX) to FormSubmit's AJAX endpoint and display success/failure status.
- **Spam mitigation:** hidden honeypot field; provider-side activation/captcha behaviour may apply.
- **SEO:** page-specific title/description/keywords; Open Graph and Twitter metadata; Restaurant JSON-LD; semantic headings; descriptive image names and alt text; internal navigation; skip link; lazy-loaded images; responsive `srcset` WebP variants; `robots.txt` and `sitemap.xml`.
- **Performance/accessibility:** WebP responsive variants, lazy loading, async decoding, keyboard support, status announcements and `prefers-reduced-motion` handling.
- **Off-page support:** share links are included, but actual social promotion and backlinks require the live website URL, social accounts and external publishers; they cannot be created honestly inside a local ZIP.

## Deployment status
This ZIP is prepared for static hosting, but it has **not** been published to a live host. Deployment needs the owner to create/use a hosting account and upload the site. Since no confirmed public domain was supplied, the sitemap, robots sitemap reference and Facebook share URL intentionally contain `YOUR-PUBLISHED-DOMAIN` placeholders.

## Before publishing (required actions outside the code)
1. **Confirm all business facts:** confirm the correct restaurant address, phone number, email addresses, menu prices, services and service areas. The existing source files contained sample or unverified details. The two map markers are approximate city centres, not restaurant locations.
2. **Activate the form recipients:** this project uses FormSubmit AJAX endpoints for `bookings@trecias.co.za` and `info@trecias.co.za`. On first use, the mailbox owner may need to confirm activation with FormSubmit. Test submissions from a live hosted website. If these are not real/controlled inboxes, replace them with the correct recipients before launch. Do not claim a message was sent if the endpoint reports an error.
3. **Set the published domain:** replace every `YOUR-PUBLISHED-DOMAIN` placeholder in `sitemap.xml`, `robots.txt` and the Facebook share URL with the actual public domain. The sitemap cannot be finalised without that URL.
4. **Deploy:** publish this folder to a static host such as Netlify Drop or another free static host. A hosting account and a user action are required; no website has been deployed from this ZIP.
5. **Verify SEO and performance:** after deployment, test sitemap and robots URLs, add the site to Google Search Console, inspect structured data, and measure performance with Lighthouse/PageSpeed Insights.
6. **Off-page SEO:** share the public site from real business social profiles and request relevant, genuine local-business/partner links. Do not buy spam backlinks.
7. **Responsive testing evidence:** capture screenshots at desktop, tablet and mobile sizes and add them to the documentation after actual browser testing.

## Changelog
- 2026-10-27: Rebuilt Part 3 functionality beyond the earlier update: added JSON-driven service loading; gallery sorting; Leaflet/OpenStreetMap service-area map; AJAX form submission and response/error handling; custom inline validation; responsive WebP image variants and `srcset`; social share links; Open Graph/Twitter tags; Restaurant JSON-LD; accessibility skip links; motion/reduced-motion support; improved SEO files and this deployment/testing checklist.
- 2026-10-27: Retained Part 2 site structure and visual styling; added dish lightbox, live gallery search, sample menu prices and live order estimate calculator.

## Pricing notice
The displayed values (Beef Stew R65, Pap & Chakalaka R35, Samp & Beans R45, African Spiced Chicken R75, African Beef R70 and Vetkoek R20) are sample values for assignment demonstration and must be confirmed by the restaurant before the site is public.

## References 

## AI assistance disclosure reminder
The assignment brief requires AI tools to be referenced according to the IIE guidelines, including an AI disclosure annexure and screenshots where required. Add your own disclosure and evidence in the format specified by your lecturer. Review, test and understand all code before submission.
