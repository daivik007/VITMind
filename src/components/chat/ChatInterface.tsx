import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import BlurCard from '@/components/ui/BlurCard';
import CircularButton from '@/components/ui/CircularButton';

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

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const callGeminiAPI = async (userMessage: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: { message: userMessage },
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

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setShowOptions(false);
    
    try {
      // Get response from Gemini API
      const aiResponseText = await callGeminiAPI(text);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
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
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setShowOptions(false);
    
    try {
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
      
      setMessages(prev => [...prev, aiMessage]);
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
            />
            <CircularButton 
              type="submit" 
              variant="primary"
              disabled={!inputValue.trim()}
            >
              <Send className="h-5 w-5" />
            </CircularButton>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            Your conversations are anonymous and confidential
          </p>
        </div>
      </BlurCard>
    </div>
  );
};

export default ChatInterface;
