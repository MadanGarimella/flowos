import { UserRound } from "lucide-react";

export function UserProfileBadge({ user }) {
  const subtitle = `${user.designation || user.role} - ${user.email}`;

  return (
    <div className="profile-badge">
      <div className="grid h-9 w-9 place-items-center bg-ocean/10 text-ocean">
        <UserRound size={17} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{user.name}</p>
        <p className="truncate text-xs text-slate-500">{subtitle}</p>
      </div>
      <span className="profile-role">{user.role}</span>
    </div>
  );
}
