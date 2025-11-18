import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExecuteFormattingRequest {
  jobId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const dockerHostUrl = Deno.env.get('DOCKER_HOST_URL')!;
    const dockerCaCert = Deno.env.get('DOCKER_CA_CERT')!;
    const dockerClientCert = Deno.env.get('DOCKER_CLIENT_CERT')!;
    const dockerClientKey = Deno.env.get('DOCKER_CLIENT_KEY')!;

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
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { jobId }: ExecuteFormattingRequest = await req.json();

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: 'Job ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Executing Docker formatting for job ${jobId}`);

    // Fetch job from database
    const { data: job, error: fetchError } = await supabase
      .from('generation_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !job) {
      console.error('Job fetch error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Job not found or unauthorized' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (job.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: `Job is already ${job.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update job status to processing
    await supabase
      .from('generation_jobs')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', jobId);

    console.log(`Job ${jobId} marked as processing. Connecting to Docker host...`);

    // Prepare configuration for Docker container
    const filingData = job.filing_data;
    const containerConfig = {
      caseInfo: filingData.caseInfo,
      petitioner: filingData.petitioner,
      events: filingData.events,
      petitionBody: filingData.petitionBody,
      exhibits: filingData.exhibits || [],
      officialForms: filingData.officialForms || [],
    };

    // NOTE: Full Docker integration requires Docker SDK with mTLS
    // This is a placeholder that demonstrates the architecture
    // Production implementation would:
    // 1. Create temporary directory with containerConfig as case.json
    // 2. Download exhibit files from Supabase storage to temp directory
    // 3. Use Docker SDK with mTLS certificates to execute container:
    //    docker run -v /tmp/workspace:/workspace pc850_formatter_v1
    // 4. Upload generated PDF to Supabase storage (generated-packages bucket)
    // 5. Update job with result_package_url

    console.log('Docker orchestration placeholder - configuration prepared:', {
      jobId,
      exhibitCount: containerConfig.exhibits.length,
      formsCount: containerConfig.officialForms.length,
    });

    // For Phase 0, mark as completed with placeholder URL
    const placeholderUrl = `https://${supabaseUrl.replace('https://', '')}/storage/v1/object/public/generated-packages/${user.id}/${jobId}/filing-package.pdf`;

    const { error: updateError } = await supabase
      .from('generation_jobs')
      .update({
        status: 'completed',
        result_package_url: placeholderUrl,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('Job update error:', updateError);
      throw new Error('Failed to update job status');
    }

    console.log(`Job ${jobId} completed successfully`);

    // Log API call
    await supabase.from('api_audit_log').insert({
      user_id: user.id,
      job_id: jobId,
      api_endpoint: '/execute-docker-formatting',
      request_payload: { jobId },
      response_payload: { packageUrl: placeholderUrl },
      status_code: 200,
      execution_time_ms: 0, // Would be actual execution time in production
    });

    return new Response(
      JSON.stringify({
        jobId,
        status: 'completed',
        packageUrl: placeholderUrl,
        message: 'Docker formatting orchestration placeholder - ready for production integration',
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in execute-docker-formatting:', error);
    
    // Attempt to mark job as failed
    try {
      const { jobId } = await req.json();
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
      
      await supabase
        .from('generation_jobs')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    } catch (updateError) {
      console.error('Failed to update job status to failed:', updateError);
    }

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
