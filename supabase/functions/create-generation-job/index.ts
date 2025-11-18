import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'zod';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const filingDataSchema = z.object({
  caseInfo: z.object({
    courtName: z.string().min(1).max(200),
    county: z.string().min(1).max(100),
    caseNumber: z.string().min(1).max(50),
    judgeName: z.string().min(1).max(200),
  }),
  petitioner: z.object({
    name: z.string().min(1).max(200),
    address: z.string().min(1).max(300),
    city: z.string().min(1).max(100),
    state: z.string().min(2).max(2),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/),
    phone: z.string().regex(/^\d{10}$/),
    email: z.string().email().max(255),
  }),
  events: z.array(z.object({
    id: z.string(),
    date: z.string().datetime(),
    description: z.string().min(1).max(1000),
  })).max(100),
  petitionBody: z.string().min(1).max(50000),
  exhibits: z.array(z.object({
    id: z.string(),
    label: z.string().max(50),
    description: z.string().max(500),
    fileUrl: z.string().url(),
    fileName: z.string().max(255),
  })).max(50),
  officialForms: z.array(z.object({
    id: z.string(),
    formNumber: z.string().max(50),
    formName: z.string().max(200),
    fileUrl: z.string().url(),
  })).max(20),
});

const createJobRequestSchema = z.object({
  filingData: filingDataSchema,
});

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

    const requestBody = await req.json();

    // Validate request schema
    const validationResult = createJobRequestSchema.safeParse(requestBody);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.issues);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid filing data',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { filingData } = validationResult.data;

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
