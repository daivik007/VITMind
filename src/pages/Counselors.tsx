
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import CounselorCard from '@/components/counselor/CounselorCard';
import FeaturedCounselor from '@/components/counselor/FeaturedCounselor';

const counselorCategories = [
  { id: 'academic', name: 'Academic', description: 'Help with study-related stress, exam pressure, and academic challenges' },
  { id: 'relationship', name: 'Relationship', description: 'Support for relationship issues, friendships, and interpersonal conflicts' },
  { id: 'mental', name: 'Mental Health', description: 'Guidance for anxiety, depression, and emotional well-being' },
  { id: 'health', name: 'Health', description: 'Advice on physical health concerns affecting mental well-being' }
];

// Sample counselor data to use as fallback when database fetch fails
const sampleCounselors = [
  {
    id: '1',
    full_name: 'Dr. Priya Sharma',
    email: 'priya.sharma@vit.ac.in',
    specialization: 'Mental Health',
    bio: 'Specialized in helping students manage anxiety, depression, and stress during academic life.',
    availability: 'Mon-Fri, 9am-5pm',
    is_active: true,
    rating: 4.7
  },
  {
    id: '2',
    full_name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@vit.ac.in',
    specialization: 'Academic',
    bio: 'Helps students with academic challenges, study techniques, and exam preparation strategies.',
    availability: 'Tue-Thu, 10am-4pm',
    is_active: true,
    rating: 4.5
  },
  {
    id: '3',
    full_name: 'Dr. Anjali Desai',
    email: 'anjali.desai@vit.ac.in',
    specialization: 'Relationship',
    bio: 'Specialized in interpersonal relationships, conflict resolution, and social adjustment.',
    availability: 'Mon, Wed, Fri, 11am-6pm',
    is_active: true,
    rating: 4.8
  },
  {
    id: '4',
    full_name: 'Dr. Vikram Singh',
    email: 'vikram.singh@vit.ac.in',
    specialization: 'Health',
    bio: 'Guidance on physical health concerns that impact mental well-being and academic performance.',
    availability: 'Mon-Fri, 8am-3pm',
    is_active: true,
    rating: 4.6
  },
  {
    id: '5',
    full_name: 'Dr. Meera Patel',
    email: 'meera.patel@vit.ac.in',
    specialization: 'Mental Health',
    bio: 'Focuses on mindfulness, meditation, and stress-reduction techniques for students.',
    availability: 'Wed-Sat, 9am-5pm',
    is_active: true,
    rating: 4.9
  },
  {
    id: '6',
    full_name: 'Dr. Arjun Reddy',
    email: 'arjun.reddy@vit.ac.in',
    specialization: 'Academic',
    bio: 'Specializes in helping students overcome academic challenges and build effective study habits.',
    availability: 'Mon-Thu, 10am-6pm',
    is_active: true,
    rating: 4.4
  }
];

const Counselors = () => {
  const [counselors, setCounselors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [selectedCounselor, setSelectedCounselor] = useState<any>(null);
  const [featuredCounselor, setFeaturedCounselor] = useState<any>(null);
  const [usesFallbackData, setUsesFallbackData] = useState(false);
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
          
        if (error) {
          console.error('Error fetching counselors:', error.message);
          // Use sample data as fallback
          setCounselors(sampleCounselors);
          setUsesFallbackData(true);
          
          // Select a random counselor as featured from sample data
          const randomIndex = Math.floor(Math.random() * sampleCounselors.length);
          setFeaturedCounselor(sampleCounselors[randomIndex]);
          
          toast({
            title: "Using demo data",
            description: "We're showing demo counselor profiles because we couldn't connect to the database.",
            variant: "default",
          });
        } else {
          setCounselors(data || []);
          
          // Select a random counselor as featured
          if (data && data.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.length);
            setFeaturedCounselor(data[randomIndex]);
          }
        }
      } catch (error: any) {
        console.error('Error fetching counselors:', error.message);
        // Use sample data as fallback
        setCounselors(sampleCounselors);
        setUsesFallbackData(true);
        
        // Select a random counselor as featured from sample data
        const randomIndex = Math.floor(Math.random() * sampleCounselors.length);
        setFeaturedCounselor(sampleCounselors[randomIndex]);
        
        toast({
          title: "Using demo data",
          description: "We're showing demo counselor profiles while we fix a database connection issue.",
          variant: "default",
        });
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
        .from('queries')
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
      counselor.specialization?.toLowerCase().includes(category.toLowerCase())
    );
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col space-y-4 items-center justify-center min-h-[40vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading counselors...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Meet Our Counselors</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our team of experienced counselors is here to support you. 
            Choose a counselor based on their specialty to get the help you need.
          </p>
          {usesFallbackData && (
            <div className="mt-4 p-2 bg-yellow-500/10 rounded-md inline-block">
              <p className="text-yellow-400 text-sm">
                Note: Currently showing demo counselor profiles.
              </p>
            </div>
          )}
        </div>
        
        {/* Featured Counselor */}
        {featuredCounselor && (
          <div className="mb-12">
            <FeaturedCounselor 
              counselor={featuredCounselor} 
              onContactClick={(counselor) => setSelectedCounselor(counselor)}
            />
          </div>
        )}
        
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
                    <CounselorCard 
                      key={counselor.id}
                      counselor={counselor}
                      onContactClick={(counselor) => setSelectedCounselor(counselor)}
                    />
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
        
        {/* Contact Dialog */}
        <Dialog 
          open={!!selectedCounselor} 
          onOpenChange={(open) => {
            if (!open) setSelectedCounselor(null);
          }}
        >
          <DialogContent className="sm:max-w-[425px] bg-[#1A2526] border-0">
            <DialogHeader>
              <DialogTitle>Contact {selectedCounselor?.full_name}</DialogTitle>
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
              <Button 
                onClick={handleContactCounselor}
                className="bg-[#00A3E0] hover:bg-[#33B5E5]"
              >
                Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Counselors;
