# Facehash Integration

This project uses [facehash](https://github.com/cossistant/facehash) for generating unique, deterministic avatar faces from user identifiers (emails, usernames, etc.).

## Features

- **Zero dependencies**: No external assets required
- **Deterministic**: Same input = same face, always
- **Offline-first**: No API calls needed
- **Accessible**: Built with a11y in mind
- **TypeScript**: Fully typed

## Usage

### Basic Avatar Component

The `AvatarFallback` component now automatically uses Facehash when you provide a `name` prop:

```tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

<Avatar>
  <AvatarImage src={user.image || undefined} alt={user.name} />
  <AvatarFallback name={user.email || user.name} />
</Avatar>
```

### Simplified UserAvatar Component

For easier usage, use the `UserAvatar` wrapper component:

```tsx
import { UserAvatar } from "@/components/user-avatar";

<UserAvatar 
  src={user.image} 
  name={user.email || user.name}
  alt={user.name}
/>
```

### Sizes

Avatars automatically adjust Facehash size based on the avatar size:

```tsx
<Avatar size="sm">
  <AvatarImage src={user.image} />
  <AvatarFallback name={user.email} />
</Avatar>

<Avatar size="default">
  <AvatarImage src={user.image} />
  <AvatarFallback name={user.email} />
</Avatar>

<Avatar size="lg">
  <AvatarImage src={user.image} />
  <AvatarFallback name={user.email} />
</Avatar>
```

Size mappings:
- `sm`: 24px Facehash
- `default`: 32px Facehash  
- `lg`: 40px Facehash

### Image URL API Route

For emails, OG images, or anywhere you need a URL instead of a component:

```tsx
// Use in emails, meta tags, etc.
<img src={`/api/avatar?name=${user.email}`} alt={user.name} />
```

Query parameters:
- `name`: The identifier (required)
- `size`: Pixel size (optional, default: 40)
- `intensity3d`: 3D effect intensity - `none`, `subtle`, `medium`, `dramatic` (optional)
- `variant`: Style variant - `gradient`, `solid` (optional)

Example with options:
```
/api/avatar?name=john@example.com&size=64&intensity3d=dramatic&variant=gradient
```

## Implementation Details

### Components Modified

1. **`/apps/web/src/components/ui/avatar.tsx`**
   - Added Facehash import
   - Updated `AvatarFallback` to accept optional `name` prop
   - Added context to pass size to Facehash
   - Automatically renders Facehash when `name` is provided

2. **`/apps/web/src/components/user-avatar.tsx`** (NEW)
   - Wrapper component for easier usage
   - Handles image loading and fallback automatically

3. **`/apps/web/src/app/api/avatar/route.ts`** (NEW)
   - Next.js API route for generating avatar images
   - Returns PNG images cached forever
   - Useful for emails, OG images, external services

### Updated Components

All avatar usages have been updated to use Facehash:
- Dashboard sidebar
- Dashboard header dropdown
- Profile settings page

## Why Email/Username?

We use `user.email || user.name` as the Facehash identifier because:
- Emails are unique and stable
- Same user = same face across all sessions
- Falls back to username if email isn't available
- More recognizable than random UUIDs

## Customization

To customize Facehash globally, you can modify the `AvatarFallback` component in `/apps/web/src/components/ui/avatar.tsx`:

```tsx
<Facehash 
  name={name} 
  size={facehashSize}
  className="size-full"
  intensity3d="subtle"  // Add default 3D intensity
  variant="gradient"    // Add default variant
  enableBlink          // Enable blinking animation
/>
```

## Resources

- [Facehash Documentation](https://github.com/cossistant/facehash)
- [Facehash NPM Package](https://www.npmjs.com/package/facehash)
