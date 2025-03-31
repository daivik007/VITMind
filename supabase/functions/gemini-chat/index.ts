import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const messages = requestData.messages || [];

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Always include counselor instructions in the first message
    const counselorInstructions =
      'For this act as a psychotherapist, counsellor who can give advice for students, on their personal and academic goals. When asked anything other than this, directly refuse to answer. Give answers only to questions which can be asked to a counselor, doctor by students - about mental, personal, health, stress, exam, or academic goals.';

    // Prepare content for Gemini API
    const contents = messages.map((msg: any, index: number) => {
      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [
          {
            text:
              index === 0 && msg.role === 'user'
                ? `${counselorInstructions}\n\n${msg.content}`
                : msg.content,
          },
        ],
      };
    });

    console.log('Sending to Gemini API:', { contents });

    // Send request to Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return new Response(
        JSON.stringify({
          error: 'Failed to get response from Gemini API',
          details: errorText,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        }
      );
    }

    const geminiResponse = await response.json();
    console.log('Gemini API response:', geminiResponse);

    // Extract the text from the response
    const responseText =
      geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text ||
      geminiResponse.candidates?.[0]?.text ||
      "I'm sorry, I couldn't process your request at this time.";

    return new Response(JSON.stringify({ response: responseText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in Gemini Chat function:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
