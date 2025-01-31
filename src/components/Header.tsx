import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, UserCircle, LogOut, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AuthModal from './AuthModal';

interface Profile {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export default function Header() {
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', userId)
          .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) await fetchProfile(session.user.id);
      setLoading(false);
    };

    initializeAuth();

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setUser(session?.user || null);
          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }
    );

    return () => authSubscription.unsubscribe();
  }, [fetchProfile]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const displayName = profile?.full_name || profile?.username || user?.email || '';
  const avatarUrl = profile?.avatar_url ?
      `${profile.avatar_url}?${new Date().getTime()}` : '';

  return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <ShoppingBag className="w-8 h-8 text-indigo-600" />
              <span className="text-2xl font-bold text-gray-900">Merx</span>
            </Link>

            <div className="flex items-center space-x-4">
              {user ? (
                  <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                        aria-label="Menu do perfil"
                    >
                      {avatarUrl ? (
                          <img
                              src={avatarUrl}
                              alt="Profile"
                              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/default-avatar.png';
                              }}
                          />
                      ) : (
                          <UserCircle className="w-8 h-8 text-gray-600" />
                      )}
                      <span className="text-gray-700 font-medium hidden md:inline">
                    {loading ? 'Carregando...' : displayName}
                  </span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
                          isDropdownOpen ? 'rotate-180' : ''
                      }`}/>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            <Link
                                to="/profile"
                                onClick={() => setIsDropdownOpen(false)}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Meu Perfil
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Sair</span>
                            </button>
                          </div>
                        </div>
                    )}
                  </div>
              ) : (
                  <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  >
                    <UserCircle className="w-6 h-6" />
                    <span className="hidden md:inline">Login</span>
                  </button>
              )}
            </div>
          </div>
        </div>

        <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onAuthSuccess={() => setIsAuthModalOpen(false)}
        />
      </header>
  );
}