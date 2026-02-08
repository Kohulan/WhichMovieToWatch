"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Search, Compass, Film, Sun, Moon, Command } from "lucide-react";
import { useUI } from "@/stores/ui";
import { useKeyboardShortcuts } from "@/hooks/useKeyboard";

export function Navbar() {
  const { openCommandPalette, theme, setTheme } = useUI();
  useKeyboardShortcuts();

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-40 px-4 md:px-8 py-3"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.2 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
        >
          <motion.div
            className="relative w-9 h-9 rounded-xl bg-[var(--accent-warm)] flex items-center justify-center"
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Film size={18} className="text-white" />
          </motion.div>
          <span className="text-lg font-bold text-[var(--text-primary)] hidden md:block">
            WhichMovie
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <NavLink href="/" label="Home" />
          <NavLink href="/discover" label="Discover" />
          <NavLink href="/search" label="Search" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search button */}
          <motion.button
            onClick={openCommandPalette}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] text-sm hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Search size={14} />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[var(--bg-base)] text-[10px] text-[var(--text-muted)] border border-[var(--border-subtle)]">
              <Command size={10} />K
            </kbd>
          </motion.button>

          {/* Theme toggle */}
          <motion.button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
    >
      {label}
    </Link>
  );
}
