import { z } from 'zod';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const analysisRequestSchema = z.object({
  petitionText: z.string().min(1).max(100000),
});

interface FormattingSuggestion {
  section: string;
  issue: string;
  suggestion: string;
  severity: 'critical' | 'warning' | 'info';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const requestBody = await req.json();

    // Validate request schema
    const validationResult = analysisRequestSchema.safeParse(requestBody);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.issues);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { petitionText } = validationResult.data;

    console.log('Analyzing petition text for CRC 2.111 compliance...');

    const systemPrompt = `You are a legal document formatting expert specializing in California Rules of Court (CRC) 2.111.
Your task is to analyze petition text and identify ONLY formatting issues, not substantive legal content.

Focus on CRC 2.111 requirements:
- Line numbering (28 lines per page)
- Margins (1 inch top, 1.5 inch left, 0.5 inch right, 1 inch bottom)
- Font (Arial, Times New Roman, or Courier in 12-point)
- Line spacing (double-spaced with exceptions for headings and quotes)
- Page numbering
- Caption formatting
- Paragraph numbering
- Exhibit references

Return a JSON array of formatting suggestions with this structure:
{
  "suggestions": [
    {
      "section": "string (e.g., 'Line Numbering', 'Margins', 'Font')",
      "issue": "string (specific formatting problem found)",
      "suggestion": "string (how to fix it)",
      "severity": "critical" | "warning" | "info"
    }
  ]
}

If the document is properly formatted, return an empty suggestions array.`;

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${systemPrompt}\n\nAnalyze this petition text:\n\n${petitionText}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      throw new Error('No response from Gemini API');
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(resultText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', resultText);
      throw new Error('Invalid response format from AI');
    }

    const suggestions: FormattingSuggestion[] = parsedResult.suggestions || [];

    console.log(`Analysis complete. Found ${suggestions.length} formatting issues.`);

    return new Response(
      JSON.stringify({ suggestions }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in analyze-crc-compliance:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        suggestions: [] 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
