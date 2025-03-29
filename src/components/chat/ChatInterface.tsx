
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import BlurCard from '@/components/ui/BlurCard';
import CircularButton from '@/components/ui/CircularButton';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'counselor';
  timestamp: Date;
};

type ChatOption = {
  id: string;
  text: string;
  aiResponse?: string;
};

// Constants
const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    text: "Hello! I'm here to support you. You can chat with me about how you're feeling, or connect with a VIT counselor. Everything you share is completely anonymous.",
    sender: 'ai',
    timestamp: new Date(),
  },
];

const CHAT_OPTIONS: ChatOption[] = [
  {
    id: 'stress',
    text: "I'm feeling stressed about exams",
    aiResponse: "Exam stress is completely normal. Some things that might help include: creating a study schedule, taking short breaks, practicing deep breathing, and getting enough sleep. Would you like to talk more about specific strategies, or would you prefer to connect with a VIT counselor who specializes in academic stress?",
  },
  {
    id: 'lonely',
    text: "I'm feeling lonely or isolated",
    aiResponse: "I'm sorry you're feeling this way. Many students experience loneliness, especially in new environments. Consider joining campus clubs, study groups, or attending events that interest you. Would you like me to provide more specific social connection strategies, or would you prefer to speak with a VIT counselor about these feelings?",
  },
  {
    id: 'anxious',
    text: "I've been feeling anxious lately",
    aiResponse: "Anxiety can be challenging to deal with. Some helpful techniques include mindfulness practices, regular exercise, limiting caffeine, and talking to someone you trust. Would you like to explore specific anxiety-management techniques, or would you prefer to connect with a VIT counselor who specializes in anxiety support?",
  },
];

// Guest chat storage keys
const GUEST_MESSAGES_KEY = 'guest_chat_messages';
const MAX_GUEST_MESSAGES = 5;

