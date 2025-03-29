
import React, { useState, useEffect } from 'react';
import { Search, Book, Coffee, Brain, Heart, Moon, Award, Calendar, UserRound, BookOpen, Headphones, Video, FileText, Sparkles } from 'lucide-react';
import Layout from '@/components/Layout';
import BlurCard from '@/components/ui/BlurCard';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CATEGORIES = [
  { id: 'all', name: 'All Resources', icon: Book },
  { id: 'Academic', name: 'Academic Success', icon: Award },
  { id: 'Mental Health', name: 'Mental Health', icon: Brain },
  { id: 'Wellbeing', name: 'Wellbeing', icon: Heart },
  { id: 'Health', name: 'Physical Health', icon: Coffee },
  { id: 'Social', name: 'Social Wellbeing', icon: Moon },
];

// Sample resources data for the added categories
const SELF_HELP_RESOURCES = [
  {
    id: 1,
    title: 'Managing Exam Anxiety: A Student\'s Guide',
    content: 'Learn effective strategies to manage anxiety before and during exams with research-backed techniques.',
    category: 'Productivity & Study Tips',
    type: 'Article',
    icon: FileText,
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    id: 2,
    title: '5-Minute Mindfulness for Busy Students',
    content: 'Quick mindfulness exercises that fit into your busy schedule between classes and study sessions.',
    category: 'Meditation & Mindfulness',
    type: 'Audio',
    icon: Headphones,
    readTime: '5 min audio',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    id: 3,
    title: 'Finding Balance: Academic and Personal Life',
    content: 'A webinar by Prof. Ramesh discussing strategies to maintain a healthy balance while pursuing academic excellence.',
    category: 'Webinars & Expert Talks',
    type: 'Video',
    icon: Video,
    readTime: '45 min video',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    id: 4,
    title: 'Overcoming Procrastination: Practical Techniques',
    content: 'Learn how to overcome procrastination with simple but effective techniques that you can apply immediately.',
    category: 'Productivity & Study Tips',
    type: 'Article',
    icon: FileText,
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    id: 5,
    title: 'Deep Relaxation Meditation for Better Sleep',
    content: 'A guided meditation session designed to help you relax deeply and improve your sleep quality.',
    category: 'Meditation & Mindfulness',
    type: 'Audio',
    icon: Headphones,
    readTime: '15 min audio',
    image: 'https://images.unsplash.com/photo-1531353826977-0941b4779a1c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    id: 6,
    title: 'Effective Time Management for Students',
    content: 'An expert session on how to manage your time effectively during your academic year.',
    category: 'Webinars & Expert Talks',
    type: 'Video',
    icon: Video,
    readTime: '30 min video',
    image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    id: 7,
    title: 'Building Resilience During Academic Challenges',
    content: 'A comprehensive guide on how to build mental resilience when facing academic challenges.',
    category: 'Self-Help Blogs',
    type: 'Article',
    icon: FileText,
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  }
];

