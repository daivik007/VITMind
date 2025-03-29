
export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'counselor';
  timestamp: Date;
};

export type Counselor = {
  id: string;
  full_name: string;
  specialization: string;
  bio?: string;
  profile_image_url?: string;
  years_experience?: number;
  rating?: number;
  education?: string;
  languages?: string[];
};

export type ChatPreview = {
  id: string;
  counselorId: string;
  counselorName: string;
  lastMessage: string;
  lastMessageTime: Date;
  isUnread?: boolean;
  counselorImage?: string;
};

export type UserRole = 'user' | 'admin' | 'counselor';

export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
};
