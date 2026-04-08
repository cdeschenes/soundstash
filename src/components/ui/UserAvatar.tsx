import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  avatarPath?: string | null;
  className?: string;
}

export function UserAvatar({ name, avatarPath, className }: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={cn("h-8 w-8", className)}>
      {avatarPath && <AvatarImage src={avatarUrl(avatarPath) ?? ""} alt={name} />}
      <AvatarFallback className="text-xs bg-surface-2 text-foreground">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
