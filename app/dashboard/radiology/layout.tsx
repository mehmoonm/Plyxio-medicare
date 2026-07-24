import { ModuleGuard } from '@/components/dashboard/module-guard';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ModuleGuard moduleKey="radiology" pageKey="radiology">{children}</ModuleGuard>;
}
