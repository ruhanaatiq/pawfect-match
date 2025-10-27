// src/app/api/stripe/create-checkout-session/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

// Build an absolute base URL that works locally and on Vercel
function baseUrlFromReq(req) {
  const proto = req.headers.get("x-forwarded-proto") || "http";
  const host =
    req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const baseUrl = baseUrlFromReq(req);

    // ---------- A) SHOP CHECKOUT (pet accessories) ----------
    // Expect: { items: [{ name, price, qty }, ...] }  // price in dollars
    if (Array.isArray(body.items) && body.items.length > 0) {
      const line_items = body.items.map((i) => ({
        price_data: {
          currency: "usd",
          product_data: { name: String(i?.name || "Item") },
          unit_amount: Math.max(100, Math.round(Number(i?.price) * 100)), // min $1
        },
        quantity: Math.max(1, Number(i?.qty || 1)),
      }));

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items,
        success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/payment`,
      });

      return NextResponse.json({ url: session.url }, { status: 200 });
    }

    // ---------- B) DONATION CHECKOUT ----------
    // Expect: { donationType: "one-time" | "monthly", amount, email?, name? }
    // amount = integer cents (e.g., $15 => 1500)
    const donationType = String(body.donationType || "one-time");
    const email = body.email || null;
    const name = body.name || null;

    const cents = Math.round(Number(body.amount));
    if (!Number.isFinite(cents) || cents < 100) {
      return NextResponse.json({ error: "Invalid donation amount" }, { status: 400 });
    }

    let session;

    if (donationType === "monthly") {
      // Prefer a predefined recurring price in Stripe dashboard
      // Set STRIPE_MONTHLY_PRICE_ID to a recurring price ID (e.g., price_123)
      const priceId = process.env.STRIPE_MONTHLY_PRICE_ID;

      if (priceId) {
        session = await stripe.checkout.sessions.create({
          mode: "subscription",
          line_items: [{ price: priceId, quantity: 1 }],
          customer_email: email || undefined,
          metadata: { donationType, email: email || "", name: name || "" },
          success_url: `${baseUrl}/donations/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/support`,
        });
      } else {
        // Fallback: dynamic recurring price (okay for dev; can clutter Stripe)
        session = await stripe.checkout.sessions.create({
          mode: "subscription",
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: { name: "Monthly Donation" },
                unit_amount: cents,
                recurring: { interval: "month" },
              },
              quantity: 1,
            },
          ],
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
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: "One-time Donation" },
              unit_amount: cents,
            },
            quantity: 1,
          },
        ],
        customer_email: email || undefined,
        metadata: { donationType, email: email || "", name: name || "" },
        success_url: `${baseUrl}/donations/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/support`,
      });
    }

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

// (Optional) quickly indicate not-allowed methods as JSON
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
