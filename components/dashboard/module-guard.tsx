'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useModules, type ModuleKey } from '@/lib/hospital-modules-context';
import { useAuth } from '@/lib/auth-context';
import { useSettings, DEFAULT_ROLE_PAGES, type ShareableRole, type PageKey } from '@/lib/settings-context';

export function ModuleGuard({
  moduleKey,
  pageKey,
  children,
}: {
  moduleKey: ModuleKey;
  pageKey?: PageKey;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { settings } = useSettings();
  const { isEnabled, loading } = useModules();

  const moduleAllowed = isEnabled(moduleKey);

  // Admins, doctors, receptionists, and accountants always have their own
  // fixed menus. Only the "shareable" roles (nurse, pharmacist, lab tech,
  // radiologist, billing clerk) have a hospital-configurable page list --
  // enforce it here too, not just by hiding the sidebar link.
  const isShareableRole = !!user?.role && user.role in DEFAULT_ROLE_PAGES;
  const roleAllowed =
    !isShareableRole || !pageKey ||
    (settings.rolePermissions[user!.role as ShareableRole] ?? DEFAULT_ROLE_PAGES[user!.role as ShareableRole]).includes(pageKey);

  const allowed = moduleAllowed && roleAllowed;

  useEffect(() => {
    if (!loading && !allowed) {
      router.replace('/dashboard');
    }
  }, [loading, allowed, router]);

  if (loading) return null;
  if (!allowed) return null;

  return <>{children}</>;
}
