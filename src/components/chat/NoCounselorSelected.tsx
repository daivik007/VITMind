
import React, { useEffect, useState } from 'react';
import { MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Counselor } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NoCounselorSelectedProps {
  onBrowseCounselors: () => void;
  onSelectCounselor: (counselorId: string) => void;
  isGuest: boolean;
  maxGuestMessages: number;
}

const NoCounselorSelected = ({ 
  onBrowseCounselors, 
  onSelectCounselor,
  isGuest, 
  maxGuestMessages 
}: NoCounselorSelectedProps) => {
  const [loading, setLoading] = useState(true);
  const [counselors, setCounselors] = useState<Counselor[]>([]);

  useEffect(() => {
    const fetchCounselors = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('counselors')
          .select('id, full_name, specialization, profile_image_url')
          .eq('is_active', true)
          .limit(3);
          
        if (error) throw error;
        
        setCounselors(data as Counselor[]);
      } catch (error) {
        console.error('Error fetching counselors:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCounselors();
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <MessageSquare className="h-12 w-12 text-primary mb-4" />
      <h3 className="text-xl font-medium mb-4">Connect with a Counselor</h3>
      <p className="text-center text-muted-foreground mb-6">
        Select a counselor below to start a conversation or browse all available counselors.
      </p>
      
      {loading ? (
        <div className="flex justify-center w-full my-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mb-6">
            {counselors.map(counselor => (
              <div 
                key={counselor.id}
                className="flex flex-col items-center p-4 rounded-lg border bg-card cursor-pointer hover:bg-accent/10 transition-colors"
                onClick={() => onSelectCounselor(counselor.id)}
              >
                <Avatar className="h-14 w-14 mb-3">
                  <AvatarImage src={counselor.profile_image_url} alt={counselor.full_name} />
                  <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
                </Avatar>
                <h4 className="font-medium text-center">{counselor.full_name}</h4>
                <p className="text-xs text-muted-foreground text-center mt-1">{counselor.specialization}</p>
              </div>
            ))}
          </div>
        </>
      )}
      
      <Button 
        className="bg-[#00A3E0] hover:bg-[#33B5E5]"
        onClick={onBrowseCounselors}
      >
        Browse All Counselors
      </Button>
      
      {isGuest && (
        <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <p className="text-sm text-amber-200">
            <strong>Guest Mode:</strong> You can send up to {maxGuestMessages} messages before signing in.
          </p>
        </div>
      )}
    </div>
  );
};

export default NoCounselorSelected;
