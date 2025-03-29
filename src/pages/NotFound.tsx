
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';
import BlurCard from '@/components/ui/BlurCard';

const NotFound = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-center py-12">
        <BlurCard className="max-w-md w-full text-center">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-6">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
          <Link 
            to="/" 
            className="btn-primary inline-flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </BlurCard>
      </div>
    </Layout>
  );
};

export default NotFound;
