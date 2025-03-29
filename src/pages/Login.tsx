import React from 'react';
import Layout from '@/components/Layout';
import LoginForm from '@/components/auth/LoginForm';
import { Shield } from 'lucide-react';

const Login = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 flex flex-col items-center">
        <div className="max-w-md w-full text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Secure Sign-in</h1>
          <p className="text-muted-foreground">
            We only verify if you're a VIT student. All conversations remain
            completely anonymous.
          </p>
        </div>

        <LoginForm />

        <div className="mt-8 p-4 bg-secondary/40 rounded-xl max-w-lg text-center">
          <h3 className="font-medium mb-2">Privacy Guarantee</h3>
          <p className="text-sm text-muted-foreground">
            We never store or share personal information. Your VIT email is used
            only for verification and your conversations are not linked to your
            identity.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
