# Product Image Candidates

Goal: use product images that already have a clean white or near-white background, so background removal produces stable cutouts like the current bottle image.

Visual preview: [product-image-candidate-sheet.jpg](./product-image-candidate-sheet.jpg)

## Recommended Replacements

| Current product | Recommended candidate | Source | Image URL | Notes |
|---|---|---|---|---|
| Everyday Canvas Tote | Heshe Women's Leather Bag | DummyJSON | `https://cdn.dummyjson.com/product-images/womens-bags/heshe-women's-leather-bag/1.webp` | Clean white background, single product, good for cutout. Product name/category should change from canvas tote to leather handbag. |
| Desk Lamp Mini | Table Lamp | DummyJSON | `https://cdn.dummyjson.com/product-images/home-decoration/table-lamp/1.webp` | Much cleaner than the current lamp crop. Single object and easy edges. |
| Minimal Leather Wallet | Keep current wallet or change to bracelet | Current / FakeStore | `https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_t.png` | Clean wallet candidate was not found in these datasets. Current wallet cutout is acceptable; bracelet is cleaner but changes product type. |
| Ceramic Coffee Set | Black Aluminium Cup | DummyJSON | `https://cdn.dummyjson.com/product-images/kitchen-accessories/black-aluminium-cup/1.webp` | Cleaner than cup-on-table photos. Product should become a single cup, not a ceramic set. |
| Cotton Overshirt | Mens Cotton Jacket | FakeStoreAPI | `https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_t.png` | Clean product image and better than the current mixed-shirt crop. |
| Stainless Water Bottle | Keep current bottle | Local | `/products/stainless-water-bottle.png` | Best current result; no change needed. |
| Wooden Tray | Tray | DummyJSON | `https://cdn.dummyjson.com/product-images/kitchen-accessories/tray/1.webp` | Clean white background and good product isolation. |
| Notebook Set | No strong match found | - | - | Current notebook source cut to a pen-like object. Better to replace product with a dataset item or use a generated/curated notebook asset. |

## Extra Good Candidates

| Product idea | Source | Image URL | Notes |
|---|---|---|---|
| Black handbag | DummyJSON | `https://cdn.dummyjson.com/product-images/womens-bags/women-handbag-black/1.webp` | Very clean, compact, strong e-commerce card fit. |
| Henley shirt | FakeStoreAPI | `https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png` | Clean clothing candidate if we want a top instead of jacket. |
| Backpack | FakeStoreAPI | `https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png` | Clean, practical replacement for bag/tote if the catalog can shift to backpack. |

## Recommendation

Use DummyJSON and FakeStoreAPI product images for this first frontend version. They are more consistent than lifestyle stock photos, already close to white-background e-commerce imagery, and need less aggressive background removal.
