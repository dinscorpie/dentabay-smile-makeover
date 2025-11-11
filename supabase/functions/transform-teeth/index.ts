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
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    console.log('Starting teeth transformation with OpenAI...');

    // Convert base64 to blob
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const imageBlob = new Blob([imageBytes], { type: 'image/png' });

    // Create form data for OpenAI
    const formData = new FormData();
    formData.append('image', imageBlob, 'image.png');
    formData.append('prompt', 'Transform this person\'s teeth to be perfectly white, symmetrical, and naturally beautiful. Keep everything else exactly the same.');
    formData.append('model', 'dall-e-2');
    formData.append('n', '1');
    formData.append('size', '1024x1024');
    formData.append('response_format', 'b64_json');

    const response = await fetch(
      'https://api.openai.com/v1/images/edits',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('OpenAI response received');

    if (result.data && result.data[0]?.b64_json) {
      const transformedImage = `data:image/png;base64,${result.data[0].b64_json}`;
      return new Response(
        JSON.stringify({
          success: true,
          imageData: transformedImage
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    throw new Error('No transformed image returned from OpenAI');

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
