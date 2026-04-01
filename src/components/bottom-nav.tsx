"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Flame, MessageCircle, BookOpen, User } from "lucide-react";

const TABS = [
  { href: "/home", label: "Home", icon: Home, activeColor: "text-coral" },
  { href: "/go-mode", label: "Go Mode", icon: Flame, activeColor: "text-coral" },
  { href: "/companion", label: "Coach", icon: MessageCircle, activeColor: "text-coral" },
  { href: "/skills", label: "Skills", icon: BookOpen, activeColor: "text-coral" },
  { href: "/profile", label: "Profile", icon: User, activeColor: "text-steel" },
] as const;

const HIDDEN_ON = ["/onboarding", "/checkin", "/sign-in", "/sign-up"];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/") return null;
  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav className="shrink-0 border-t border-navy/8 bg-white">
      <div className="flex items-center">
        {TABS.map(({ href, label, icon: Icon, activeColor }) => {
          const active =
            href === "/skills"
              ? pathname === href ||
                (pathname.startsWith(href + "/") &&
                  !pathname.startsWith("/skills/practice"))
              : pathname.startsWith(href);
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[56px] transition-colors active:opacity-70 ${
                active ? activeColor : "text-navy/35 hover:text-navy/50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
