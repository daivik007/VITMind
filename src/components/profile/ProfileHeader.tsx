
import React from 'react';
import { UserCircle, LogOut, Mail, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface ProfileHeaderProps {
  profile: any;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
      toast({
        title: "Success",
        description: "Successfully signed out"
      });
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  if (!profile) {
    return (
      <Card className="w-full md:w-1/3">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Loading your profile...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full md:w-1/3">
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <CardTitle>Profile</CardTitle>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
        <CardDescription>Your account information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <UserCircle className="h-16 w-16 text-primary" />
          </div>
          <h3 className="text-xl font-medium">{profile?.full_name || 'VIT Student'}</h3>
          <p className="text-muted-foreground">{profile?.email}</p>
        </div>
        
        <div className="space-y-4">
          <div className="border rounded-md p-3">
            <p className="text-sm font-medium mb-1">Email</p>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
          </div>
          <div className="border rounded-md p-3">
            <p className="text-sm font-medium mb-1">Account Type</p>
            <p className="text-sm text-muted-foreground">
              {profile?.is_admin ? 'Administrator' : 'Student'}
            </p>
          </div>
          <div className="border rounded-md p-3">
            <p className="text-sm font-medium mb-1">Joined</p>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {profile?.created_at ? format(new Date(profile.created_at), 'PP') : '-'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
