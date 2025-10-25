export default function Success() {
  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-emerald-600">Payment successful 🎉</h1>
      <p className="mt-2 text-gray-600">Thanks! We’ve emailed your receipt.</p>
      <a className="btn btn-primary mt-6" href="/accessories">Back to shop</a>
    </div>
  );
}
