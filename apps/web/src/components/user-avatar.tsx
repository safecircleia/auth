import { type ComponentProps } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps extends ComponentProps<typeof Avatar> {
  src?: string | null;
  alt?: string;
  name: string;
  fallbackClassName?: string;
}

/**
 * UserAvatar component that automatically handles image loading and fallback to Facehash
 *
 * @example
 * ```tsx
 * <UserAvatar
 *   src={user.image}
 *   name={user.email || user.name}
 *   alt={user.name}
 * />
 * ```
 */
export function UserAvatar({
  src,
  alt,
  name,
  className,
  fallbackClassName,
  ...props
}: UserAvatarProps) {
  return (
    <Avatar className={className} {...props}>
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback name={name} className={fallbackClassName} />
    </Avatar>
  );
}