const ChatInterface = ({ user }: { user?: any }) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const [guestMessageCount, setGuestMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load guest messages from localStorage if not logged in
  useEffect(() => {
    if (!user) {
      const storedMessages = localStorage.getItem(GUEST_MESSAGES_KEY);
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        setMessages(parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
        setGuestMessageCount(parsedMessages.filter((msg: any) => msg.sender === 'user').length);
        
        if (parsedMessages.length > 1) {
          setShowOptions(false);
        }
      }
    }
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create or retrieve chat session for logged-in users
  useEffect(() => {
    const initializeChat = async () => {
      if (!user) return;
      
      try {
        // Check for existing active chat
        const { data: existingChats, error: fetchError } = await supabase
          .from('chats')
          .select('id')
          .eq('user_id', user.id)
          .is('counselor_id', null)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (fetchError) throw fetchError;
        
        if (existingChats && existingChats.length > 0) {
          // Use existing chat
          setChatId(existingChats[0].id);
          
          // Load messages from this chat
          const { data: messagesData, error: messagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('chat_id', existingChats[0].id)
            .order('created_at', { ascending: true });
            
          if (messagesError) throw messagesError;
          
          if (messagesData && messagesData.length > 0) {
            const formattedMessages = messagesData.map(msg => ({
              id: msg.id,
              text: msg.content,
              sender: msg.sender_type as 'user' | 'ai' | 'counselor',
              timestamp: new Date(msg.created_at),
            }));
            
            setMessages(formattedMessages);
            setShowOptions(false);
          }
        } else {
          // Create new chat
          const { data: newChat, error: createError } = await supabase
            .from('chats')
            .insert({
              user_id: user.id,
              is_anonymous: true,
            })
            .select();
            
          if (createError) throw createError;
          
          if (newChat) {
            setChatId(newChat[0].id);
            
            // Save initial AI message
            const { error: messageError } = await supabase
              .from('chat_messages')
              .insert({
                chat_id: newChat[0].id,
                content: INITIAL_MESSAGES[0].text,
                sender_type: 'ai',
              });
              
            if (messageError) throw messageError;
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };
    
    if (user) {
      initializeChat();
    }
  }, [user]);

  const callGeminiAPI = async (userMessage: string) => {
    try {
      // Format messages in the expected structure
      const formattedMessages = messages.concat({
        id: Date.now().toString(),
        text: userMessage,
        sender: 'user',
        timestamp: new Date(),
      }).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        content: msg.text
      }));

      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: { messages: formattedMessages },
      });

      if (error) {
        console.error('Error calling Gemini API:', error);
        return "I'm having trouble processing your request. Please try again later.";
      }

      return data.response;
    } catch (error) {
      console.error('Exception calling Gemini API:', error);
      return "I'm having trouble connecting to my knowledge base. Please try again later.";
    }
  };

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim()) return;

    // For guest users, check if they've reached the message limit
    if (!user && guestMessageCount >= MAX_GUEST_MESSAGES) {
      toast({
        title: 'Message Limit Reached',
        description: 'Please sign in to continue using the chat feature.',
        variant: 'default',
      });
      navigate('/login', { state: { returnTo: '/chat', message: 'Please log in to continue your conversation.' } });
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date(),
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);
    setShowOptions(false);

    // Update guest message count and save to localStorage if not logged in
    if (!user) {
      setGuestMessageCount(prev => prev + 1);
      localStorage.setItem(GUEST_MESSAGES_KEY, JSON.stringify(updatedMessages));
    }
    
    try {
      // Save user message to database if authenticated
      if (user && chatId) {
        await supabase
          .from('chat_messages')
          .insert({
            chat_id: chatId,
            content: userMessage.text,
            sender_type: 'user',
          });
      }
      
      // Get response from Gemini API
      const aiResponseText = await callGeminiAPI(text);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      
      // Save to localStorage for guest users
      if (!user) {
        localStorage.setItem(GUEST_MESSAGES_KEY, JSON.stringify(finalMessages));
      }
      
      // Save AI response to database if authenticated
      if (user && chatId) {
        await supabase
          .from('chat_messages')
          .insert({
            chat_id: chatId,
            content: aiResponseText,
            sender_type: 'ai',
          });
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Communication Error",
        description: "Could not connect to AI assistant. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleOptionClick = async (option: ChatOption) => {
    // Send user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: option.text,
      sender: 'user',
      timestamp: new Date(),
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);
    setShowOptions(false);
    
    // Update guest message count and save to localStorage if not logged in
    if (!user) {
      setGuestMessageCount(prev => prev + 1);
      localStorage.setItem(GUEST_MESSAGES_KEY, JSON.stringify(updatedMessages));
    }
    
    try {
      // Save user message to database if authenticated
      if (user && chatId) {
        await supabase
          .from('chat_messages')
          .insert({
            chat_id: chatId,
            content: userMessage.text,
            sender_type: 'user',
          });
      }
      
      // If there's a predefined AI response for this option, use it
      // Otherwise call the Gemini API
      let aiResponseText = option.aiResponse;
      
      if (!aiResponseText) {
        aiResponseText = await callGeminiAPI(option.text);
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      
      // Save to localStorage for guest users
      if (!user) {
        localStorage.setItem(GUEST_MESSAGES_KEY, JSON.stringify(finalMessages));
      }
      
      // Save AI response to database if authenticated
      if (user && chatId) {
        await supabase
          .from('chat_messages')
          .insert({
            chat_id: chatId,
            content: aiMessage.text,
            sender_type: 'ai',
          });
      }
    } catch (error) {
      console.error('Error processing option:', error);
      toast({
        title: "Communication Error",
        description: "Could not connect to AI assistant. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleConnectCounselor = () => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      text: "Connecting you to a VIT counselor. Please wait a moment while we find someone available to chat with you anonymously...",
      sender: 'ai',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, systemMessage]);
    
    // Simulate counselor joining after delay
    setTimeout(() => {
      const counselorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Hello, I'm a counselor from VIT's Student Wellness Office. I'm here to support you. Feel free to share what's on your mind, and remember this conversation is completely anonymous.",
        sender: 'counselor',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, counselorMessage]);
    }, 3000);
  };

  const getMessageLimitInfo = () => {
    if (!user) {
      const remaining = MAX_GUEST_MESSAGES - guestMessageCount;
      return (
        <div className="mb-2 text-xs text-amber-400 font-medium">
          Guest mode: {remaining} {remaining === 1 ? 'message' : 'messages'} remaining. <Button variant="link" className="p-0 h-auto text-xs text-primary" onClick={() => navigate('/login')}>Sign in</Button> to continue.
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)] max-w-3xl mx-auto">
      <BlurCard className="flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center pb-4 border-b border-border/60">
          <h2 className="font-semibold text-lg">Anonymous Support Chat</h2>
          <button 
            onClick={handleConnectCounselor}
            className="text-sm px-4 py-1.5 rounded-full bg-accent text-accent-foreground font-medium hover:bg-accent/80 transition-colors"
          >
            Connect with Counselor
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender !== 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div 
                className={`flex max-w-[80%] ${
                  message.sender === 'user' 
                    ? 'bg-primary/20 rounded-t-2xl rounded-bl-2xl' 
                    : message.sender === 'ai'
                      ? 'bg-secondary rounded-t-2xl rounded-br-2xl' 
                      : 'bg-accent/20 rounded-t-2xl rounded-br-2xl'
                } p-3 animate-fade-in`}
              >
                <div className="flex items-start">
                  <div className="mr-2 mt-1">
                    {message.sender === 'user' ? (
                      <div className="h-6 w-6 rounded-full bg-primary/30 flex items-center justify-center">
                        <User className="h-3 w-3" />
                      </div>
                    ) : message.sender === 'ai' ? (
                      <div className="h-6 w-6 rounded-full bg-secondary/80 flex items-center justify-center">
                        <Bot className="h-3 w-3" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-accent/30 flex items-center justify-center">
                        <User className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm break-words">
                      {message.text}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-secondary rounded-2xl p-3 animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          {showOptions && !isTyping && messages.length < 3 && (
            <div className="space-y-2 animate-fade-in">
              <div className="text-xs text-muted-foreground">Suggested topics:</div>
              {CHAT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  className="block w-full text-left p-2.5 rounded-xl bg-secondary/60 hover:bg-secondary/90 transition-colors text-sm"
                >
                  {option.text}
                </button>
              ))}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="pt-4 border-t border-border/60">
          {getMessageLimitInfo()}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 input-field"
              disabled={(!user && guestMessageCount >= MAX_GUEST_MESSAGES) || isTyping}
            />
            <CircularButton 
              type="submit" 
              variant="primary"
              disabled={!inputValue.trim() || isTyping || (!user && guestMessageCount >= MAX_GUEST_MESSAGES)}
            >
              <Send className="h-5 w-5" />
            </CircularButton>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            Your conversations are anonymous and confidential
          </p>
          {!user && (
            <p className="text-xs text-primary mt-1">
              <Button variant="link" className="p-0 h-auto text-xs" onClick={() => navigate('/login')}>
                Sign in
              </Button> for unlimited chats and to save your conversation history.
            </p>
          )}
        </div>
      </BlurCard>
    </div>
  );
};

export default ChatInterface;
