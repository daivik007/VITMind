
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Shield, BookOpen, ArrowRight, Users } from 'lucide-react';
import BlurCard from '@/components/ui/BlurCard';
import Layout from '@/components/Layout';

const Index = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6">
        {/* Hero Section */}
        <div className="py-16 md:py-24 flex flex-col items-center justify-center text-center">
          <div className="animate-float inline-block mb-6 p-2 rounded-2xl bg-primary/10 text-primary">
            <Shield className="h-10 w-10 md:h-12 md:w-12" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 animate-fade-in">
            Your Mental Wellbeing <br className="hidden md:block" /> 
            <span className="text-primary">Matters at VIT</span>
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            A safe, anonymous platform for VIT students to connect with counselors and access mental health resources.
          </p>
          <div className="flex flex-wrap gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Link to="/chat" className="btn-primary">
              <MessageSquare className="mr-2 h-5 w-5" />
              <span>Chat Anonymously</span>
            </Link>
            <Link to="/counselors" className="btn-secondary">
              <Users className="mr-2 h-5 w-5" />
              <span>Meet Our Counselors</span>
            </Link>
            <Link to="/resources" className="btn-secondary">
              <BookOpen className="mr-2 h-5 w-5" />
              <span>Explore Resources</span>
            </Link>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <BlurCard className="flex flex-col h-full">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">100% Anonymous</h3>
            <p className="text-muted-foreground flex-1">
              Your identity remains completely private. We verify you're a VIT student, but your chats are anonymous.
            </p>
          </BlurCard>
          
          <BlurCard className="flex flex-col h-full">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Talk to Professionals</h3>
            <p className="text-muted-foreground flex-1">
              Connect with qualified VIT counselors who are dedicated to supporting your mental wellbeing.
            </p>
          </BlurCard>
          
          <BlurCard className="flex flex-col h-full">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Helpful Resources</h3>
            <p className="text-muted-foreground flex-1">
              Access a curated collection of mental health resources, tips, and techniques specifically for students.
            </p>
          </BlurCard>
        </div>
        
        {/* How It Works Section */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've made the process simple and secure to ensure you get the support you need
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative flex flex-col items-center text-center">
              <div className="absolute top-10 right-0 hidden md:block w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
              <div className="h-20 w-20 rounded-full bg-secondary border border-primary/20 flex items-center justify-center mb-4 z-10">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse Counselors</h3>
              <p className="text-muted-foreground">
                Explore our counselors by category and find the right match for your needs.
              </p>
            </div>
            
            <div className="relative flex flex-col items-center text-center">
              <div className="absolute top-10 right-0 hidden md:block w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
              <div className="h-20 w-20 rounded-full bg-secondary border border-primary/20 flex items-center justify-center mb-4 z-10">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Anonymous Chat</h3>
              <p className="text-muted-foreground">
                Begin chatting with our AI assistant or request to connect with a VIT counselor.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-secondary border border-primary/20 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Support</h3>
              <p className="text-muted-foreground">
                Receive personalized support and resources to help with your mental wellbeing journey.
              </p>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="py-16">
          <BlurCard className="text-center p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to talk with someone?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Your mental wellbeing matters. Connect with a counselor now or explore our resources to find the support you need.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/counselors" className="btn-primary">
                <Users className="mr-2 h-5 w-5" />
                <span>Meet Our Counselors</span>
              </Link>
              <Link to="/login" className="btn-secondary flex items-center">
                <span>Sign In with VIT Email</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </BlurCard>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
