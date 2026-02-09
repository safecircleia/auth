import { UserAvatar } from "@/components/user-avatar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

/**
 * Example component demonstrating Facehash avatar integration
 *
 * This file shows different ways to use avatars with Facehash fallbacks
 */
export function AvatarExamples() {
  return (
    <div className="space-y-8 p-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">Basic Usage</h2>
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback name="shadcn" />
          </Avatar>

          <Avatar>
            <AvatarImage src="/nonexistent.jpg" />
            <AvatarFallback name="john@example.com" />
          </Avatar>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Different Sizes</h2>
        <div className="flex gap-4 items-end">
          <Avatar size="sm">
            <AvatarFallback name="alice@example.com" />
          </Avatar>

          <Avatar size="default">
            <AvatarFallback name="bob@example.com" />
          </Avatar>

          <Avatar size="lg">
            <AvatarFallback name="charlie@example.com" />
          </Avatar>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Using UserAvatar Wrapper</h2>
        <div className="flex gap-4">
          <UserAvatar
            src="https://github.com/vercel.png"
            name="vercel"
            alt="Vercel"
          />

          <UserAvatar
            name="team@startup.com"
            alt="Team Avatar"
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Avatar Group</h2>
        <div className="flex -space-x-2">
          <Avatar className="ring-2 ring-background">
            <AvatarFallback name="user1@example.com" />
          </Avatar>
          <Avatar className="ring-2 ring-background">
            <AvatarFallback name="user2@example.com" />
          </Avatar>
          <Avatar className="ring-2 ring-background">
            <AvatarFallback name="user3@example.com" />
          </Avatar>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Image URL (for emails, OG images)</h2>
        <div className="space-y-2">
          <img
            src="/api/avatar?name=email@example.com&size=64"
            alt="Avatar"
            className="rounded-full"
          />
          <code className="block text-sm bg-muted p-2 rounded">
            /api/avatar?name=email@example.com&size=64
          </code>
        </div>
      </section>
    </div>
  );
}
