import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(request: NextRequest) {
  const response = NextResponse.next(); // nécessaire pour middleware client

  // Attendre les cookies (Next.js 13+)
  const supabase = createMiddlewareClient({ req: request, res: response });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  console.log("USER reçu :", user);
  console.log("ERREUR reçue :", error);

  if (error || !user || !user.email) {
    return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Recherche client Stripe par email
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      console.log("Aucun client Stripe trouvé pour cet email.");
      return new Response(
          JSON.stringify({ found: false }),
          { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const customer = customers.data[0];
    console.log("Customer Stripe trouvé :", customer.id);

    // Mettre à jour Supabase avec stripe_customer_id si absent
    const { error: updateError } = await supabase
        .from("users")
        .update({ stripe_customer_id: customer.id })
        .eq("id", user.id);

    if (updateError) {
      console.error("Erreur mise à jour Supabase :", updateError);
      return new Response(
          JSON.stringify({ error: "Erreur mise à jour Supabase" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Créer session portail Stripe
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account`,
    });

    return new Response(
        JSON.stringify({ url: session.url }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Erreur Stripe :", err);
    return new Response(
        JSON.stringify({ error: "Stripe error", message: String(err) }),
        { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}