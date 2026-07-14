import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prenom, nom, email, adminEmails } = await req.json()

    if (!adminEmails || adminEmails.length === 0) {
      return new Response(JSON.stringify({ message: "No admin emails found." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      })
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY is not configured on Supabase." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      })
    }

    // Send email using Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Club-MET <onboarding@resend.dev>",
        to: adminEmails,
        subject: "🔔 Demande d'approbation d'administrateur - Club-MET",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #003058;">Nouvelle demande d'approbation</h2>
            <p>Bonjour,</p>
            <p>Un nouvel utilisateur s'est inscrit en tant qu'<strong>administrateur</strong> sur la plateforme Club-MET et attend votre approbation :</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">Nom complet</td>
                <td style="padding: 8px; border: 1px solid #ddd;">\${prenom} \${nom}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">Adresse Email</td>
                <td style="padding: 8px; border: 1px solid #ddd;">\${email}</td>
              </tr>
            </table>
            <p>Pour approuver ou refuser cette demande, veuillez vous connecter à l'espace d'administration et accéder à la section <strong>« Utilisateurs Inscrits »</strong>.</p>
            <div style="margin-top: 30px; text-align: center;">
              <a href="https://cmet.ucak.sn/login" style="background-color: #187840; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Accéder à l'Administration</a>
            </div>
            <p style="color: #888; font-size: 11px; margin-top: 40px; text-align: center; border-top: 1px solid #eee; padding-top: 10px;">Club-MET · UFR Métiers & Technologies</p>
          </div>
        `,
      }),
    })

    const resData = await response.json()
    return new Response(JSON.stringify(resData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: response.status,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
