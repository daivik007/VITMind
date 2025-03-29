
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ChatHistoryProps {
  chats: any[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ chats }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Your AI Chat History</h2>
      
      {chats.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <MessageSquare className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              You haven't started any chat sessions yet.
            </p>
            <Button 
              className="mt-4" 
              onClick={() => navigate('/chat')}
            >
              Start a Chat
            </Button>
          </CardContent>
        </Card>
      ) : (
        chats.map((chat) => (
          <Card key={chat.id} className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Chat Session</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(chat.created_at), 'PP p')}
                </span>
              </div>
              <CardDescription>
                {chat.is_anonymous ? 'Anonymous' : 'Identified'} chat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {chat.chat_messages && chat.chat_messages.slice(0, 3).map((message: any) => (
                  <div 
                    key={message.id} 
                    className={`p-3 rounded-lg ${
                      message.sender_type === 'user' 
                        ? 'bg-primary text-primary-foreground ml-auto max-w-[80%]' 
                        : 'bg-muted max-w-[80%]'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {format(new Date(message.created_at), 'p')}
                    </p>
                  </div>
                ))}
                {chat.chat_messages && chat.chat_messages.length > 3 && (
                  <p className="text-center text-sm text-muted-foreground">
                    ... and {chat.chat_messages.length - 3} more messages
                  </p>
                )}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4" 
                onClick={() => navigate('/chat')}
              >
                Continue Chat
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default ChatHistory;
