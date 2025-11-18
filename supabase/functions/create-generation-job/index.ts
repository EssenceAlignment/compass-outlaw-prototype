import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateJobRequest {
  filingData: {
    caseInfo: {
      courtName: string;
      county: string;
      caseNumber: string;
      judgeName: string;
    };
    petitioner: {
      name: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      phone: string;
      email: string;
    };
    events: Array<{
      id: string;
      date: string;
      description: string;
    }>;
    petitionBody: string;
    exhibits: Array<{
      id: string;
      label: string;
      description: string;
      fileUrl: string;
      fileName: string;
    }>;
    officialForms: Array<{
      id: string;
      formNumber: string;
      formName: string;
      fileUrl: string;
    }>;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { filingData }: CreateJobRequest = await req.json();

    // Validate required fields
    if (!filingData || !filingData.caseInfo || !filingData.petitioner || !filingData.petitionBody) {
      return new Response(
        JSON.stringify({ error: 'Missing required filing data fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating generation job for user ${user.id}`);

    // Insert job into database
    const { data: job, error: insertError } = await supabase
      .from('generation_jobs')
      .insert({
        user_id: user.id,
        status: 'pending',
        filing_data: filingData,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error(`Failed to create job: ${insertError.message}`);
    }

    console.log(`Job created successfully: ${job.id}`);

    // Log API call
    const startTime = Date.now();
    await supabase.from('api_audit_log').insert({
      user_id: user.id,
      job_id: job.id,
      api_endpoint: '/create-generation-job',
      request_payload: { filingData },
      response_payload: { jobId: job.id },
      status_code: 201,
      execution_time_ms: Date.now() - startTime,
    });

    return new Response(
      JSON.stringify({ 
        jobId: job.id,
        status: job.status,
        createdAt: job.created_at 
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in create-generation-job:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
