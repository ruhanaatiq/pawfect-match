// src/app/payment/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

/* ---------------------------------------------
   SafeImage: avoids next/image host errors
---------------------------------------------- */
function SafeImage({
  src,
  alt = "",
  className = "",
  fill = false,
  sizes,
  priority = false,
  allowedHosts = ["i.ibb.co", "localhost"],
}) {
  const url = typeof src === "string" ? src.trim() : "";
  if (!url) return null;

  const isRemote = /^https?:\/\//i.test(url);
  let host = "";
  try {
    if (isRemote) host = new URL(url).hostname;
  } catch {}

  const canUseNextImage = !isRemote || allowedHosts.includes(host);

  if (canUseNextImage) {
    return fill ? (
      <Image src={url} alt={alt} fill className={className} sizes={sizes} priority={priority} />
    ) : (
      <Image src={url} alt={alt} width={80} height={80} className={className} sizes={sizes} priority={priority} />
    );
  }
  return <img src={url} alt={alt} className={className} loading={priority ? "eager" : "lazy"} />;
}

export default function PaymentPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cart") || "[]");
      setItems(Array.isArray(saved) ? saved : []);
    } catch {
      setItems([]);
    }
  }, []);

  const { subtotal, totalQty } = useMemo(() => {
    const sub = items.reduce((acc, i) => acc + Number(i.price) * Number(i.qty || 1), 0);
    const qty = items.reduce((acc, i) => acc + Number(i.qty || 1), 0);
    return { subtotal: sub, totalQty: qty };
  }, [items]);

  function updateQty(id, delta) {
    setItems((prev) => {
      const next = prev.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, (i.qty || 1) + delta) } : i
      );
      localStorage.setItem("cart", JSON.stringify(next));
      return next;
    });
  }

  function removeItem(id) {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      localStorage.setItem("cart", JSON.stringify(next));
      return next;
    });
  }

  function clearCart() {
    localStorage.removeItem("cart");
    setItems([]);
  }

  async function handleProceedToPay() {
    try {
      setErr("");
      setLoading(true);

      const current = JSON.parse(localStorage.getItem("cart") || "[]");
      if (!Array.isArray(current) || current.length === 0) {
        setErr("Your cart is empty.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: current }),
      });

      const data = await res.json();
      if (!res.ok || !data?.url) throw new Error(data?.error || "Failed to start checkout");

      window.location.href = data.url;
    } catch (e) {
      setErr(e?.message || "Something went wrong starting checkout.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-extrabold text-[#4C3D3D] mb-4">Payment</h1>

      {err && (
        <div className="alert alert-error mb-4">
          <span>{err}</span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="card bg-base-100 border border-gray-100 shadow p-6">
          <p>Your cart is empty.</p>
          <button
            className="btn rounded-none border-6 border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 mt-3"
            onClick={() => router.push("/accessories")}
          >
            Continue shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
          {/* Items */}
          <div className="card bg-base-100 border border-gray-100 shadow">
            <div className="card-body">
              <h2 className="card-title">Your items</h2>

              <div className="divide-y">
                {items.map((i) => (
                  <div key={i.id} className="py-4 flex gap-4 items-center">
                    <div className="relative w-20 h-20 overflow-hidden bg-gray-100">
                      <SafeImage
                        src={i.image}
                        alt={i.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="font-semibold">{i.name}</div>
                      <div className="text-sm text-gray-500">${Number(i.price).toFixed(2)}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className="btn btn-xs rounded-none border"
                        onClick={() => updateQty(i.id, -1)}
                        disabled={loading}
                      >
                        −
                      </button>
                      <span className="w-8 text-center">{i.qty || 1}</span>
                      <button
                        className="btn btn-xs rounded-none border"
                        onClick={() => updateQty(i.id, 1)}
                        disabled={loading}
                      >
                        +
                      </button>
                    </div>

                    <div className="w-24 text-right font-semibold">
                      ${(Number(i.price) * Number(i.qty || 1)).toFixed(2)}
                    </div>

                    <button
                      className="btn btn-ghost btn-xs rounded-none"
                      onClick={() => removeItem(i.id)}
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <button
                  className="btn btn-ghost btn-sm rounded-none"
                  onClick={clearCart}
                  disabled={loading}
                >
                  Clear cart
                </button>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="card bg-base-100 border border-gray-100 shadow h-fit">
            <div className="card-body">
              <h3 className="card-title">Order summary</h3>

              <div className="flex justify-between text-sm">
                <span>Items ({totalQty})</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>Free</span>
              </div>

              <div className="divider my-2"></div>

              <div className="flex justify-between font-bold ">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

          <div className="mt-4 flex flex-col gap-3">
  <button
    className={`btn rounded-none h-11 px-4 border-2 font-semibold ${
      loading
        ? "btn-disabled border-gray-300 bg-gray-200 text-gray-500"
        : "border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white"
    }`}
    onClick={handleProceedToPay}
    disabled={loading}
  >
    {loading ? "Redirecting…" : "Proceed to Pay"}
  </button>

  <button
    className="btn rounded-none h-11 border-2 border-emerald-600 bg-white text-emerald-700 hover:bg-emerald-50"
    onClick={() => router.push("/accessories")}
    disabled={loading}
  >
    Continue shopping
  </button>
</div>


              <p className="text-[11px] text-gray-500 mt-2">
                You’ll be securely redirected to Stripe Checkout to complete your purchase.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
