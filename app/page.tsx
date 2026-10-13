const markets = [
  { property: "Premier League", market: "United Kingdom", benchmark: "£1.7bn", status: "Awaiting input" },
  { property: "Champions League", market: "United Kingdom", benchmark: "€562m", status: "Awaiting input" },
  { property: "LaLiga", market: "United States", benchmark: "$___", status: "Awaiting input" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <h1 className="text-3xl font-bold">IMG Rights Tracker</h1>
      <p className="mt-2 text-slate-600">
        Compare reported rights values with commercial team input.
      </p>

      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Market comparison</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-sm text-slate-500">
                <th className="p-3">Property</th>
                <th className="p-3">Market</th>
                <th className="p-3">Reported AAV</th>
                <th className="p-3">Commercial AAV</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((row) => (
                <tr key={`${row.property}-${row.market}`} className="border-b">
                  <td className="p-3 font-medium">{row.property}</td>
                  <td className="p-3">{row.market}</td>
                  <td className="p-3">{row.benchmark}</td>
                  <td className="p-3">
                    <input
                      className="w-32 rounded-md border p-2"
                      placeholder="Enter value"
                    />
                  </td>
                  <td className="p-3 text-amber-600">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
