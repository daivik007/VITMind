
import React from 'react';
import { User, MessageSquare } from 'lucide-react';
import { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  return (
    <div 
      key={message.id} 
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div 
        className={`flex max-w-[80%] ${
          message.sender === 'user' 
            ? 'bg-primary/20 rounded-t-2xl rounded-bl-2xl' 
            : 'bg-secondary rounded-t-2xl rounded-br-2xl'
        } p-3 animate-fade-in`}
      >
        <div className="flex items-start">
          <div className="mr-2 mt-1">
            {message.sender === 'user' ? (
              <div className="h-6 w-6 rounded-full bg-primary/30 flex items-center justify-center">
                <User className="h-3 w-3" />
              </div>
            ) : (
              <div className="h-6 w-6 rounded-full bg-secondary/80 flex items-center justify-center">
                <MessageSquare className="h-3 w-3" />
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
  );
};

export default MessageBubble;
