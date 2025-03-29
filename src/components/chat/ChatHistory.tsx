
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { MessageSquare, Bot, User, Search, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import BlurCard from '@/components/ui/BlurCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ChatHistoryProps = {
  user: any;
};

const ChatHistory: React.FC<ChatHistoryProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [aiChats, setAiChats] = useState<any[]>([]);
  const [counselorChats, setCounselorChats] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch AI chat history
        const { data: aiChatData, error: aiChatError } = await supabase
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
          .eq('user_id', user.id)
          .is('counselor_id', null)
          .order('created_at', { ascending: false });
        
        if (aiChatError) throw aiChatError;
        setAiChats(aiChatData || []);
        
        // Fetch counselor chat history
        const { data: counselorChatData, error: counselorChatError } = await supabase
          .from('chats')
          .select(`
            id,
            created_at,
            is_anonymous,
            counselor_id,
            counselors (
              full_name,
              specialization
            ),
            chat_messages (
              id,
              content,
              sender_type,
              created_at
            )
          `)
          .eq('user_id', user.id)
          .not('counselor_id', 'is', null)
          .order('created_at', { ascending: false });
        
        if (counselorChatError) throw counselorChatError;
        setCounselorChats(counselorChatData || []);
        
      } catch (error) {
        console.error('Error fetching chat history:', error);
        toast({
          title: 'Error',
          description: 'Unable to load chat history. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatHistory();
  }, [user]);

  const filterChats = (chats: any[]) => {
    if (!searchQuery && filterOption === 'all') return chats;
    
    return chats.filter(chat => {
      const hasMatchingMessages = chat.chat_messages && chat.chat_messages.some(
        (msg: any) => msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const matchesSearch = searchQuery ? hasMatchingMessages : true;
      
      // Additional filter logic can be added here if needed
      
      return matchesSearch;
    });
  };

  const handleStartNewChat = (type: 'ai' | 'counselor') => {
    navigate('/chat', { state: { tabToOpen: type } });
  };

  const handleContinueChat = (chatId: string, type: 'ai' | 'counselor') => {
    navigate('/chat', { state: { tabToOpen: type, chatId } });
  };

  const getFirstMessagePreview = (messages: any[]) => {
    if (!messages || messages.length === 0) return 'No messages';
    
    const userMessages = messages.filter(msg => msg.sender_type === 'user');
    if (userMessages.length > 0) {
      return userMessages[0].content.length > 60 
        ? `${userMessages[0].content.substring(0, 60)}...` 
        : userMessages[0].content;
    }
    
    return messages[0].content.length > 60 
      ? `${messages[0].content.substring(0, 60)}...` 
      : messages[0].content;
  };

  const renderChatCard = (chat: any, type: 'ai' | 'counselor') => {
    if (!chat.chat_messages || chat.chat_messages.length === 0) return null;
    
    return (
      <div key={chat.id} className="bg-card/40 p-4 rounded-lg shadow border border-border/50">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center">
              {type === 'ai' ? (
                <Bot className="h-4 w-4 mr-2 text-primary" />
              ) : (
                <User className="h-4 w-4 mr-2 text-primary" />
              )}
              <h3 className="font-medium">
                {type === 'ai' 
                  ? 'AI Chat Assistant' 
                  : `Counselor: ${chat.counselors?.full_name || 'Unknown'}`}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(chat.created_at), 'PPp')}
            </p>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs ${
            chat.is_anonymous 
              ? 'bg-blue-500/10 text-blue-400' 
              : 'bg-green-500/10 text-green-400'
          }`}>
            {chat.is_anonymous ? 'Anonymous' : 'Identified'}
          </div>
        </div>
        
        <div className="border-l-2 border-primary/30 pl-3 py-1 mb-3">
          <p className="text-sm text-muted-foreground break-words">
            {getFirstMessagePreview(chat.chat_messages)}
          </p>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => handleContinueChat(chat.id, type)}
        >
          Continue Chat
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col max-w-3xl mx-auto">
      <BlurCard className="flex flex-col overflow-hidden">
        <div className="flex justify-between items-center pb-4 border-b border-border/60 mb-6">
          <h2 className="font-semibold text-lg">Your Chat History</h2>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleStartNewChat('ai')}
            >
              <Bot className="h-4 w-4 mr-2" />
              New AI Chat
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleStartNewChat('counselor')}
            >
              <User className="h-4 w-4 mr-2" />
              New Counselor Chat
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search in your conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterOption} onValueChange={setFilterOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chats</SelectItem>
              <SelectItem value="ai">AI Chats</SelectItem>
              <SelectItem value="counselor">Counselor Chats</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="all">All Chats</TabsTrigger>
            <TabsTrigger value="ai">AI Chats</TabsTrigger>
            <TabsTrigger value="counselor">Counselor Chats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto px-1 py-2">
                {filterChats([...aiChats, ...counselorChats]).length > 0 ? (
                  filterChats([...aiChats, ...counselorChats])
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map(chat => {
                      const isAiChat = !chat.counselor_id;
                      return renderChatCard(chat, isAiChat ? 'ai' : 'counselor');
                    })
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                    <p className="text-muted-foreground">No chat history found</p>
                    <div className="flex justify-center space-x-3 mt-4">
                      <Button onClick={() => handleStartNewChat('ai')}>
                        Start AI Chat
                      </Button>
                      <Button onClick={() => handleStartNewChat('counselor')} variant="outline">
                        Chat with Counselor
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ai" className="mt-0">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto px-1 py-2">
                {filterChats(aiChats).length > 0 ? (
                  filterChats(aiChats).map(chat => renderChatCard(chat, 'ai'))
                ) : (
                  <div className="text-center py-12">
                    <Bot className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                    <p className="text-muted-foreground">No AI chat history found</p>
                    <Button onClick={() => handleStartNewChat('ai')} className="mt-4">
                      Start AI Chat
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="counselor" className="mt-0">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto px-1 py-2">
                {filterChats(counselorChats).length > 0 ? (
                  filterChats(counselorChats).map(chat => renderChatCard(chat, 'counselor'))
                ) : (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                    <p className="text-muted-foreground">No counselor chat history found</p>
                    <Button onClick={() => handleStartNewChat('counselor')} className="mt-4">
                      Chat with Counselor
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </BlurCard>
    </div>
  );
};

export default ChatHistory;
