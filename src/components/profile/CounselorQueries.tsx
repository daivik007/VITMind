
import React from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CounselorQueriesProps {
  queries: any[];
}

const CounselorQueries: React.FC<CounselorQueriesProps> = ({ queries }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Your Counselor Queries</h2>
      
      {queries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Send className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              You haven't submitted any queries to counselors yet.
            </p>
            <Button 
              className="mt-4" 
              onClick={() => navigate('/counselors')}
            >
              Find a Counselor
            </Button>
          </CardContent>
        </Card>
      ) : (
        queries.map((query) => (
          <Card key={query.id} className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{query.subject}</CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  query.status === 'resolved' 
                    ? 'bg-green-100 text-green-800' 
                    : query.status === 'in_progress' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-amber-100 text-amber-800'
                }`}>
                  {query.status.replace('_', ' ')}
                </span>
              </div>
              <CardDescription>
                To: {query.counselors?.full_name || 'Counselor'} • 
                {format(new Date(query.created_at), 'PP')} • 
                {query.is_anonymous ? 'Anonymous' : 'Identified'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-l-4 border-primary/20 pl-3 py-1 mb-4">
                <p className="text-sm">{query.content}</p>
              </div>
              
              {query.query_responses && query.query_responses.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Responses:</h4>
                  {query.query_responses.map((response: any) => (
                    <div key={response.id} className="bg-muted p-3 rounded-lg">
                      <p className="text-sm">{response.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(response.created_at), 'PP p')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-amber-50 text-amber-800 p-3 rounded-lg flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <p className="text-sm">Awaiting response from counselor</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default CounselorQueries;
