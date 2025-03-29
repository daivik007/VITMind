
import React from 'react';
import { User, ArrowLeft } from 'lucide-react';
import { Counselor } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatHeaderProps {
  selectedCounselor: Counselor | null;
  isAnonymous: boolean;
  toggleAnonymity: () => void;
  handleBackToChats: () => void;
}

const ChatHeader = ({ 
  selectedCounselor, 
  isAnonymous, 
  toggleAnonymity, 
  handleBackToChats 
}: ChatHeaderProps) => {
  return (
    <div className="flex justify-between items-center pb-4 border-b border-border/60">
      {selectedCounselor ? (
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={handleBackToChats}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={selectedCounselor.profile_image_url} alt={selectedCounselor.full_name} />
              <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-lg">{selectedCounselor.full_name}</h2>
              <p className="text-xs text-muted-foreground">{selectedCounselor.specialization} Specialist</p>
            </div>
          </div>
        </div>
      ) : (
        <h2 className="font-semibold text-lg">Counselor Chat</h2>
      )}
      
      {selectedCounselor && (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="anonymous-mode" 
              checked={isAnonymous}
              onCheckedChange={toggleAnonymity}
            />
            <Label htmlFor="anonymous-mode">Anonymous</Label>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
