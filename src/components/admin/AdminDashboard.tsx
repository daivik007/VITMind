
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCog, MessageSquare, BarChart } from 'lucide-react';
import UsersList from './UsersList';
import CounselorManagement from './CounselorManagement';
import ChatStats from './ChatStats';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage users, counselors and view analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
          <Button variant="default" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Add Counselor
          </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="counselors">Counselors</TabsTrigger>
          <TabsTrigger value="chats">Chats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-3xl font-bold">254</div>
                  <div className="ml-2 text-sm text-green-500">+12% ↑</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Active Counselors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-3xl font-bold">18</div>
                  <div className="ml-2 text-sm text-green-500">+2 ↑</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Chats Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-3xl font-bold">78</div>
                  <div className="ml-2 text-sm text-green-500">+25% ↑</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg border">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">New chat session between <strong>John Doe</strong> and <strong>Dr. Smith</strong></p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <UsersList />
        </TabsContent>
        
        <TabsContent value="counselors">
          <CounselorManagement />
        </TabsContent>
        
        <TabsContent value="chats">
          <ChatStats />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
