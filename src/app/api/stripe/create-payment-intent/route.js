// app/api/stripe/create-payment-intent/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { amount, donationType, email, name } = await request.json();

    // Validate amount
    if (!amount || amount < 100) {
      // Minimum $1
      return NextResponse.json(
        { error: "Invalid donation amount" },
        { status: 400 }
      );
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${
                donationType === "monthly" ? "Monthly" : "One-time"
              } Donation`,
              description: "Support rescued pets in need",
            },
            unit_amount: amount,
            ...(donationType === "monthly" && {
              recurring: {
                interval: "month",
              },
            }),
          },
          quantity: 1,
        },
      ],
      mode: donationType === "monthly" ? "subscription" : "payment",
      success_url: `${
        process.env.NEXTAUTH_URL
      }/donations/success?session_id={CHECKOUT_SESSION_ID}&amount=${
        amount / 100
      }&type=${donationType}&email=${email}&name=${name}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/support`,
      metadata: {
        donationType: donationType,
        email: email,
        name: name,
      },
    });
    // console.log(session);
    // ✅ return the session URL instead of id
    return NextResponse.json({ url: session.url });
    // return NextResponse.json({ clientSecret: session.id })
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment session" },
      { status: 500 }
    );
  }
}
