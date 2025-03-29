import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Loader2, LogOut, User, Users, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import RecentConversations from '@/components/profile/RecentConversations';
import { ChatPreview } from '@/types/chat';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<any[]>([]);
  const [queries, setQueries] = useState<any[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [recentConversations, setRecentConversations] = useState<ChatPreview[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  
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
        
        // Fetch recent counselor conversations
        const { data: counselorChatsData, error: counselorChatsError } = await supabase
          .from('chats')
          .select(`
            id,
            counselor_id,
            last_message_at,
            counselors (
              full_name,
              profile_image_url
            ),
            chat_messages (
              content,
              created_at,
              sender_type
            )
          `)
          .eq('user_id', session.user.id)
          .not('counselor_id', 'is', null)
          .order('last_message_at', { ascending: false })
          .limit(5);
          
        if (counselorChatsError) throw counselorChatsError;
        
        if (counselorChatsData) {
          const recentChats = counselorChatsData.map(chat => {
            const lastMessage = chat.chat_messages && chat.chat_messages.length > 0 
              ? chat.chat_messages.sort((a: any, b: any) => 
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )[0].content
              : 'No messages yet';
              
            return {
              id: chat.id,
              counselorId: chat.counselor_id,
              counselorName: chat.counselors?.full_name || 'Counselor',
              lastMessage,
              lastMessageTime: new Date(chat.last_message_at || chat.created_at),
              counselorImage: chat.counselors?.profile_image_url
            } as ChatPreview;
          });
          
          setRecentConversations(recentChats);
        }
        setLoadingConversations(false);
        
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
  
  const toggleAnonymity = async () => {
    setIsAnonymous(!isAnonymous);
    toast({
      title: "Anonymity Updated",
      description: `Your future interactions will be ${!isAnonymous ? 'anonymous' : 'identified'}`
    });
  };
  
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
        <div className="grid grid-cols-1 gap-8">
          <Card className="bg-[#2A3536] border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl">Your Profile</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {profile?.email}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="anonymous-mode" 
                      checked={isAnonymous}
                      onCheckedChange={toggleAnonymity}
                    />
                    <span className="text-sm text-muted-foreground">Anonymous Mode</span>
                  </div>
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  className="bg-[#00A3E0] hover:bg-[#33B5E5]" 
                  onClick={() => navigate('/chat')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat with AI
                </Button>
                <Button 
                  className="bg-[#00A3E0] hover:bg-[#33B5E5]" 
                  onClick={() => navigate('/counselors')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Counselors
                </Button>
                <Button 
                  className="bg-[#00A3E0] hover:bg-[#33B5E5]" 
                  onClick={() => navigate('/counselors')}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit a Query
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <RecentConversations 
            conversations={recentConversations} 
            isLoading={loadingConversations} 
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-[#2A3536] border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Your Chatbot History
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                {chats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-2 opacity-20" />
                    <p className="text-muted-foreground">No chatbot interactions yet. Start a chat now!</p>
                    <Button 
                      className="mt-4 bg-[#00A3E0] hover:bg-[#33B5E5]" 
                      onClick={() => navigate('/chat')}
                    >
                      Start a Chat
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chats.map((chat) => (
                      <div key={chat.id} className="bg-[#1A2526] p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">Chat Session</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(chat.created_at), 'PPp')}
                            </p>
                          </div>
                          <div className="px-2 py-1 rounded text-xs bg-primary/20 text-primary">
                            {chat.is_anonymous ? 'Anonymous' : 'Identified'}
                          </div>
                        </div>
                        {chat.chat_messages && chat.chat_messages.length > 0 && (
                          <div className="border-l-2 border-primary/30 pl-3 py-1 mb-3 line-clamp-2">
                            <p className="text-sm text-muted-foreground">
                              {chat.chat_messages[0].content}
                            </p>
                          </div>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => navigate('/chat')}
                        >
                          View Chat
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-[#2A3536] border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="h-5 w-5 mr-2" />
                  Your Queries
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                {queries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Send className="h-12 w-12 text-muted-foreground mb-2 opacity-20" />
                    <p className="text-muted-foreground">No queries submitted yet. Reach out to a counselor!</p>
                    <Button 
                      className="mt-4 bg-[#00A3E0] hover:bg-[#33B5E5]" 
                      onClick={() => navigate('/counselors')}
                    >
                      Find a Counselor
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {queries.map((query) => (
                      <div key={query.id} className="bg-[#1A2526] p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{query.subject}</p>
                            <p className="text-xs text-muted-foreground">
                              To: {query.counselors?.full_name || 'Counselor'} • {format(new Date(query.created_at), 'PPp')}
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs ${
                            query.status === 'resolved' 
                              ? 'bg-green-500/20 text-green-400' 
                              : query.status === 'in_progress' 
                                ? 'bg-blue-500/20 text-blue-400' 
                                : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {query.status}
                          </div>
                        </div>
                        <div className="border-l-2 border-primary/30 pl-3 py-1 mb-3 line-clamp-2">
                          <p className="text-sm text-muted-foreground">
                            {query.content}
                          </p>
                        </div>
                        {query.query_responses && query.query_responses.length > 0 ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full mt-2"
                          >
                            View Reply
                          </Button>
                        ) : (
                          <p className="text-xs text-center text-muted-foreground mt-2">
                            Awaiting counselor response
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
