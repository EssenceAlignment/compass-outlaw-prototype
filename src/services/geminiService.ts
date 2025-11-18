import { supabase } from "@/integrations/supabase/client";

export interface FormattingSuggestion {
  section: string;
  issue: string;
  suggestion: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface AnalysisResponse {
  suggestions: FormattingSuggestion[];
}

export const analyzePetitionText = async (petitionText: string): Promise<AnalysisResponse> => {
  const { data, error } = await supabase.functions.invoke<AnalysisResponse>(
    'analyze-crc-compliance',
    {
      body: { petitionText }
    }
  );

  if (error) {
    console.error('Error analyzing petition text:', error);
    throw new Error(error.message || 'Failed to analyze petition text');
  }

  if (!data) {
    throw new Error('No data returned from analysis');
  }

  return data;
};
