
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import LoginForm from '@/components/auth/LoginForm';
import { Shield, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const returnPath = location.state?.returnTo || '/';
  const message = location.state?.message;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Login successful",
        description: "You are now logged in",
      });
      
      navigate(returnPath);
    } catch (error: any) {
      console.error('Login error:', error.message);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Sign up successful",
        description: "Check your email for a confirmation link",
      });
      
      // Reset form after signup
      setEmail('');
      setPassword('');
      setFullName('');
      setIsSignUp(false);
    } catch (error: any) {
      console.error('Signup error:', error.message);
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 flex flex-col items-center">
        <div className="max-w-md w-full text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{isSignUp ? 'Create Account' : 'Secure Sign In'}</h1>
          <p className="text-muted-foreground">
            We only verify you're a VIT student. All conversations remain completely anonymous.
          </p>
          {message && (
            <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <p className="text-sm text-amber-200">{message}</p>
            </div>
          )}
        </div>
        
        <div className="w-full max-w-md bg-card rounded-lg shadow-sm border p-6">
          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    placeholder="Your name"
                    className="pl-10"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@vit.ac.in"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignUp && (
                  <button type="button" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#00A3E0] hover:bg-[#33B5E5]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">●</span>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                className="ml-1 text-primary hover:underline"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-secondary/40 rounded-xl max-w-lg text-center">
          <h3 className="font-medium mb-2">Privacy Guarantee</h3>
          <p className="text-sm text-muted-foreground">
            We never store or share personal information. Your VIT email is used only for verification and your conversations are not linked to your identity.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
