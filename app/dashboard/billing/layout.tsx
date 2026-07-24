import { ModuleGuard } from '@/components/dashboard/module-guard';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ModuleGuard moduleKey="billing" pageKey="billing">{children}</ModuleGuard>;
}
