"use client";

import { useState } from "react";

const markets = [
  {
    property: "UEFA Champions League",
    market: "United Kingdom",
    benchmark: "€562m",
    commercial: "",
    status: "Awaiting input",
  },
  {
    property: "Premier League",
    market: "United Kingdom",
    benchmark: "£1.7bn",
    commercial: "",
    status: "Awaiting input",
  },
  {
    property: "LaLiga",
    market: "United States",
    benchmark: "$175m",
    commercial: "",
    status: "Awaiting input",
  },
];

export default function Home() {
  const [rows, setRows] = useState(markets);

  function updateCommercial(index: number, value: string) {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              commercial: value,
              status: value ? "Ready for review" : "Awaiting input",
            }
          : row
      )
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#10233f]">
      <header className="bg-[#10233f] px-8 py-5 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <div className="text-2xl font-bold tracking-tight">IMG</div>
            <div className="text-sm text-slate-300">Rights Tracker</div>
          </div>

          <button className="rounded-lg bg-[#e21d38] px-4 py-2 text-sm font-semibold hover:bg-[#c91830]">
            Import SportBusiness export
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-8 py-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#e21d38]">
            Football rights intelligence
          </p>
          <h1 className="mt-2 text-3xl font-bold">Market comparison</h1>
          <p className="mt-2 text-slate-600">
            Compare reported rights values with the commercial team view.
          </p>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          {[
            ["Markets tracked", "53"],
            ["Commercial inputs", "0"],
            ["Awaiting review", "53"],
            ["Latest import", "Sample data"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Commercial input</h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter the commercial team AAV for each market.
              </p>
            </div>

            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Draft workspace
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wide text-slate-500">
                  <th className="p-3">Property</th>
                  <th className="p-3">Market</th>
                  <th className="p-3">SportBusiness AAV</th>
                  <th className="p-3">Commercial AAV</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${row.property}-${row.market}`} className="border-b">
                    <td className="p-3 font-semibold">{row.property}</td>
                    <td className="p-3">{row.market}</td>
                    <td className="p-3">{row.benchmark}</td>
                    <td className="p-3">
                      <input
                        value={row.commercial}
                        onChange={(event) =>
                          updateCommercial(index, event.target.value)
                        }
                        placeholder="Enter value"
                        className="w-36 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#e21d38] focus:ring-2 focus:ring-red-100"
                      />
                    </td>
                    <td className="p-3">
                      <span
                        className={
                          row.commercial
                            ? "text-sm font-semibold text-green-700"
                            : "text-sm text-slate-500"
                        }
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
