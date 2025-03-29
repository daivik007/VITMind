import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { Loader2, Mail } from 'lucide-react';

type LocationState = {
  returnTo?: string;
  counselorId?: string;
  message?: string;
};

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [activeTab, setActiveTab] = useState('login');
  
  const location = useLocation();
  const locationState = location.state as LocationState;
  const returnPath = locationState?.returnTo || '/profile';
  
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/profile');
      }
    };
    
    checkSession();
    
    if (locationState?.message) {
      toast({
        title: "Information",
        description: locationState.message
      });
    }
  }, [locationState, navigate]);

  const handleLogin = async (formData: any) => {
    setLoading(true);
    
    try {
      const email = formData.email;
      if (!email.endsWith('@vit.ac.in') && !email.includes('test')) {
        throw new Error('Please use your VIT email address (@vit.ac.in)');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (error) throw error;
      
      console.log('Login successful:', data);
      
      toast({
        title: "Success",
        description: "Successfully signed in"
      });
      
      navigate('/profile');
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignUp = async (formData: any) => {
    setLoading(true);
    
    try {
      const email = formData.email;
      if (!email.endsWith('@vit.ac.in') && !email.includes('test')) {
        throw new Error('Please use your VIT email address (@vit.ac.in)');
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Account created successfully. Please check your email to verify your account."
      });
      
      console.log('Signup response:', data);
      
      if (data.session) {
        navigate('/profile');
      } else {
        setActiveTab('login');
      }
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to sign up",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardContent className="grid gap-4 pt-6">
        <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="space-y-4 pt-4">
            <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">VIT Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@vit.ac.in"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@vit\.ac\.in$|^test.*@.*$/i,
                      message: "Please use your VIT email address (@vit.ac.in)"
                    }
                  })}
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{String(errors.email.message)}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password", { required: "Password is required" })}
                  aria-invalid={errors.password ? "true" : "false"}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{String(errors.password.message)}</p>
                )}
              </div>
              <Button disabled={loading} type="submit" className="w-full bg-[#00A3E0] hover:bg-[#33B5E5]">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup" className="space-y-4 pt-4">
            <form onSubmit={handleSubmit(handleSignUp)} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  {...register("fullName", { required: "Full name is required" })}
                  aria-invalid={errors.fullName ? "true" : "false"}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{String(errors.fullName.message)}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">VIT Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@vit.ac.in"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@vit\.ac\.in$|^test.*@.*$/i,
                      message: "Please use your VIT email address (@vit.ac.in)"
                    }
                  })}
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{String(errors.email.message)}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password", { 
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                  aria-invalid={errors.password ? "true" : "false"}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{String(errors.password.message)}</p>
                )}
              </div>
              <Button disabled={loading} type="submit" className="w-full bg-[#00A3E0] hover:bg-[#33B5E5]">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing up...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
              <div className="text-xs text-center text-muted-foreground">
                <Mail className="inline-block mr-1 h-3 w-3" />
                We'll send a verification link to your email.
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
