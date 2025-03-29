
import React, { useState, useEffect } from 'react';
import { Search, Book, Coffee, Brain, Heart, Moon, Award, Calendar, UserRound } from 'lucide-react';
import Layout from '@/components/Layout';
import BlurCard from '@/components/ui/BlurCard';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

const CATEGORIES = [
  { id: 'all', name: 'All Resources', icon: Book },
  { id: 'Academic', name: 'Academic Success', icon: Award },
  { id: 'Mental Health', name: 'Mental Health', icon: Brain },
  { id: 'Wellbeing', name: 'Wellbeing', icon: Heart },
  { id: 'Health', name: 'Physical Health', icon: Coffee },
  { id: 'Social', name: 'Social Wellbeing', icon: Moon },
];

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [blogs, setBlogs] = useState<any[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
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
            Explore articles and resources written by our counselors to support your mental wellbeing
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
              
              <div className="flex flex-wrap gap-2 justify-center">
                {CATEGORIES.map((category) => {
                  const isActive = activeCategory === category.id;
                  const Icon = category.icon;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`px-4 py-2 rounded-full flex items-center text-sm transition-colors ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {filteredBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogs.map((blog) => (
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
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No resources found matching your search criteria.</p>
              </div>
            )}
            
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
