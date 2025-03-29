
import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BlurCard from '@/components/ui/BlurCard';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import NoCounselorSelected from './NoCounselorSelected';
import useCounselorChat from '@/hooks/useCounselorChat';
import { Counselor } from '@/types/chat';

interface CounselorChatInterfaceProps {
  user?: any;
  selectedCounselorId?: string;
}

const CounselorChatInterface: React.FC<CounselorChatInterfaceProps> = ({ 
  user, 
  selectedCounselorId 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const {
    messages,
    isAnonymous,
    isLoading,
    selectedCounselor,
    guestMessageCount,
    handleSendMessage,
    toggleAnonymity,
    handleBackToChats,
    handleLogin,
    fetchCounselorById,
    MAX_GUEST_MESSAGES
  } = useCounselorChat(user, selectedCounselorId);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectCounselor = (counselorId: string) => {
    fetchCounselorById(counselorId);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)] max-w-3xl mx-auto">
      <BlurCard className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader 
          selectedCounselor={selectedCounselor} 
          isAnonymous={isAnonymous} 
          toggleAnonymity={toggleAnonymity} 
          handleBackToChats={handleBackToChats}
        />
        
        {!selectedCounselor ? (
          <NoCounselorSelected 
            onBrowseCounselors={() => navigate('/counselors')} 
            onSelectCounselor={handleSelectCounselor}
            isGuest={!user} 
            maxGuestMessages={MAX_GUEST_MESSAGES}
          />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading conversation...</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <MessageInput 
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isDisabled={!user && guestMessageCount >= MAX_GUEST_MESSAGES}
              messageLimit={!user ? {
                remaining: MAX_GUEST_MESSAGES - guestMessageCount,
                maxMessages: MAX_GUEST_MESSAGES,
                onLogin: handleLogin
              } : undefined}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {isAnonymous 
                ? "You're chatting anonymously - the counselor cannot see your identity"
                : "Your identity is visible to the counselor"}
            </p>
          </>
        )}
      </BlurCard>
    </div>
  );
};

export default CounselorChatInterface;
