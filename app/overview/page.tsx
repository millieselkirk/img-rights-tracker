"use client";

import { useMemo, useState } from "react";
import {
  ALL_RIGHTS_DEALS,
  RightsDeal,
} from "../data/rights-data";

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function PropertyCard({
  property,
  deals,
  imgProperty,
  onClick,
}: {
  property: string;
  deals: RightsDeal[];
  imgProperty?: boolean;
  onClick: () => void;
}) {
  const markets = new Set(deals.map((deal) => deal.market));

  return (
    <button
      onClick={onClick}
      className="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="min-h-6">
            {imgProperty && (
              <span className="inline-flex rounded-md bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                IMG property
              </span>
            )}
          </div>
          <h2 className={`${imgProperty ? "mt-2" : "mt-0"} text-xl font-bold`}>
            {property}
          </h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {deals.length} records
        </span>
      </div>
      <p className="mt-4 text-sm text-slate-500">
        {markets.size} markets · 2025/26–2029/30
      </p>
      <p className="mt-5 text-sm font-semibold text-[#e31837]">
        View rights overview →
      </p>
    </button>
  );
}

export default function OverviewPage() {
  const properties = useMemo(
    () => Array.from(new Set(ALL_RIGHTS_DEALS.map((deal) => deal.property))),
    []
  );

  const [selectedProperty, setSelectedProperty] = useState(properties[0]);
  const [marketFilter, setMarketFilter] = useState("All markets");

  const selectedDeals = ALL_RIGHTS_DEALS.filter(
    (deal) =>
      deal.property === selectedProperty &&
      (marketFilter === "All markets" || deal.market === marketFilter)
  );

  const markets = Array.from(
    new Set(
      ALL_RIGHTS_DEALS.filter((deal) => deal.property === selectedProperty).map(
        (deal) => deal.market
      )
    )
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-[#111827] text-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <img src="/img-logo-white.png" alt="IMG" className="h-9 w-auto" />
          <p className="mt-6 text-sm uppercase tracking-wider text-white/60">
            Football Rights Tracker
          </p>
          <h1 className="mt-1 text-3xl font-bold">Rights overview</h1>
          <p className="mt-2 text-white/70">
            Read-only view of current rights records and IMG properties.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 grid gap-5 md:grid-cols-2">
          {properties.map((property) => {
            const deals = ALL_RIGHTS_DEALS.filter(
              (deal) => deal.property === property
            );

            return (
              <PropertyCard
                key={property}
                property={property}
                deals={deals}
                imgProperty={property === "Eredivisie"}
                onClick={() => {
                  setSelectedProperty(property);
                  setMarketFilter("All markets");
                }}
              />
            );
          })}
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="min-h-6">
                {selectedProperty === "Eredivisie" && (
                  <span className="inline-flex rounded-md bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    IMG property
                  </span>
                )}
              </div>
              <h2 className="mt-1 text-2xl font-bold">{selectedProperty}</h2>
            </div>

            <select
              value={marketFilter}
              onChange={(event) => setMarketFilter(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
            >
              <option>All markets</option>
              {markets.map((market) => (
                <option key={market}>{market}</option>
              ))}
            </select>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Market</th>
                  <th className="px-4 py-3">Broadcaster</th>
                  <th className="px-4 py-3">Package</th>
                  <th className="px-4 py-3">Cycle</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedDeals.map((deal) => (
                  <tr key={deal.id}>
                    <td className="px-4 py-4 font-semibold">{deal.market}</td>
                    <td className="px-4 py-4">{deal.broadcaster}</td>
                    <td className="px-4 py-4">{deal.package}</td>
                    <td className="px-4 py-4">{deal.cycle}</td>
                    <td className="px-4 py-4 font-semibold">
                      {formatCurrency(deal.value, deal.currency)}
                    </td>
                    <td className="px-4 py-4 text-slate-500">{deal.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          Need to submit your commercial input? Use your personal link supplied by IMG.
        </div>
      </div>
    </main>
  );
}
