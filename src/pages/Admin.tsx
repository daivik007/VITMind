
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  UserRound, 
  PenSquare, 
  Trash2, 
  Plus, 
  UserPlus,
  BookText,
  MessageSquare,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [counselors, setCounselors] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [queries, setQueries] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form states for counselor
  const [counselorForm, setCounselorForm] = useState({
    id: '',
    full_name: '',
    email: '',
    specialization: '',
    bio: '',
    availability: '',
    profile_image_url: '',
    is_active: true
  });

  // Form states for blog
  const [blogForm, setBlogForm] = useState({
    id: '',
    title: '',
    content: '',
    author_id: '',
    published: false
  });

  // Form states for response
  const [responseForm, setResponseForm] = useState({
    query_id: '',
    content: ''
  });
  
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }
        
        // Check if user is admin
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (error) throw error;
        
        if (!profile || !profile.is_admin) {
          // Not an admin, redirect to home
          toast.error('You do not have permission to access this page');
          navigate('/');
          return;
        }
        
        setIsAdmin(true);
        await fetchData();
      } catch (error: any) {
        console.error('Error checking admin status:', error.message);
        toast.error('Failed to verify admin status');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, [navigate]);
  
  const fetchData = async () => {
    try {
      // Fetch counselors
      const { data: counselorsData, error: counselorsError } = await supabase
        .from('counselors')
        .select('*')
        .order('full_name');
        
      if (counselorsError) throw counselorsError;
      setCounselors(counselorsData || []);
      
      // Fetch blogs
      const { data: blogsData, error: blogsError } = await supabase
        .from('blogs')
        .select(`
          *,
          counselors (
            full_name
          )
        `)
        .order('created_at', { ascending: false });
        
      if (blogsError) throw blogsError;
      setBlogs(blogsData || []);
      
      // Fetch queries
      const { data: queriesData, error: queriesError } = await supabase
        .from('queries')
        .select(`
          *,
          profiles (
            full_name,
            email
          ),
          counselors (
            full_name
          ),
          query_responses (
            id,
            content,
            created_at
          )
        `)
        .order('created_at', { ascending: false });
        
      if (queriesError) throw queriesError;
      setQueries(queriesData || []);
    } catch (error: any) {
      console.error('Error fetching admin data:', error.message);
      toast.error('Failed to load data');
    }
  };
  
  // Counselor CRUD operations
  const handleCounselorSubmit = async () => {
    try {
      const { id, ...counselorData } = counselorForm;
      
      if (!counselorData.full_name || !counselorData.email) {
        toast.error('Name and email are required');
        return;
      }
      
      if (id) {
        // Update existing counselor
        const { error } = await supabase
          .from('counselors')
          .update(counselorData)
          .eq('id', id);
          
        if (error) throw error;
        toast.success('Counselor updated successfully');
      } else {
        // Create new counselor
        const { error } = await supabase
          .from('counselors')
          .insert(counselorData);
          
        if (error) throw error;
        toast.success('Counselor added successfully');
      }
      
      resetCounselorForm();
      await fetchData();
    } catch (error: any) {
      console.error('Error saving counselor:', error.message);
      toast.error('Failed to save counselor');
    }
  };
  
  const handleDeleteCounselor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('counselors')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Counselor deleted successfully');
      await fetchData();
    } catch (error: any) {
      console.error('Error deleting counselor:', error.message);
      toast.error('Failed to delete counselor');
    }
  };
  
  const resetCounselorForm = () => {
    setCounselorForm({
      id: '',
      full_name: '',
      email: '',
      specialization: '',
      bio: '',
      availability: '',
      profile_image_url: '',
      is_active: true
    });
  };
  
  // Blog CRUD operations
  const handleBlogSubmit = async () => {
    try {
      const { id, ...blogData } = blogForm;
      
      if (!blogData.title || !blogData.content) {
        toast.error('Title and content are required');
        return;
      }
      
      if (id) {
        // Update existing blog
        const { error } = await supabase
          .from('blogs')
          .update({
            ...blogData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
          
        if (error) throw error;
        toast.success('Blog updated successfully');
      } else {
        // Create new blog
        const { error } = await supabase
          .from('blogs')
          .insert({
            ...blogData,
            updated_at: new Date().toISOString()
          });
          
        if (error) throw error;
        toast.success('Blog added successfully');
      }
      
      resetBlogForm();
      await fetchData();
    } catch (error: any) {
      console.error('Error saving blog:', error.message);
      toast.error('Failed to save blog');
    }
  };
  
  const handleDeleteBlog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Blog deleted successfully');
      await fetchData();
    } catch (error: any) {
      console.error('Error deleting blog:', error.message);
      toast.error('Failed to delete blog');
    }
  };
  
  const resetBlogForm = () => {
    setBlogForm({
      id: '',
      title: '',
      content: '',
      author_id: '',
      published: false
    });
  };
  
  // Query response operations
  const handleResponseSubmit = async () => {
    try {
      if (!responseForm.content.trim()) {
        toast.error('Response content is required');
        return;
      }
      
      // Add response
      const { error: responseError } = await supabase
        .from('query_responses')
        .insert({
          query_id: responseForm.query_id,
          content: responseForm.content.trim()
        });
        
      if (responseError) throw responseError;
      
      // Update query status
      const { error: statusError } = await supabase
        .from('queries')
        .update({ status: 'resolved' })
        .eq('id', responseForm.query_id);
        
      if (statusError) throw statusError;
      
      toast.success('Response submitted successfully');
      setResponseForm({ query_id: '', content: '' });
      await fetchData();
    } catch (error: any) {
      console.error('Error submitting response:', error.message);
      toast.error('Failed to submit response');
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse text-center">
            <p className="text-lg text-muted-foreground">Verifying admin access...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!isAdmin) {
    return null; // Should never reach here due to redirect in useEffect
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
        
        <Tabs defaultValue="counselors">
          <TabsList className="w-full max-w-md mx-auto mb-8">
            <TabsTrigger value="counselors" className="flex-1">
              <UserRound className="h-4 w-4 mr-2" />
              Counselors
            </TabsTrigger>
            <TabsTrigger value="blogs" className="flex-1">
              <BookText className="h-4 w-4 mr-2" />
              Blogs
            </TabsTrigger>
            <TabsTrigger value="queries" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Queries
            </TabsTrigger>
          </TabsList>
          
          {/* Counselors Tab */}
          <TabsContent value="counselors">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Manage Counselors</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={resetCounselorForm}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Counselor
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {counselorForm.id ? 'Edit Counselor' : 'Add New Counselor'}
                    </DialogTitle>
                    <DialogDescription>
                      Fill in the details for the counselor profile.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={counselorForm.full_name}
                        onChange={(e) => setCounselorForm({...counselorForm, full_name: e.target.value})}
                        placeholder="John Doe" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={counselorForm.email}
                        onChange={(e) => setCounselorForm({...counselorForm, email: e.target.value})}
                        placeholder="counselor@vit.edu" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input 
                        id="specialization" 
                        value={counselorForm.specialization}
                        onChange={(e) => setCounselorForm({...counselorForm, specialization: e.target.value})}
                        placeholder="e.g. Academic Stress, Mental Health" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea 
                        id="bio" 
                        value={counselorForm.bio}
                        onChange={(e) => setCounselorForm({...counselorForm, bio: e.target.value})}
                        placeholder="Brief professional biography..." 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability</Label>
                      <Input 
                        id="availability" 
                        value={counselorForm.availability}
                        onChange={(e) => setCounselorForm({...counselorForm, availability: e.target.value})}
                        placeholder="e.g. Mon-Fri, 9AM-5PM" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="profile_image">Profile Image URL</Label>
                      <Input 
                        id="profile_image" 
                        value={counselorForm.profile_image_url}
                        onChange={(e) => setCounselorForm({...counselorForm, profile_image_url: e.target.value})}
                        placeholder="https://example.com/image.jpg" 
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="active" 
                        checked={counselorForm.is_active}
                        onCheckedChange={(checked) => setCounselorForm({...counselorForm, is_active: checked})}
                      />
                      <Label htmlFor="active">Active Status</Label>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" onClick={handleCounselorSubmit}>
                      {counselorForm.id ? 'Update Counselor' : 'Add Counselor'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {counselors.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No counselors have been added yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                counselors.map((counselor) => (
                  <Card key={counselor.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={counselor.profile_image_url} alt={counselor.full_name} />
                          <AvatarFallback>
                            <UserRound className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex space-x-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setCounselorForm({
                                  id: counselor.id,
                                  full_name: counselor.full_name,
                                  email: counselor.email,
                                  specialization: counselor.specialization || '',
                                  bio: counselor.bio || '',
                                  availability: counselor.availability || '',
                                  profile_image_url: counselor.profile_image_url || '',
                                  is_active: counselor.is_active
                                })}
                              >
                                <PenSquare className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Edit Counselor</DialogTitle>
                                <DialogDescription>
                                  Update the counselor's information.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 py-4">
                                {/* Same form fields as Add Counselor */}
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name">Full Name</Label>
                                  <Input 
                                    id="edit-name" 
                                    value={counselorForm.full_name}
                                    onChange={(e) => setCounselorForm({...counselorForm, full_name: e.target.value})}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="edit-email">Email</Label>
                                  <Input 
                                    id="edit-email" 
                                    type="email"
                                    value={counselorForm.email}
                                    onChange={(e) => setCounselorForm({...counselorForm, email: e.target.value})}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="edit-specialization">Specialization</Label>
                                  <Input 
                                    id="edit-specialization" 
                                    value={counselorForm.specialization}
                                    onChange={(e) => setCounselorForm({...counselorForm, specialization: e.target.value})}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="edit-bio">Bio</Label>
                                  <Textarea 
                                    id="edit-bio" 
                                    value={counselorForm.bio}
                                    onChange={(e) => setCounselorForm({...counselorForm, bio: e.target.value})}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="edit-availability">Availability</Label>
                                  <Input 
                                    id="edit-availability" 
                                    value={counselorForm.availability}
                                    onChange={(e) => setCounselorForm({...counselorForm, availability: e.target.value})}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="edit-profile-image">Profile Image URL</Label>
                                  <Input 
                                    id="edit-profile-image" 
                                    value={counselorForm.profile_image_url}
                                    onChange={(e) => setCounselorForm({...counselorForm, profile_image_url: e.target.value})}
                                  />
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Switch 
                                    id="edit-active" 
                                    checked={counselorForm.is_active}
                                    onCheckedChange={(checked) => setCounselorForm({...counselorForm, is_active: checked})}
                                  />
                                  <Label htmlFor="edit-active">Active Status</Label>
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <Button type="submit" onClick={handleCounselorSubmit}>
                                  Update Counselor
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteCounselor(counselor.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-2">{counselor.full_name}</CardTitle>
                      <CardDescription>{counselor.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      {counselor.specialization && (
                        <p className="text-sm mb-2">
                          <span className="font-medium">Specialization:</span> {counselor.specialization}
                        </p>
                      )}
                      {counselor.availability && (
                        <p className="text-sm">
                          <span className="font-medium">Availability:</span> {counselor.availability}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        counselor.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {counselor.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          {/* Blogs Tab */}
          <TabsContent value="blogs">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Manage Blogs</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={resetBlogForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Blog
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>
                      {blogForm.id ? 'Edit Blog Post' : 'Create New Blog Post'}
                    </DialogTitle>
                    <DialogDescription>
                      Create informative and helpful content for students.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input 
                        id="title" 
                        value={blogForm.title}
                        onChange={(e) => setBlogForm({...blogForm, title: e.target.value})}
                        placeholder="Managing Exam Stress" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea 
                        id="content" 
                        value={blogForm.content}
                        onChange={(e) => setBlogForm({...blogForm, content: e.target.value})}
                        placeholder="Write your blog content here..." 
                        className="min-h-[200px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="author">Author</Label>
                      <select
                        id="author"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={blogForm.author_id}
                        onChange={(e) => setBlogForm({...blogForm, author_id: e.target.value})}
                      >
                        <option value="">Select an author</option>
                        {counselors.map((counselor) => (
                          <option key={counselor.id} value={counselor.id}>
                            {counselor.full_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="published" 
                        checked={blogForm.published}
                        onCheckedChange={(checked) => setBlogForm({...blogForm, published: checked})}
                      />
                      <Label htmlFor="published">Published</Label>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" onClick={handleBlogSubmit}>
                      {blogForm.id ? 'Update Blog' : 'Publish Blog'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-6">
              {blogs.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No blog posts have been created yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                blogs.map((blog) => (
                  <Card key={blog.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{blog.title}</CardTitle>
                          <CardDescription>
                            By {blog.counselors?.full_name || 'Unknown Author'} • 
                            {new Date(blog.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setBlogForm({
                                  id: blog.id,
                                  title: blog.title,
                                  content: blog.content,
                                  author_id: blog.author_id || '',
                                  published: blog.published
                                })}
                              >
                                <PenSquare className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xl">
                              <DialogHeader>
                                <DialogTitle>Edit Blog Post</DialogTitle>
                                <DialogDescription>
                                  Update the blog post content.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 py-4">
                                {/* Same form fields as Add Blog */}
                                <div className="space-y-2">
                                  <Label htmlFor="edit-title">Title</Label>
                                  <Input 
                                    id="edit-title" 
                                    value={blogForm.title}
                                    onChange={(e) => setBlogForm({...blogForm, title: e.target.value})}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="edit-content">Content</Label>
                                  <Textarea 
                                    id="edit-content" 
                                    value={blogForm.content}
                                    onChange={(e) => setBlogForm({...blogForm, content: e.target.value})}
                                    className="min-h-[200px]"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="edit-author">Author</Label>
                                  <select
                                    id="edit-author"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={blogForm.author_id}
                                    onChange={(e) => setBlogForm({...blogForm, author_id: e.target.value})}
                                  >
                                    <option value="">Select an author</option>
                                    {counselors.map((counselor) => (
                                      <option key={counselor.id} value={counselor.id}>
                                        {counselor.full_name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Switch 
                                    id="edit-published" 
                                    checked={blogForm.published}
                                    onCheckedChange={(checked) => setBlogForm({...blogForm, published: checked})}
                                  />
                                  <Label htmlFor="edit-published">Published</Label>
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <Button type="submit" onClick={handleBlogSubmit}>
                                  Update Blog
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteBlog(blog.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {blog.content}
                      </p>
                    </CardContent>
                    <CardFooter className="justify-between">
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        blog.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {blog.published ? 'Published' : 'Draft'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Updated: {new Date(blog.updated_at).toLocaleDateString()}
                      </p>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          {/* Queries Tab */}
          <TabsContent value="queries">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Student Queries</h2>
            </div>
            
            <div className="space-y-6">
              {queries.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No student queries have been submitted yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                queries.map((query) => (
                  <Card key={query.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center">
                            {query.subject}
                            <span className={`ml-3 px-2 py-1 rounded-full text-xs ${
                              query.status === 'resolved' 
                                ? 'bg-green-100 text-green-800' 
                                : query.status === 'in_progress' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-amber-100 text-amber-800'
                            }`}>
                              {query.status.replace('_', ' ')}
                            </span>
                          </CardTitle>
                          <CardDescription>
                            From: {query.is_anonymous 
                              ? 'Anonymous Student' 
                              : query.profiles?.full_name || 'Unknown Student'
                            } • 
                            To: {query.counselors?.full_name || 'Unassigned'} • 
                            {new Date(query.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border-l-4 border-primary/20 pl-3 py-1">
                        <p className="text-sm">{query.content}</p>
                      </div>
                      
                      {query.query_responses && query.query_responses.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Responses:</h4>
                          {query.query_responses.map((response: any) => (
                            <div key={response.id} className="bg-muted p-3 rounded-lg">
                              <p className="text-sm">{response.content}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(response.created_at).toLocaleDateString()} at{' '}
                                {new Date(response.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-amber-50 text-amber-800 p-3 rounded-lg flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <p className="text-sm">This query has not been responded to yet.</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      {query.status !== 'resolved' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button onClick={() => setResponseForm({
                              query_id: query.id,
                              content: ''
                            })}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Respond
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Respond to Query</DialogTitle>
                              <DialogDescription>
                                Provide a response to the student's query.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="response">Response</Label>
                                <Textarea 
                                  id="response" 
                                  value={responseForm.content}
                                  onChange={(e) => setResponseForm({...responseForm, content: e.target.value})}
                                  placeholder="Write your response..." 
                                  className="min-h-[120px]"
                                />
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button type="submit" onClick={handleResponseSubmit}>
                                Submit Response
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
