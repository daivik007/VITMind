
import React from 'react';
import Layout from '@/components/Layout';
import ChatInterface from '@/components/chat/ChatInterface';

const Chat = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Anonymous Support Chat</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Speak freely with our AI assistant or connect with a VIT counselor. Your identity remains completely anonymous.
          </p>
        </div>
        
        <ChatInterface />
      </div>
    </Layout>
  );
};

export default Chat;
