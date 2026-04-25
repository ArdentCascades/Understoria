import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface NavItem {
  to: string;
  labelKey: "nav.board" | "nav.dashboard" | "nav.profile";
  icon: string;
}

const ITEMS: NavItem[] = [
  { to: "/", labelKey: "nav.board", icon: "\u{1F333}" },
  { to: "/dashboard", labelKey: "nav.dashboard", icon: "\u{1F331}" },
  { to: "/profile", labelKey: "nav.profile", icon: "\u{1F33F}" },
];

export function BottomNav() {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t("nav.board")}
      className="sticky bottom-0 z-30 border-t border-moss-200 bg-white/95
                 backdrop-blur supports-[backdrop-filter]:bg-white/70
                 dark:border-moss-800 dark:bg-moss-950/95"
    >
      <ul className="mx-auto flex max-w-screen-md items-stretch justify-around">
        {ITEMS.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                [
                  "touch-target flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "text-canopy-700 dark:text-canopy-300"
                    : "text-moss-600 dark:text-moss-400 hover:text-canopy-700 dark:hover:text-canopy-300",
                ].join(" ")
              }
            >
              <span aria-hidden="true" className="text-xl leading-none">
                {item.icon}
              </span>
              <span>{t(item.labelKey)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
