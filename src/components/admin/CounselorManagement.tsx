
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Counselor } from '@/types/chat';
import { toast } from '@/hooks/use-toast';
import { Edit, Trash, Plus, Star } from 'lucide-react';

const CounselorManagement = () => {
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCounselor, setEditingCounselor] = useState<Counselor | null>(null);
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [education, setEducation] = useState('');

  useEffect(() => {
    fetchCounselors();
  }, []);

  const fetchCounselors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('counselors')
        .select('*')
        .order('full_name', { ascending: true });
        
      if (error) throw error;
      
      setCounselors(data as Counselor[]);
    } catch (error: any) {
      console.error('Error fetching counselors:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to load counselors data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (counselor: Counselor | null = null) => {
    if (counselor) {
      setEditingCounselor(counselor);
      setFullName(counselor.full_name);
      setEmail(''); // Email might not be available in the counselor object
      setSpecialization(counselor.specialization || '');
      setBio(counselor.bio || '');
      setYearsExperience(counselor.years_experience?.toString() || '');
      setEducation(counselor.education || '');
    } else {
      setEditingCounselor(null);
      setFullName('');
      setEmail('');
      setSpecialization('');
      setBio('');
      setYearsExperience('');
      setEducation('');
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !specialization) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    try {
      let result;
      
      if (editingCounselor) {
        // Update existing counselor
        const { data, error } = await supabase
          .from('counselors')
          .update({
            full_name: fullName,
            specialization,
            bio,
            years_experience: yearsExperience ? parseInt(yearsExperience) : null,
            education
          })
          .eq('id', editingCounselor.id)
          .select();
          
        if (error) throw error;
        result = data;
        
        toast({
          title: 'Counselor Updated',
          description: 'The counselor has been successfully updated.'
        });
      } else {
        // Create new user with counselor role first
        // This is a simplified version and would need more robust implementation
        // including password generation and notification
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
          email,
          password: 'tempPassword123', // Would typically generate a random password
          email_confirm: true,
          user_metadata: { full_name: fullName, role: 'counselor' }
        });
        
        if (userError) throw userError;
        
        // Then create counselor record
        const { data, error } = await supabase
          .from('counselors')
          .insert({
            id: userData.user.id,
            full_name: fullName,
            email,
            specialization,
            bio,
            years_experience: yearsExperience ? parseInt(yearsExperience) : null,
            education,
            is_active: true
          })
          .select();
          
        if (error) throw error;
        result = data;
        
        // Update the user's profile to have counselor role
        await supabase
          .from('profiles')
          .update({ role: 'counselor', full_name: fullName })
          .eq('id', userData.user.id);
        
        toast({
          title: 'Counselor Created',
          description: 'The new counselor has been successfully created.'
        });
      }
      
      fetchCounselors(); // Refresh the list
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving counselor:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to save counselor data: ' + error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteCounselor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this counselor?')) return;
    
    try {
      const { error } = await supabase
        .from('counselors')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setCounselors(counselors.filter(c => c.id !== id));
      
      toast({
        title: 'Counselor Deleted',
        description: 'The counselor has been successfully deleted.'
      });
    } catch (error: any) {
      console.error('Error deleting counselor:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to delete counselor: ' + error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Counselors Management</CardTitle>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Counselor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {counselors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No counselors found.
                    </TableCell>
                  </TableRow>
                ) : (
                  counselors.map((counselor) => (
                    <TableRow key={counselor.id}>
                      <TableCell className="font-medium">{counselor.full_name}</TableCell>
                      <TableCell>{counselor.specialization}</TableCell>
                      <TableCell>{counselor.years_experience} years</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                          <span>{counselor.rating || '4.5'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => openDialog(counselor)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDeleteCounselor(counselor.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingCounselor ? 'Edit Counselor' : 'Add New Counselor'}</DialogTitle>
            <DialogDescription>
              {editingCounselor 
                ? 'Update the counselor details below.' 
                : 'Fill in the details to add a new counselor.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name*</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>
              
              {!editingCounselor && (
                <div className="grid gap-2">
                  <Label htmlFor="email">Email*</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required={!editingCounselor}
                  />
                </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="specialization">Specialization*</Label>
                <Input
                  id="specialization"
                  value={specialization}
                  onChange={e => setSpecialization(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  value={yearsExperience}
                  onChange={e => setYearsExperience(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  value={education}
                  onChange={e => setEducation(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCounselor ? 'Update Counselor' : 'Add Counselor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CounselorManagement;
