"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Logo, LogoIcon } from '@/components/common/logo';
import {
  LayoutDashboard,
  BookOpen,
  BarChart,
  DollarSign,
  Star,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  GraduationCap,
  ArrowLeft,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/instructor', icon: LayoutDashboard },
  { name: 'Courses', href: '/instructor/courses', icon: BookOpen },
  { name: 'Analytics', href: '/instructor/analytics', icon: BarChart },
  { name: 'Earnings', href: '/instructor/earnings', icon: DollarSign },
  { name: 'Reviews', href: '/instructor/reviews', icon: Star },
  { name: 'Settings', href: '/instructor/settings', icon: Settings },
];

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle = navItems.find(item => item.href === pathname)?.name || 'Dashboard';

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-secondary"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Logo size="sm" />
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback>
              {profile?.full_name?.[0] || 'I'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={sidebarOpen ? { x: 0 } : { x: '-100%' }}
        className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r z-50 lg:translate-x-0 lg:static"
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b">
            <div className="flex flex-col">
              <Logo size="sm" />
              <span className="text-xs text-muted-foreground leading-none -mt-1 ml-0.5">Instructor Portal</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-secondary lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Back to Student Link */}
          <Link
            href="/dashboard"
            className="mx-4 mt-4 px-4 py-3 rounded-lg bg-secondary/50 flex items-center gap-3 text-sm hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Student Portal
          </Link>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'gradient-bg text-white'
                      : 'hover:bg-secondary text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <Avatar className="w-10 h-10">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback>
                  {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'I'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{profile?.full_name || 'Instructor'}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile?.email}
                </p>
              </div>
              <Badge variant="secondary">Instructor</Badge>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-3 justify-start gap-2 text-muted-foreground"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Desktop Header */}
        <header className="hidden lg:block sticky top-0 bg-white/80 backdrop-blur-xl border-b z-30">
          <div className="flex items-center justify-between h-16 px-8">
            <h1 className="text-xl font-semibold">{pageTitle}</h1>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
              <Avatar className="w-9 h-9">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback>
                  {profile?.full_name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8 pt-20 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
