import type { ReactNode } from 'react'

import { Box } from '@/components/layout/box'
import { SidebarProvider } from '@/components/ui/sidebar'

import { AdminSidebar } from './_components/AdminSidebar'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <Box className="flex-1 overflow-auto">{children}</Box>
      </div>
    </SidebarProvider>
  )
}