const RESOURCE_CATEGORIES = [
  { 
    id: 'productivity', 
    name: 'Productivity & Study Tips', 
    icon: BookOpen,
    description: 'Learn techniques to enhance your study sessions and boost productivity',
    color: 'bg-blue-400/10 text-blue-400'
  },
  { 
    id: 'meditation', 
    name: 'Meditation & Mindfulness', 
    icon: Sparkles,
    description: 'Guided practices to reduce stress and improve focus and awareness',
    color: 'bg-purple-400/10 text-purple-400'
  },
  { 
    id: 'audio', 
    name: 'Audio Therapy Sessions', 
    icon: Headphones,
    description: 'Calming audio sessions designed to promote mental wellbeing',
    color: 'bg-green-400/10 text-green-400'
  },
  { 
    id: 'webinars', 
    name: 'Webinars & Expert Talks', 
    icon: Video,
    description: 'Recorded sessions with mental health professionals and experts',
    color: 'bg-amber-400/10 text-amber-400'
  },
  { 
    id: 'blogs', 
    name: 'Self-Help Blogs', 
    icon: FileText,
    description: 'Articles with practical advice and insights for students',
    color: 'bg-pink-400/10 text-pink-400'
  }
];

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeResourceType, setActiveResourceType] = useState('all');
  const [blogs, setBlogs] = useState<any[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selfHelpResources, setSelfHelpResources] = useState(SELF_HELP_RESOURCES);
  
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select(`
            *,
            counselors (
              full_name,
              profile_image_url,
              specialization
            )
          `)
          .eq('published', true)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setBlogs(data || []);
      } catch (error: any) {
        console.error('Error fetching blogs:', error.message);
        toast({
          title: "Error",
          description: "Failed to load resources",
          variant: "destructive"
        });
        
        // If we can't fetch blogs, still show self-help resources
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          blog.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || 
                           (blog.counselors?.specialization === activeCategory);
    
    return matchesSearch && matchesCategory;
  });

  const filteredSelfHelpResources = selfHelpResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          resource.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = activeResourceType === 'all' || resource.category.includes(activeResourceType);
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse text-center">
            <p className="text-lg text-muted-foreground">Loading resources...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Mental Health Resources</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our collection of tools, guides, and materials designed to support your wellbeing
          </p>
        </div>
        
        {selectedBlog ? (
          <div className="max-w-3xl mx-auto">
            <button 
              onClick={() => setSelectedBlog(null)}
              className="mb-6 text-sm text-muted-foreground hover:text-primary flex items-center"
            >
              ← Back to all resources
            </button>
            
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">{selectedBlog.title}</CardTitle>
                <CardDescription className="flex items-center mt-2">
                  <div className="flex items-center mr-4">
                    <UserRound className="h-4 w-4 mr-1" />
                    {selectedBlog.counselors?.full_name || 'VIT Counselor'}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(selectedBlog.created_at), 'PP')}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm sm:prose max-w-none">
                  {selectedBlog.content.split('\n').map((paragraph: string, index: number) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="relative max-w-lg mx-auto mb-8">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>

              <Tabs defaultValue="featured" className="w-full">
                <TabsList className="grid grid-cols-2 max-w-lg mx-auto mb-8">
                  <TabsTrigger value="featured">Featured</TabsTrigger>
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                </TabsList>

                <TabsContent value="featured">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-6">Featured Resources</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {filteredSelfHelpResources.slice(0, 3).map((resource) => (
                        <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="relative h-48 overflow-hidden">
                            <img src={resource.image} alt={resource.title} className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3 bg-black/60 px-3 py-1 rounded-full text-xs">
                              {resource.category}
                            </div>
                            <div className="absolute bottom-3 right-3 bg-black/60 px-3 py-1 rounded-full text-xs flex items-center">
                              <resource.icon className="h-3 w-3 mr-1" />
                              {resource.readTime}
                            </div>
                          </div>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {resource.content}
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Button variant="ghost" className="text-primary">
                              View Resource →
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-6">All Resources</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {filteredSelfHelpResources.map((resource) => (
                        <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="relative h-48 overflow-hidden">
                            <img src={resource.image} alt={resource.title} className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3 bg-black/60 px-3 py-1 rounded-full text-xs">
                              {resource.category}
                            </div>
                            <div className="absolute bottom-3 right-3 bg-black/60 px-3 py-1 rounded-full text-xs flex items-center">
                              <resource.icon className="h-3 w-3 mr-1" />
                              {resource.readTime}
                            </div>
                          </div>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {resource.content}
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Button variant="ghost" className="text-primary">
                              View Resource →
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="categories">
                  <div className="mb-10">
                    <h2 className="text-2xl font-bold mb-6">Resource Categories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {RESOURCE_CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        return (
                          <Card key={category.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                              <div className="flex items-start space-x-4">
                                <div className={`p-3 rounded-lg ${category.color}`}>
                                  <Icon className="h-6 w-6" />
                                </div>
                                <div>
                                  <CardTitle>{category.name}</CardTitle>
                                  <CardDescription className="mt-1">
                                    {category.description}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardFooter>
                              <Button variant="ghost" className="text-primary">
                                Browse {category.name} →
                              </Button>
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-6">Counselor Articles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {filteredBlogs.length > 0 ? (
                        filteredBlogs.map((blog) => (
                          <Card 
                            key={blog.id} 
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedBlog(blog)}
                          >
                            <CardHeader className="pb-2">
                              <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                              <CardDescription className="flex items-center mt-2">
                                <div className="flex items-center">
                                  <Avatar className="h-5 w-5 mr-2">
                                    <AvatarImage src={blog.counselors?.profile_image_url} alt={blog.counselors?.full_name} />
                                    <AvatarFallback><UserRound className="h-3 w-3" /></AvatarFallback>
                                  </Avatar>
                                  {blog.counselors?.full_name || 'VIT Counselor'}
                                </div>
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                {blog.content}
                              </p>
                              <div className="flex justify-between items-center">
                                <p className="text-xs text-muted-foreground flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {format(new Date(blog.created_at), 'PP')}
                                </p>
                                {blog.counselors?.specialization && (
                                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                    {blog.counselors.specialization}
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="col-span-3 text-center py-12">
                          <p className="text-muted-foreground">No counselor articles available at the moment.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Emergency Support Section */}
            <div className="mt-16">
              <BlurCard className="border-l-4 border-l-destructive p-6">
                <div className="flex items-start">
                  <div className="mr-4">
                    <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-destructive"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Need Immediate Help?</h3>
                    <p className="text-muted-foreground mb-4">
                      If you're experiencing a mental health emergency or having thoughts of harming yourself,
                      please reach out for immediate assistance.
                    </p>
                    <div className="space-y-2">
                      <p className="font-medium">VIT Campus Emergency Contact: <span className="text-primary">+91 98765 43210</span></p>
                      <p className="font-medium">National Mental Health Helpline: <span className="text-primary">1800-599-0019</span></p>
                    </div>
                  </div>
                </div>
              </BlurCard>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Resources;
