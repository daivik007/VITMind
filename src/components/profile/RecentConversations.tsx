
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { MessageSquare, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatPreview } from '@/types/chat';

interface RecentConversationsProps {
  conversations: ChatPreview[];
  isLoading: boolean;
}

const RecentConversations = ({ conversations, isLoading }: RecentConversationsProps) => {
  const navigate = useNavigate();

  const handleViewChat = (counselorId: string) => {
    navigate(`/chat/counselor/${counselorId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Recent Conversations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {conversations.length === 0 ? (
          <div className="text-center py-6">
            <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground opacity-30 mb-2" />
            <p className="text-muted-foreground mb-4">No recent conversations</p>
            <Button onClick={() => navigate('/counselors')}>
              Find a Counselor
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((chat) => (
              <div key={chat.id} className="flex items-start p-3 rounded-lg border bg-card hover:bg-accent/10 transition-colors cursor-pointer" onClick={() => handleViewChat(chat.counselorId)}>
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={chat.counselorImage} alt={chat.counselorName} />
                  <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium truncate">{chat.counselorName}</h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {format(chat.lastMessageTime, 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
              </div>
            ))}
            
            <div className="flex justify-end mt-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/chat')}>
                View All Chats
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentConversations;
