# Skin Shop - Admin product manager

The existing admin login at /admin/login opens the dashboard. Open
**Products** or use the **+ Add product** shortcut in the admin header.

## Everyday product management (no code required)

- **Find**: Search products by name, category or collection. Filter by
  Published, Hidden, Sold out, or active NEW highlights.
- **Edit**: Choose Edit product to change names, INR prices, descriptions,
  collection, category, stock, photos, featured status and publication status.
- **New products**: Choose + Add a product, enter a name, category, collection,
  price and required descriptions. Upload a main product photo and save.
- **Photos**: Upload a main image or several gallery images directly. Vercel
  Blob stores the photos and fills the URL automatically. You can also paste
  an existing /images/ path or HTTPS image URL.
- **Quick stock**: Adjust stock, add stock or toggle publication directly from
  the list without opening the full product editor.
- **Related products**: Select product names with checkboxes; there is no need
  to type product URL slugs. Ritual tags also use simple checkboxes.
- **Featured**: Featured products appear in the homepage's curated Start Here
  collection. Unchecking Featured removes them from that selection.
- **Hide vs delete**: Unpublish a product to hide it and block checkout; this
  is safer than removing products referenced by customer orders.

## Premium NEW badge

In Add/Edit Product, find **02 / Launch highlight**. Choose:

- No badge: never display the label
- 30 days: one month after saving
- 60 days: two months after saving
- 90 days: three months after saving

The label is **NEW**, with a fine antique-gold border and a subtle JavaScript
entrance and one-time highlight sweep. It respects reduced-motion preferences.

The countdown begins on Save and the label disappears automatically, including
from open browser tabs, when the selected period has passed. No scheduled tasks
or developer changes are necessary. Changing other product details does not
restart the countdown. To relaunch, tick **Restart countdown today**. Changing
the selected duration also starts a new period. The product list displays
remaining time or an Expired indicator for old launch highlights.

## Technical notes for site maintenance

The PostgreSQL Product table is the source of truth for names, prices, images,
availability and stock; checkout revalidates against it. Editorial details and
NEW settings are stored in the existing optional Product.details JSONB field.
No schema migration is needed for NEW highlights. The server checks expiry on
catalog reads, and the client dismisses the badge when an open tab passes its
expiration. Admin API key and short-lived signed session cookie protect writes.

The Vercel Blob store is already connected to this project. Keep its
BLOB_READ_WRITE_TOKEN in Vercel environment settings, never in source code.
For preview QA, avoid connecting previews to production customer/order data.
