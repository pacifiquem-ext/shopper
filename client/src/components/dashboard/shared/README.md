# Shared Dashboard Components

This directory contains reusable UI components used across the dashboard.

## Components

### `ImageZoomDialog`

A reusable dialog for displaying zoomed images.

**Props:**
- `open: boolean` - Controls dialog visibility
- `onOpenChange: (open: boolean) => void` - Callback when dialog state changes
- `imageUrl: string | null` - URL of the image to display
- `title: string` - Dialog title
- `subtitle: string` - Dialog subtitle/description
- `altText: string` - Alt text for the image
- `emptyText: string` - Text to show when no image is available

**Usage:**
```tsx
<ImageZoomDialog
  open={zoomOpen}
  onOpenChange={setZoomOpen}
  imageUrl={imageUrl}
  title="Product Image"
  subtitle="Click outside to close"
  altText="Product preview"
  emptyText="No image available"
/>
```

---

### `DeleteConfirmationDialog`

A highly reusable confirmation dialog for delete operations with customizable warnings and impact messages.

**Props:**
- `open: boolean` - Controls dialog visibility
- `onOpenChange: (open: boolean) => void` - Callback when dialog state changes
- `onConfirm: () => void` - Callback when delete is confirmed
- `title: string` - Dialog title
- `description: string` - Dialog description
- `itemName: string` - Name of the item being deleted
- `warningMessage: string` - Warning message prefix (e.g., "You are about to delete")
- `impactTitle?: string` - Optional impact section title
- `impactMessage?: string` - Optional impact section message
- `deleteItems?: DeleteItem[]` - Optional list of items that will be deleted
- `confirmButtonText?: string` - Custom confirm button text (default: "Delete")
- `cancelButtonText?: string` - Custom cancel button text (default: "Cancel")
- `isLoading?: boolean` - Shows loading state on buttons

**DeleteItem Interface:**
```tsx
interface DeleteItem {
  icon?: React.ReactNode
  label: string
  value?: string | number
}
```

**Usage:**
```tsx
<DeleteConfirmationDialog
  open={deleteOpen}
  onOpenChange={setDeleteOpen}
  onConfirm={handleDelete}
  title="Delete Product"
  description="This action cannot be undone"
  itemName={product.name}
  warningMessage="You are about to delete"
  deleteItems={[
    { label: 'The product and all its variants' },
    { label: 'units from inventory', value: product.stock },
    { label: 'All product images and media' },
  ]}
  impactTitle="Impact on Active Orders"
  impactMessage="Consider archiving instead of deleting."
  confirmButtonText="Delete Product"
  cancelButtonText="Cancel"
/>
```

---

### `ProductStatusBadge`

Displays product status with appropriate styling.

**Props:**
- `status: string` - Product status (active, draft, archived)
- `label: string` - Display label for the status

---

## Design Principles

All shared components follow these principles:

1. **Highly Reusable** - Accept all content as props, no hardcoded text
2. **Type Safe** - Full TypeScript support with proper interfaces
3. **Flexible** - Optional props for customization
4. **Accessible** - Proper ARIA labels and semantic HTML
5. **Consistent** - Follow the design system (Tailwind classes, shadcn/ui)
6. **Self-Contained** - No external state dependencies

## Adding New Components

When creating new shared components:

1. Place them in this directory
2. Export all necessary types/interfaces
3. Document props and usage examples
4. Ensure they're framework-agnostic (no business logic)
5. Update this README with usage examples
