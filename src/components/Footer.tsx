
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto py-8 border-t border-border/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xl font-bold">
              <span className="text-primary">VIT</span>
              <span>Mind</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              A safe, anonymous space for VIT students to connect with counselors and access mental health resources.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">Quick Links</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/chat" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Chat with Counselor
              </Link>
              <Link to="/resources" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Mental Health Resources
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">Contact & Support</h4>
            <div className="flex flex-col space-y-2">
              <a href="mailto:support@vitmind.edu" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                support@vitmind.edu
              </a>
              <p className="text-sm text-muted-foreground flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Your privacy is our priority
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-border/30 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} VITMind. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center mt-2 md:mt-0">
            Created with <Heart className="h-3 w-3 mx-1 text-red-500" fill="currentColor" /> for VIT students
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
