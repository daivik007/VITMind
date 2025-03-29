
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import ChatInterface from '@/components/chat/ChatInterface';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';
import CounselorChatInterface from '@/components/chat/CounselorChatInterface';
import ChatHistory from '@/components/chat/ChatHistory';
import { Button } from '@/components/ui/button';

const Chat = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const counselorId = params.counselorId;
  const isCounselorSpecific = location.pathname.includes('/chat/counselor/');

  useEffect(() => {
    // Check if the user is authenticated
    const checkAuth = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setIsAuthenticated(true);
          setUser(session.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        toast({
          title: 'Authentication Error',
          description: 'There was a problem verifying your session.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    // Check if the chatbot is accessible when the component mounts
    const verifyConnection = async () => {
      try {
        const response = await fetch('https://orxdsnvcykhyzzoizhxu.supabase.co/.well-known/health');
        if (!response.ok) {
          toast({
            title: 'Connection Issue',
            description: 'Unable to connect to services. Some features may be limited.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Health check error:', error);
      }
    };

    checkAuth();
    verifyConnection();

    // Set the active tab if we have a counselor ID in the URL
    if (isCounselorSpecific) {
      setActiveTab('counselor');
    }
  }, [navigate, isCounselorSpecific]);

  const handleBackToChats = () => {
    navigate('/chat');
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg text-muted-foreground">Loading chat interface...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6">
        {isCounselorSpecific ? (
          // Counselor-specific chat view
          <div>
            <Button 
              variant="ghost" 
              className="mb-4 flex items-center text-muted-foreground hover:text-foreground"
              onClick={handleBackToChats}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Chat
            </Button>
            <CounselorChatInterface user={user} selectedCounselorId={counselorId} />
          </div>
        ) : (
          // Regular chat view
          <>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">VIT Mind Support Chat</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get the support you need - chat with our AI assistant for immediate guidance or connect with a VIT counselor for personalized help.
              </p>
              {!isAuthenticated && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20 max-w-xl mx-auto">
                  <p className="text-sm text-primary-foreground">
                    <strong>Guest Mode:</strong> You can send up to 5 messages before signing in. 
                    <button 
                      onClick={() => navigate('/login')}
                      className="ml-2 underline text-primary hover:text-primary/80"
                    >
                      Sign in now
                    </button> to save your chat history and access all features.
                  </p>
                </div>
              )}
            </div>
            
            <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
                <TabsTrigger value="ai">AI Chat</TabsTrigger>
                <TabsTrigger value="counselor">Counselor Chat</TabsTrigger>
                <TabsTrigger value="history" disabled={!isAuthenticated}>Chat History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="ai" className="mt-0">
                <ChatInterface user={user} />
              </TabsContent>
              
              <TabsContent value="counselor" className="mt-0">
                <CounselorChatInterface user={user} />
              </TabsContent>
              
              <TabsContent value="history" className="mt-0">
                {isAuthenticated ? (
                  <ChatHistory user={user} />
                ) : (
                  <div className="text-center p-8 bg-secondary/30 rounded-lg">
                    <p className="text-lg font-medium mb-3">Sign in to view your chat history</p>
                    <button 
                      onClick={() => navigate('/login')}
                      className="btn-primary inline-flex items-center"
                    >
                      Sign in
                    </button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Chat;
