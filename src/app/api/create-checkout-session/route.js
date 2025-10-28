import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export async function POST(req) {
  try {
    const { items } = await req.json();

    // In production, validate prices by ID from your DB or Stripe Price IDs.
    const line_items =
      (items || []).map((i) => ({
        price_data: {
          currency: "usd",
          product_data: { name: i.name },
          unit_amount: Math.round(Number(i.price) * 100), // cents
        },
        quantity: Math.max(1, Number(i.qty || 1)),
      })) || [];

    if (!line_items.length) {
      return new Response(JSON.stringify({ error: "No items provided" }), { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment`,
    });

    return new Response(JSON.stringify({ url: session.url }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || "Server error" }), { status: 400 });
  }
}
