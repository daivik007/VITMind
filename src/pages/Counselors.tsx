
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { UserRound, Mail, Calendar, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';

const counselorCategories = [
  { id: 'academic', name: 'Academic', description: 'Help with study-related stress, exam pressure, and academic challenges' },
  { id: 'relationship', name: 'Relationship', description: 'Support for relationship issues, friendships, and interpersonal conflicts' },
  { id: 'mental', name: 'Mental Health', description: 'Guidance for anxiety, depression, and emotional well-being' },
  { id: 'health', name: 'Health', description: 'Advice on physical health concerns affecting mental well-being' }
];

const Counselors = () => {
  const [counselors, setCounselors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [selectedCounselor, setSelectedCounselor] = useState<any>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    checkUser();
    
    const fetchCounselors = async () => {
      try {
        const { data, error } = await supabase
          .from('counselors')
          .select('*')
          .eq('is_active', true);
          
        if (error) throw error;
        setCounselors(data || []);
      } catch (error: any) {
        console.error('Error fetching counselors:', error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCounselors();
  }, []);
  
  const handleContactCounselor = async () => {
    if (!subject.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login', { 
        state: { 
          returnTo: '/counselors',
          counselorId: selectedCounselor?.id,
          message: 'Please sign in to contact a counselor'
        } 
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('counselor_queries')
        .insert({
          user_id: user.id,
          counselor_id: selectedCounselor.id,
          subject: subject,
          content: content,
          is_anonymous: isAnonymous,
          status: 'pending'
        });
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Your message has been sent to the counselor",
      });
      
      setSubject('');
      setContent('');
      setSelectedCounselor(null);
    } catch (error: any) {
      console.error('Error submitting query:', error.message);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const getCounselorsByCategory = (category: string) => {
    return counselors.filter(counselor => 
      counselor.specialization.toLowerCase().includes(category.toLowerCase())
    );
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse flex flex-col space-y-4 items-center justify-center min-h-[40vh]">
            <div className="h-8 w-64 bg-muted rounded"></div>
            <div className="h-4 w-48 bg-muted rounded"></div>
            <div className="h-4 w-48 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Meet Our Counselors</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our team of experienced counselors is here to support you. 
            Choose a counselor based on their specialty to get the help you need.
          </p>
        </div>
        
        <Tabs defaultValue="academic" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {counselorCategories.map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="py-3"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {counselorCategories.map(category => (
            <TabsContent key={category.id} value={category.id}>
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">{category.name} Counselors</h2>
                <p className="text-muted-foreground">{category.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getCounselorsByCategory(category.id).length > 0 ? (
                  getCounselorsByCategory(category.id).map(counselor => (
                    <Card key={counselor.id} className="overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{counselor.full_name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{counselor.specialization}</p>
                          </div>
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserRound className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <p className="text-sm mb-4 line-clamp-3">{counselor.bio}</p>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="h-4 w-4 mr-2" />
                            <span>{counselor.email}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{counselor.availability}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              onClick={() => setSelectedCounselor(counselor)}
                              className="w-full"
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Chat with Counselor
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Contact {counselor.full_name}</DialogTitle>
                              <DialogDescription>
                                Send a message to start a conversation. They will respond to you as soon as possible.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="subject">Subject</Label>
                                <input
                                  id="subject"
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  placeholder="What would you like to discuss?"
                                  value={subject}
                                  onChange={(e) => setSubject(e.target.value)}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                  id="message"
                                  placeholder="Provide a brief description of your concern..."
                                  className="resize-none min-h-[120px]"
                                  value={content}
                                  onChange={(e) => setContent(e.target.value)}
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id="anonymous" 
                                  checked={isAnonymous} 
                                  onCheckedChange={(checked) => setIsAnonymous(!!checked)}
                                />
                                <Label htmlFor="anonymous" className="text-sm">
                                  Keep my identity anonymous
                                </Label>
                              </div>
                              {!user && (
                                <div className="text-sm text-amber-500 italic">
                                  You'll need to sign in to send a message, but you can browse counselors for now.
                                </div>
                              )}
                            </div>
                            <DialogFooter>
                              <Button onClick={handleContactCounselor}>
                                Send Message
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground">
                      No counselors available in this category at the moment.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Counselors;
