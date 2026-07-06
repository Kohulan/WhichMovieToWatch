import { createContext } from "react";

/**
 * FrozenPathContext — the pathname the enclosing FrozenOutlet subtree was
 * mounted under (see AppShell.tsx).
 *
 * With AnimatePresence mode="sync", an exiting page's <Seo> instance keeps
 * rendering during its fade-out while the router has already moved on to the
 * new route. Without this guard, both the exiting and entering <Seo>
 * instances would emit head tags simultaneously, racing to set <title>,
 * canonical, etc. <Seo> reads this context and stops rendering once its
 * frozen mount path no longer matches the live location.
 *
 * null outside a FrozenOutlet subtree — <Seo> always renders in that case.
 */
export const FrozenPathContext = createContext<string | null>(null);
