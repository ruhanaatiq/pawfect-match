// src/app/api/stripe/create-checkout-session/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

function baseUrlFromReq(req) {
  const proto = req.headers.get("x-forwarded-proto") || "http";
  const host  = req.headers.get("x-forwarded-host") || req.headers.get("host");
  return host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000");
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { amount, donationType = "one-time", email, name } = body;

    // amount should be integer cents
    const cents = Math.round(Number(amount));
    if (!Number.isFinite(cents) || cents < 100) {
      return NextResponse.json({ error: "Invalid donation amount" }, { status: 400 });
    }

    const baseUrl = baseUrlFromReq(request);

    let session;

    if (donationType === "monthly") {
      // Prefer a predefined recurring price in Stripe
      const priceId = process.env.STRIPE_MONTHLY_PRICE_ID;
      if (!priceId) {
        // Fallback: create a dynamic recurring price via price_data (allowed, but can clutter Stripe)
        session = await stripe.checkout.sessions.create({
          mode: "subscription",
          line_items: [{
            price_data: {
              currency: "usd",
              product_data: { name: "Monthly Donation" },
              unit_amount: cents,
              recurring: { interval: "month" },
            },
            quantity: 1,
          }],
          customer_email: email || undefined,
          metadata: { donationType, email: email || "", name: name || "" },
          success_url: `${baseUrl}/donations/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/support`,
        });
      } else {
        session = await stripe.checkout.sessions.create({
          mode: "subscription",
          line_items: [{ price: priceId, quantity: 1 }],
          customer_email: email || undefined,
          metadata: { donationType, email: email || "", name: name || "" },
          success_url: `${baseUrl}/donations/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/support`,
        });
      }
    } else {
      // One-time donation
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: { name: "One-time Donation" },
            unit_amount: cents,
          },
          quantity: 1,
        }],
        customer_email: email || undefined,
        metadata: { donationType, email: email || "", name: name || "" },
        success_url: `${baseUrl}/donations/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/support`,
      });
    }

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create payment session" },
      { status: 500 }
    );
  }
}
