
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Counselor, Message } from '@/types/chat';

const GUEST_COUNSELOR_MESSAGES_KEY = 'guest_counselor_messages';
const GUEST_SELECTED_COUNSELOR_KEY = 'guest_selected_counselor';
const MAX_GUEST_MESSAGES = 5;

export function useCounselorChat(user?: any, selectedCounselorId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [guestMessageCount, setGuestMessageCount] = useState(0);
  const navigate = useNavigate();

  // Load guest user chat data from localStorage
  useEffect(() => {
    if (!user) {
      const storedMessages = localStorage.getItem(GUEST_COUNSELOR_MESSAGES_KEY);
      const storedCounselorJson = localStorage.getItem(GUEST_SELECTED_COUNSELOR_KEY);
      
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        setMessages(parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
        setGuestMessageCount(parsedMessages.filter((msg: any) => msg.sender === 'user').length);
      }
      
      if (storedCounselorJson) {
        const counselor = JSON.parse(storedCounselorJson);
        setSelectedCounselor(counselor);
      }
    }
  }, [user]);

  // Fetch counselor if ID is provided
  useEffect(() => {
    if (selectedCounselorId) {
      fetchCounselorById(selectedCounselorId);
    }
  }, [selectedCounselorId]);

  // Fetch all counselors
  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const { data, error } = await supabase
          .from('counselors')
          .select('id, full_name, specialization, bio, profile_image_url')
          .eq('is_active', true);
          
        if (error) throw error;
        
        // Explicitly cast the data to avoid TypeScript error
        const counselorData = (data || []) as Counselor[];
        setCounselors(counselorData);
      } catch (error) {
        console.error('Error fetching counselors:', error);
        toast({
          title: 'Error',
          description: 'Unable to load counselors. Please try again later.',
          variant: 'destructive',
        });
      }
    };
    
    fetchCounselors();
  }, []);

  // Load existing chat or create new one
  useEffect(() => {
    const loadExistingChat = async () => {
      if (!selectedCounselor || !user) return;
      
      setIsLoading(true);
      try {
        // Check for existing chat
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .select('id')
          .eq('user_id', user.id)
          .eq('counselor_id', selectedCounselor.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (chatError) throw chatError;
        
        if (chatData && chatData.length > 0) {
          setChatId(chatData[0].id);
          
          // Load chat messages
          const { data: messagesData, error: messagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('chat_id', chatData[0].id)
            .order('created_at', { ascending: true });
            
          if (messagesError) throw messagesError;
          
          if (messagesData) {
            const formattedMessages = messagesData.map((msg: any) => ({
              id: msg.id,
              text: msg.content,
              sender: msg.sender_type as 'user' | 'counselor',
              timestamp: new Date(msg.created_at),
            }));
            
            setMessages(formattedMessages);
            
            if (formattedMessages.length === 0) {
              addWelcomeMessage();
            }
          }
        } else {
          // Create new chat
          const { data: newChat, error: newChatError } = await supabase
            .from('chats')
            .insert({
              user_id: user.id,
              counselor_id: selectedCounselor.id,
              is_anonymous: isAnonymous,
              title: `Chat with ${selectedCounselor.full_name}`,
              last_message_at: new Date().toISOString()
            })
            .select();
            
          if (newChatError) throw newChatError;
          
          if (newChat && newChat.length > 0) {
            setChatId(newChat[0].id);
            addWelcomeMessage();
          }
        }
      } catch (error) {
        console.error('Error loading chat:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chat. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadExistingChat();
    } else if (selectedCounselor && messages.length === 0) {
      addWelcomeMessage();
    }
  }, [selectedCounselor, user, isAnonymous]);

  const fetchCounselorById = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('counselors')
        .select('id, full_name, specialization, bio, profile_image_url')
        .eq('id', id)
        .eq('is_active', true)
        .single();
        
      if (error) throw error;
      
      if (data) {
        const counselor: Counselor = {
          id: data.id,
          full_name: data.full_name,
          specialization: data.specialization,
          bio: data.bio,
          profile_image_url: data.profile_image_url
        };
        
        setSelectedCounselor(counselor);
        
        if (!user) {
          localStorage.setItem(GUEST_SELECTED_COUNSELOR_KEY, JSON.stringify(counselor));
        }
      }
    } catch (error) {
      console.error('Error fetching counselor:', error);
      toast({
        title: 'Error',
        description: 'Unable to load counselor. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const addWelcomeMessage = () => {
    if (selectedCounselor) {
      const welcomeMessage = {
        id: 'welcome',
        text: `Hello! I'm ${selectedCounselor.full_name}, a counselor specializing in ${selectedCounselor.specialization}. How can I help you today?`,
        sender: 'counselor' as const,
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
      
      if (!user) {
        localStorage.setItem(GUEST_COUNSELOR_MESSAGES_KEY, JSON.stringify([welcomeMessage]));
      }
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !selectedCounselor) return;
    
    if (!user && guestMessageCount >= MAX_GUEST_MESSAGES) {
      toast({
        title: 'Message Limit Reached',
        description: 'Please sign in to continue chatting with counselors.',
        variant: 'default',
      });
      navigate('/login', { state: { returnTo: '/chat', message: 'Please log in to continue your conversation.' } });
      return;
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date(),
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    if (!user) {
      setGuestMessageCount(prev => prev + 1);
      localStorage.setItem(GUEST_COUNSELOR_MESSAGES_KEY, JSON.stringify(updatedMessages));
    }
    
    try {
      if (user && chatId) {
        // Update the last_message_at time in the chat
        await supabase
          .from('chats')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', chatId);
        
        const { error } = await supabase
          .from('chat_messages')
          .insert({
            chat_id: chatId,
            content: userMessage.text,
            sender_type: 'user',
          });
          
        if (error) throw error;
      }
      
      setTimeout(() => {
        const counselorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Thank you for your message. A counselor will respond soon. This is a simulated response for demonstration purposes.",
          sender: 'counselor',
          timestamp: new Date(),
        };
        
        const newUpdatedMessages = [...updatedMessages, counselorMessage];
        setMessages(newUpdatedMessages);
        
        if (!user) {
          localStorage.setItem(GUEST_COUNSELOR_MESSAGES_KEY, JSON.stringify(newUpdatedMessages));
        } else if (chatId) {
          supabase
            .from('chat_messages')
            .insert({
              chat_id: chatId,
              content: counselorMessage.text,
              sender_type: 'counselor',
            })
            .then(({ error }) => {
              if (error) console.error('Error saving counselor message:', error);
            });
        }
      }, 3000);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const toggleAnonymity = () => {
    setIsAnonymous(prev => !prev);
    
    toast({
      title: isAnonymous ? 'Anonymity Disabled' : 'Anonymity Enabled',
      description: isAnonymous 
        ? 'Counselors will now be able to see your identity.' 
        : 'Your identity will be hidden from counselors.',
    });
  };

  const handleBackToChats = () => {
    navigate('/chat');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return {
    messages,
    inputValue,
    setInputValue,
    isAnonymous,
    isLoading,
    selectedCounselor,
    counselors,
    guestMessageCount,
    handleSendMessage,
    toggleAnonymity,
    handleBackToChats,
    handleLogin,
    fetchCounselorById,
    MAX_GUEST_MESSAGES
  };
}

export default useCounselorChat;
