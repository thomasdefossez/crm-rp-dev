// app/api/stripe/create-checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2022-11-15",
});

export async function POST(req: NextRequest) {
    try {
        const { priceId, userId } = await req.json();

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?checkout=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?checkout=cancel`,
            metadata: { userId },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Erreur création session Stripe:", error);
        return NextResponse.json({ error: "Erreur Stripe" }, { status: 500 });
    }
}