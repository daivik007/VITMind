
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarIcon, UserRound, Mail, Calendar, MessageSquare, MapPin, Award, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface FeaturedCounselorProps {
  counselor: any;
  onContactClick: (counselor: any) => void;
}

const FeaturedCounselor: React.FC<FeaturedCounselorProps> = ({ counselor, onContactClick }) => {
  const navigate = useNavigate();
  
  if (!counselor) return null;
  
  // Generate a random rating between 4.0 and 5.0 for featured counselors
  const rating = counselor.rating || (Math.floor(Math.random() * 20) + 40) / 10;
  
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="h-5 w-5 text-yellow-400" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <StarIcon className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<StarIcon key={i} className="h-5 w-5 text-yellow-400" />);
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
    <Card className="bg-[#1A2526] shadow-lg border-0 hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-xl">Featured Counselor</CardTitle>
        <CardDescription>Meet one of our top counselors</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
            <UserRound className="h-12 w-12 text-primary" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-1">{counselor.full_name}</h3>
            <p className="text-primary mb-2">{counselor.specialization} Specialist</p>
            <div className="flex items-center mb-4 justify-center md:justify-start">
              {renderStars(rating)}
              <span className="ml-2 text-muted-foreground">{rating.toFixed(1)}/5</span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-lg">
              {counselor.bio || `Specializes in helping students deal with ${counselor.specialization.toLowerCase()} related issues and stress management.`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-2">
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
        </div>
      </CardContent>
      <CardFooter className="flex justify-center md:justify-end gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              View Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1A2526] border-0 max-w-md">
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
          Chat with Counselor
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeaturedCounselor;
