'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  FiHome,
  FiMap,
  FiTrendingUp,
  FiShoppingCart,
  FiSettings,
  FiMenu,
  FiX,
  FiMessageSquare
} from 'react-icons/fi';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  href,
  icon,
  text,
  isActive,
  onClick,
}) => {
  return (
    <Link href={href} passHref>
      <div
        onClick={onClick}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
          isActive
            ? 'bg-emerald-100 text-emerald-800'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <div>{icon}</div>
        <span>{text}</span>
      </div>
    </Link>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const routes = [
    { path: '/dashboard', label: 'Overview', icon: <FiHome size={20} /> },
    { path: '/dashboard/fields', label: 'Fields', icon: <FiMap size={20} /> },
    { path: '/dashboard/analytics', label: 'Analytics', icon: <FiTrendingUp size={20} /> },
    { path: '/dashboard/marketplace', label: 'Marketplace', icon: <FiShoppingCart size={20} /> },
    { path: '/dashboard/bot', label: 'AgroBot', icon: <FiMessageSquare size={20} /> },
    { path: '/dashboard/settings', label: 'Settings', icon: <FiSettings size={20} /> },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 p-4 z-30 lg:hidden">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-white shadow text-gray-600 hover:text-emerald-600 focus:outline-none"
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="flex items-center justify-center h-16 border-b">
          <Image 
            src="/logo.png" 
            alt="AiFarm Logo" 
            width={120} 
            height={40} 
          />
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {routes.map((route) => (
              <NavItem
                key={route.path}
                href={route.path}
                icon={route.icon}
                text={route.label}
                isActive={isActive(route.path)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMobileMenu}
      ></div>
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform z-30 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center h-16 border-b">
          <Image 
            src="/logo.png" 
            alt="AiFarm Logo" 
            width={120} 
            height={40} 
          />
        </div>
        <div className="overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {routes.map((route) => (
              <NavItem
                key={route.path}
                href={route.path}
                icon={route.icon}
                text={route.label}
                isActive={isActive(route.path)}
                onClick={toggleMobileMenu}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
} 