import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('Starting teeth transformation with Gemini...');

    const prompt = "Transform this person's teeth to be perfectly beautiful, naturally white, and symmetrical. Make the teeth look healthy and professionally whitened while keeping the smile natural and the rest of the face unchanged.";

    // Extract MIME type and base64 data
    const mimeMatch = imageData.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
    const mimeType = mimeMatch?.[1] || 'image/jpeg';
    const imageBase64 = imageData.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiApiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBase64
                  }
                }
              ]
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      
      // Handle rate limiting specially
      if (response.status === 429) {
        let retryDelay = '60s';
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.details) {
            const retryInfo = errorData.error.details.find(
              (d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
            );
            if (retryInfo?.retryDelay) {
              retryDelay = retryInfo.retryDelay;
            }
          }
        } catch (e) {
          console.error('Could not parse retry info:', e);
        }
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Rate limited by Gemini API',
            retryDelay,
            details: errorText
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Gemini response received, model:', result.modelVersion);

    if (result.candidates && result.candidates[0]?.content?.parts) {
      const parts = result.candidates[0].content.parts;
      
      for (const part of parts) {
        if (part.inline_data && part.inline_data.data) {
          console.log('Generated image found with MIME type:', part.inline_data.mime_type);
          return new Response(
            JSON.stringify({
              success: true,
              imageData: `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      }
    }

    console.error('No image data in Gemini response:', JSON.stringify(result));
    throw new Error('No transformed image returned from Gemini');

  } catch (error) {
    console.error('Error in transform-teeth function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
