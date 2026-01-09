import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { PatientSidebar } from './PatientSidebar';
import { AppHeader } from './AppHeader';

interface PatientLayoutProps {
  children: ReactNode;
  title: string;
}

export default function PatientLayout({ children, title }: PatientLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <PatientSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader title={title} />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
