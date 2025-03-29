
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, MessageSquare, Lightbulb, User, UserRound, Users, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (!error && data) {
          setIsAdmin(data.is_admin || false);
        }
      }
    };
    
    fetchUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (!error && data) {
          setIsAdmin(data.is_admin || false);
        }
      } else {
        setIsAdmin(false);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: "Success",
        description: "Successfully signed out",
      });
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Chat', path: '/chat', icon: <MessageSquare className="h-4 w-4" /> },
    { name: 'Counselors', path: '/counselors', icon: <Users className="h-4 w-4" /> },
    { name: 'Resources', path: '/resources', icon: <Lightbulb className="h-4 w-4" /> },
    ...(user ? [{ name: 'Profile', path: '/profile', icon: <UserRound className="h-4 w-4" /> }] : []),
  ];

  return (
    <nav 
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/80 backdrop-blur-lg border-b border-white/10 py-3' : 'py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold">
          <span className="text-primary">VIT</span>
          <span>Mind</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`nav-link flex items-center space-x-1 ${
                location.pathname === link.path ? 'text-primary after:scale-x-100' : ''
              }`}
            >
              {link.icon && link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user.email} />
                  <AvatarFallback>
                    <UserRound className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <UserRound className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link 
              to="/login" 
              className="btn-primary flex items-center"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
        
        <button 
          className="md:hidden text-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-morph border-t border-white/10 animate-fade-in p-4">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  location.pathname === link.path 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-secondary'
                }`}
              >
                {link.icon && link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
            
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    location.pathname === '/profile' 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-secondary'
                  }`}
                >
                  <UserRound className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                      location.pathname === '/admin' 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-left hover:bg-secondary"
                >
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="btn-primary flex items-center justify-center mt-2"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
