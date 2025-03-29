
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ChatHistory from '@/components/profile/ChatHistory';
import CounselorQueries from '@/components/profile/CounselorQueries';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<any[]>([]);
  const [queries, setQueries] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, redirecting to login");
          navigate('/login');
          return;
        }
        
        console.log("Session found:", session.user.id);
        
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error("Profile error:", profileError);
          if (profileError.code === 'PGRST116') {
            // No profile found, create one
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.email?.split('@')[0] || 'VIT Student'
              })
              .select()
              .single();
              
            if (createError) throw createError;
            setProfile(newProfile);
          } else {
            throw profileError;
          }
        } else {
          setProfile(profileData);
        }
        
        // Fetch chat history
        const { data: chatsData, error: chatsError } = await supabase
          .from('chats')
          .select(`
            id,
            created_at,
            is_anonymous,
            chat_messages (
              id, 
              content, 
              sender_type, 
              created_at
            )
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
          
        if (chatsError) throw chatsError;
        setChats(chatsData || []);
        
        // Fetch queries
        const { data: queriesData, error: queriesError } = await supabase
          .from('queries')
          .select(`
            id,
            subject,
            content,
            status,
            created_at,
            is_anonymous,
            counselor_id,
            counselors (
              full_name
            ),
            query_responses (
              id,
              content,
              created_at
            )
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
          
        if (queriesError) throw queriesError;
        setQueries(queriesData || []);
        
      } catch (error: any) {
        console.error('Error fetching user data:', error.message);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Profile Section */}
          <ProfileHeader profile={profile} />
          
          {/* History Tabs */}
          <div className="w-full md:w-2/3">
            <Tabs defaultValue="chats">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="chats" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat History
                </TabsTrigger>
                <TabsTrigger value="queries" className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Counselor Queries
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chats">
                <ChatHistory chats={chats} />
              </TabsContent>
              
              <TabsContent value="queries">
                <CounselorQueries queries={queries} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
