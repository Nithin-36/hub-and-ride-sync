import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SignUpRequest {
  email: string
  password: string
  fullName: string
  role: 'passenger' | 'driver'
  phone?: string
  vehicleModel?: string
  vehicleNumber?: string
  licenseNumber?: string
}

interface SignInRequest {
  email: string
  password: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, ...data } = await req.json()

    if (action === 'signup') {
      const { email, password, fullName, role, phone, vehicleModel, vehicleNumber, licenseNumber } = data as SignUpRequest

      // Hash password using crypto API
      const encoder = new TextEncoder()
      const passwordData = encoder.encode(password)
      const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('app_users')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'User already exists' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create user
      const { data: user, error: userError } = await supabase
        .from('app_users')
        .insert({
          email,
          password_hash: passwordHash,
          full_name: fullName,
          role,
          phone
        })
        .select()
        .single()

      if (userError) {
        console.error('User creation error:', userError)
        return new Response(
          JSON.stringify({ error: 'Failed to create user' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create role-specific profile
      if (role === 'passenger') {
        const { error: passengerError } = await supabase
          .from('passengers')
          .insert({ user_id: user.id })

        if (passengerError) {
          console.error('Passenger profile creation error:', passengerError)
        }
      } else if (role === 'driver') {
        const { error: driverError } = await supabase
          .from('drivers')
          .insert({
            user_id: user.id,
            vehicle_model: vehicleModel || 'Unknown Vehicle',
            vehicle_number: vehicleNumber || 'Unknown Number',
            license_number: licenseNumber || 'DL-' + Math.random().toString(36).substr(2, 9).toUpperCase()
          })

        if (driverError) {
          console.error('Driver profile creation error:', driverError)
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: { 
            id: user.id, 
            email: user.email, 
            full_name: user.full_name, 
            role: user.role 
          } 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'signin') {
      const { email, password } = data as SignInRequest

      // Hash password for comparison
      const encoder = new TextEncoder()
      const passwordData = encoder.encode(password)
      const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      // Find user with matching credentials
      const { data: user, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', passwordHash)
        .single()

      if (error || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get role-specific profile
      let profile = null
      if (user.role === 'passenger') {
        const { data: passengerProfile } = await supabase
          .from('passengers')
          .select('*')
          .eq('user_id', user.id)
          .single()
        profile = passengerProfile
      } else if (user.role === 'driver') {
        const { data: driverProfile } = await supabase
          .from('drivers')
          .select('*')
          .eq('user_id', user.id)
          .single()
        profile = driverProfile
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: { 
            id: user.id, 
            email: user.email, 
            full_name: user.full_name, 
            role: user.role,
            phone: user.phone
          },
          profile 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Auth function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})