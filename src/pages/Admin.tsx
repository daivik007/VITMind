
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { toast } from '@/hooks/use-toast';

const Admin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Redirect to login if not authenticated
          toast({
            title: 'Authentication required',
            description: 'Please sign in to access the admin dashboard',
            variant: 'destructive'
          });
          navigate('/login', { state: { returnTo: '/admin' } });
          return;
        }
        
        // Check if the user is an admin
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        if (error) throw error;
        
        if (data?.role !== 'admin') {
          toast({
            title: 'Access denied',
            description: 'You do not have permission to access the admin dashboard',
            variant: 'destructive'
          });
          navigate('/');
          return;
        }
        
        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while checking your permissions',
          variant: 'destructive'
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg text-muted-foreground">Checking permissions...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {isAdmin && <AdminDashboard />}
      </div>
    </Layout>
  );
};

export default Admin;
