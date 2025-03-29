
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ChatStats = () => {
  const [loading, setLoading] = useState(true);
  const [chatStats, setChatStats] = useState({
    totalChats: 0,
    totalMessages: 0,
    averageMessagesPerChat: 0,
    activeUsers: 0,
    activeCounselors: 0
  });

  useEffect(() => {
    const fetchChatStats = async () => {
      try {
        setLoading(true);
        
        // Fetch total chats
        const { count: totalChats, error: chatsError } = await supabase
          .from('chats')
          .select('*', { count: 'exact', head: true });
          
        if (chatsError) throw chatsError;
        
        // Fetch total messages
        const { count: totalMessages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true });
          
        if (messagesError) throw messagesError;
        
        // Fetch active users (users with at least one chat)
        const { data: activeUsersData, error: usersError } = await supabase
          .from('chats')
          .select('user_id')
          .is('counselor_id', null) // Count only AI chats for simplicity
          .not('user_id', 'is', null);
          
        if (usersError) throw usersError;
        
        const uniqueUsers = new Set(activeUsersData.map(chat => chat.user_id));
        
        // Fetch active counselors
        const { data: counselorsData, error: counselorsError } = await supabase
          .from('counselors')
          .select('id')
          .eq('is_active', true);
          
        if (counselorsError) throw counselorsError;
        
        setChatStats({
          totalChats: totalChats || 0,
          totalMessages: totalMessages || 0,
          averageMessagesPerChat: totalChats ? Math.round(totalMessages / totalChats) : 0,
          activeUsers: uniqueUsers.size,
          activeCounselors: counselorsData.length
        });
      } catch (error: any) {
        console.error('Error fetching chat stats:', error.message);
        toast({
          title: 'Error',
          description: 'Failed to load chat statistics.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatStats();
  }, []);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Total Chats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{chatStats.totalChats}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Total Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{chatStats.totalMessages}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Avg. Messages/Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{chatStats.averageMessagesPerChat}</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Chat Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <p className="text-muted-foreground">
                  Chat activity visualization would be implemented here with Recharts or similar library
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Chats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Recent chat activity would be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Active Users</span>
                    <span className="font-bold">{chatStats.activeUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Counselors</span>
                    <span className="font-bold">{chatStats.activeCounselors}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatStats;
