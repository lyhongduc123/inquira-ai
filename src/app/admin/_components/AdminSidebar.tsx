'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, LayoutDashboard, ShieldCheck, TestTube2 } from 'lucide-react'

import { Brand } from '@/components/global/brand'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

const navigation = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Preprocessing', href: '/admin/preprocessing', icon: FileText },
  { name: 'Validation', href: '/admin/validation', icon: TestTube2 },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { open: isOpen } = useSidebar()

  const isActiveRoute = (href: string): boolean => {
    if (href === '/admin') return pathname === href
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <Sidebar collapsible="icon" side="left">
      <SidebarHeader className="py-4">
        <div className="px-2">
          <Brand showText={isOpen} />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton disabled className="cursor-default opacity-100">
              <ShieldCheck />
              {isOpen && <span>Admin Panel</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navigation.map((item) => {
              const isActive = isActiveRoute(item.href)

              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={!isOpen ? item.name : undefined}>
                    <Link href={item.href}>
                      <item.icon />
                      {isOpen && <span>{item.name}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
