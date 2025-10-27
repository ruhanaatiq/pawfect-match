import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export async function POST(req) {
  try {
    const { items } = await req.json();

    // Compute total (⚠️ in production validate with DB/Stripe Price IDs)
    const amount = (items || []).reduce((sum, i) => {
      const qty = Math.max(1, Number(i.qty || 1));
      const unit = Math.round(Number(i.price) * 100); // cents
      return sum + unit * qty;
    }, 0);

    if (amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), { status: 400 });
    }

    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true }, // Payment Element support
    });

    return new Response(
      JSON.stringify({ clientSecret: intent.client_secret }),
      { status: 200 }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message || "Server error" }),
      { status: 400 }
    );
  }
}
