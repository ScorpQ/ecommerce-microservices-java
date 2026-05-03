# Minimal E-Commerce Design System

## Direction

This storefront uses a quiet, workmanlike retail interface: clear product data, visible actions, and restrained visual styling. It should feel like a real shop UI, not a generated landing page.

## Visual Rules

- Use white, slate, and muted gray as the main surface system.
- Use one primary action color: deep slate. Muted teal can appear only as a small supportive status color.
- Apply the 60/30/10 rule across the UI:
  - 60% base: white page background, header, main content breathing room.
  - 30% support: muted gray surfaces for cards, filters, footer bands, skeletons, and grouped form areas.
  - 10% emphasis: deep slate primary actions plus very small muted teal accents for category badges, trust/payment markers, and success states.
- Avoid large gradients, decorative glow, floating blobs, glass effects, oversized hero blocks, and ornamental illustrations.
- Keep card radii at 8px or lower. Use borders more than shadows.
- Use product photography from realistic sources or simple placeholders. Do not use glossy AI-looking product renders.
- Use lucide-react icons for commerce actions: `ShoppingCart`, `Search`, `User`, `Heart`, `Filter`, `Plus`, `Minus`, `Trash2`, and chevrons.

## Typography

- System sans-serif only for the first version.
- Body text starts at 16px with compact line height.
- Headings should be direct and proportional to the UI surface. Avoid hero-scale typography inside product or cart panels.
- Product names, prices, availability, and totals must be easy to scan.
- Use hierarchy as 60/30/10 too: body/product metadata is the base, section headings are support, price and primary CTA text are emphasis.

## Layout

- Header, product grid, detail view, cart, checkout, and success screens use the same max-width container.
- Product grids use stable card dimensions so loading, hover, and dynamic labels do not shift the layout.
- Filters stay compact. Advanced filtering is intentionally deferred.
- Empty and error states should be plain, helpful, and centered in their local region.
- Component layout follows 60/30/10: most screen area remains unframed, repeated product/cart/form groups use bordered surfaces, and emphasis is reserved for the current action.

## States

- Loading: use skeleton blocks matching final layout.
- Error: use clear text, subdued destructive color, and a retry path when available.
- Empty: explain the state and provide one next action.
- Disabled: reduce contrast and block pointer interactions.
- Hover/focus: immediate feedback under 200ms, visible keyboard focus ring.

## Interaction

- Add-to-cart feedback should be immediate and local.
- Quantity changes use icon buttons with 44px mobile touch targets.
- Checkout uses grouped fields and a clear final payment placeholder for the future Iyzico handoff.
- Motion is limited to small opacity/translate or color transitions.
