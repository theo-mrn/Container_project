'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserCircle, Menu, X, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { authService, User as UserType } from '@/src/lib/api';
import { toast } from 'sonner';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserType | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = authService.getToken();
    const user = authService.getUser();
    setIsAuthenticated(!!token);
    setUserData(user);
  };

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Restaurants', href: '/restaurant' },
    ...(isAuthenticated ? [{ name: 'Mes Réservations', href: '/my-bookings' }] : []),
  ];

  const handleLogout = async () => {
    try {
      const token = authService.getToken();
      if (token) {
        await authService.logout(token);
        toast.success('Déconnexion réussie');
        router.push('/auth/login');
      }
      setIsAuthenticated(false);
      setUserData(null);
      setIsMenuOpen(false);
    } catch {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const isActive = (path: string) => pathname === path;

  const renderAuthButtons = () => {
    if (isAuthenticated && userData) {
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {userData.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/account" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Mon Compte</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    }

    return (
      <div className="flex items-center space-x-4">
        <Button variant="ghost" asChild>
          <Link href="/auth/login">Se connecter</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/register">S&apos;inscrire</Link>
        </Button>
      </div>
    );
  };

  return (
    <nav className="bg-white shadow-lg fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo et navigation principale */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-800">
                RestaurantApp
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Actions utilisateur */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {renderAuthButtons()}
          </div>

          {/* Menu mobile */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile panel */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive(item.href)
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 pb-3 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="flex items-center px-4">
                  <Link
                    href="/account"
                    className="text-gray-500 hover:text-gray-700 p-2 ml-4"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-6 w-6" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 p-2 ml-4"
                  >
                    <LogOut className="h-6 w-6" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 px-4">
                  <Button variant="ghost" asChild className="justify-center">
                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                      Se connecter
                    </Link>
                  </Button>
                  <Button asChild className="justify-center">
                    <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                      S&apos;inscrire
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 