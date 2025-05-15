"use client";
import { useSession } from "@/contexts/sessionProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/app/(auth)/actions";
import Link from "next/link";

export default function UserButton() {
  const { user } = useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center">
        <Avatar>
          <AvatarImage src={user.avatarUrl || "/default-avatar.jpg"} />
          <AvatarFallback>
            {user.firstName[0] + user.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="space-x-1 flex items-center">
          <span className="ml-2 text-sm capitalize">
            {user.firstName} {user.lastName}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/dashboard/?profileId">
          <DropdownMenuItem>View Profile</DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            logout();
          }}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}