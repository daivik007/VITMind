
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StarIcon, UserRound, Mail, Calendar, MessageSquare, Info, Phone, MapPin, Award } from 'lucide-react';

interface CounselorCardProps {
  counselor: any;
  onContactClick: (counselor: any) => void;
}

const CounselorCard: React.FC<CounselorCardProps> = ({ counselor, onContactClick }) => {
  const navigate = useNavigate();
  
  // Generate a random rating between 3.5 and 5.0
  const rating = counselor.rating || (Math.floor(Math.random() * 30) + 35) / 10;
  
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="h-4 w-4 text-yellow-400" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-yellow-400" />);
      }
    }
    
    return stars;
  };

  const handleChatWithCounselor = () => {
    navigate(`/chat/counselor/${counselor.id}`, { 
      state: { counselor: counselor }
    });
  };
  
  return (
    <Card className="overflow-hidden bg-[#2A3536] border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{counselor.full_name}</CardTitle>
            <p className="text-sm text-muted-foreground">{counselor.specialization} Specialist</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UserRound className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm mb-4 line-clamp-3">{counselor.bio || `Specializes in helping students with ${counselor.specialization.toLowerCase()} challenges.`}</p>
        <div className="flex items-center mb-2">
          {renderStars(rating)}
          <span className="ml-2 text-sm text-muted-foreground">{rating.toFixed(1)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Info className="h-4 w-4 mr-2" />
              Info
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1A2526] border-0">
            <DialogHeader>
              <DialogTitle>{counselor.full_name}</DialogTitle>
              <DialogDescription>
                {counselor.specialization} Specialist
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Post</h4>
                <p className="text-sm text-muted-foreground">
                  Senior Counselor, VIT Welfare Office
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Contact Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{counselor.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{counselor.availability || "Mon-Fri, 9am-5pm"}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Cabin Number</h4>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Room {Math.floor(Math.random() * 500) + 100}, {["Main", "Admin", "Welfare", "Student"][Math.floor(Math.random() * 4)]} Block
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Rating</h4>
                <div className="flex items-center">
                  {renderStars(rating)}
                  <span className="ml-2 text-sm text-muted-foreground">{rating.toFixed(1)}/5</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Specialization</h4>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Specializes in {counselor.specialization.toLowerCase()} related issues and student wellness.
                  </p>
                </div>
              </div>
              <div className="text-sm text-amber-400 italic mt-2">
                <p>Note: Calls and chats are anonymous if your Anonymous Switch is On.</p>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                className="w-full bg-[#00A3E0] hover:bg-[#33B5E5]"
                onClick={handleChatWithCounselor}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat with Counselor
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Counselor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button 
          className="bg-[#00A3E0] hover:bg-[#33B5E5]"
          onClick={handleChatWithCounselor}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Chat
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CounselorCard;
