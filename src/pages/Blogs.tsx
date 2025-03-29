
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookText, Calendar, UserRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

const Blogs = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select(`
            *,
            counselors (
              full_name,
              profile_image_url
            )
          `)
          .eq('published', true)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setBlogs(data || []);
      } catch (error: any) {
        console.error('Error fetching blogs:', error.message);
        toast.error('Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse text-center">
            <p className="text-lg text-muted-foreground">Loading blog posts...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Mental Health Resources</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore articles and resources written by our counselors to support your mental well-being, 
            help manage stress, and provide guidance on common student challenges.
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
                    {format(new Date(selectedBlog.created_at), 'PPP')}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <BookText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Blog Posts Available</h3>
                <p className="text-muted-foreground">
                  There are currently no published blog posts. Check back later for new resources.
                </p>
              </div>
            ) : (
              blogs.map((blog) => (
                <Card 
                  key={blog.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedBlog(blog)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                    <CardDescription className="flex items-center mt-2">
                      <UserRound className="h-3 w-3 mr-1" />
                      {blog.counselors?.full_name || 'VIT Counselor'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {blog.content}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(blog.created_at), 'PPP')}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Blogs;
