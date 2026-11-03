"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { ALL_RIGHTS_DEALS, RightsDeal } from "./data/rights-data";

type Tab = "Rights Overview" | "SportBusiness Import" | "IMG Commercial Inputs";
type Region = "EMEA" | "APAC" | "AMERICAS";
type Confidence = "High" | "Medium" | "Low";
type Status = "Not started" | "In progress" | "Complete";

type CommercialInput = {
  id: number;
  region: Region;
  property: string;
  market: string;
  cycle: string;
  aav: string;
  cycleTotal: string;
  currency: string;
  confidence: Confidence;
  packageDetails: string;
  commentary: string;
  matchesSportBusiness: boolean;
  owner: string;
  ownerEmail: string;
  due: string;
  status: Status;
  lastUpdated?: string;
};

type ImportedRow = {
  property: string;
  market: string;
  broadcaster: string;
  package: string;
  packageDetails: string;
  rightsType: string;
  matchCount: string;
  cycle: string;
  term: string;
  value: number;
  currency: string;
};

const DEALS_KEY = "img-rights-tracker-deals";
const INPUTS_KEY = "img-rights-tracker-commercial-inputs";

const initialInputs: CommercialInput[] = [
  {
    id: 101,
    region: "EMEA",
    property: "UEFA Champions League",
    market: "United Kingdom",
    cycle: "2024–27",
    aav: "",
    cycleTotal: "",
    currency: "USD",
    confidence: "Medium",
    packageDetails: "",
    commentary: "",
    matchesSportBusiness: false,
    owner: "Alberto Horta",
    ownerEmail: "alberto.horta@img.com",
    due: "2026-11-10",
    status: "Not started",
  },
];

function regionForMarket(market: string): Region {
  const value = market.toLowerCase();
  if (["australia", "china", "india", "indonesia", "japan", "korea", "hong kong"].some((x) => value.includes(x))) return "APAC";
  if (["united states", "brazil", "mexico", "south america", "central america", "canada"].some((x) => value.includes(x))) return "AMERICAS";
  return "EMEA";
}

function ownerForMarket(market: string) {
  const value = market.toLowerCase();
  if (value.includes("spain") || value.includes("portugal")) return { owner: "Jordi Hernandez", ownerEmail: "jordi.hernandez@img.com" };
  if (["united states", "canada", "mexico"].some((x) => value.includes(x))) return { owner: "Hillary Mandel", ownerEmail: "hillary.mandel@img.com" };
  if (["australia", "china", "india", "indonesia", "japan", "korea"].some((x) => value.includes(x))) return { owner: "Dale Levin", ownerEmail: "dale.levin@img.com" };
  return { owner: "Alberto Horta", ownerEmail: "alberto.horta@img.com" };
}

function formatCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString()}`;
  }
}

function numberFrom(value: unknown) {
  const parsed = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function importedValue(row: Record<string, unknown>) {
  const key = Object.keys(row).find((name) => /cycle total|value|aav|amount/i.test(name));
  const value = numberFrom(key ? row[key] : 0);
  return value > 0 && value < 1000000 ? value * 1000000 : value;
}

function importedRow(row: Record<string, unknown>): ImportedRow {
  const get = (pattern: RegExp, fallback = "") => {
    const key = Object.keys(row).find((name) => pattern.test(name));
    return key ? String(row[key] ?? fallback) : fallback;
  };
  const market = get(/market|territory|country/i);
  return {
    property: get(/property|competition|league/i, "UEFA Champions League"),
    market,
    broadcaster: get(/broadcaster|rights holder|rightsholder|licensee/i, "Market total"),
    package: get(/package/i, "Live rights"),
    packageDetails: get(/package details|details/i),
    rightsType: get(/rights type|rightstype/i),
    matchCount: get(/match count|matches|games/i),
    cycle: get(/cycle|term|season/i, "2024–27"),
    term: get(/term|season list|seasons/i, ""),
    value: importedValue(row),
    currency: get(/currency|ccy/i, "USD").toUpperCase(),
  };
}

function Badge({ status }: { status: Status }) {
  const colour = status === "Complete" ? "bg-green-100 text-green-800" : status === "In progress" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800";
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colour}`}>{status}</span>;
}

export default function Page() {
  const [tab, setTab] = useState<Tab>("Rights Overview");
  const [deals, setDeals] = useState<RightsDeal[]>(ALL_RIGHTS_DEALS);
  const [inputs, setInputs] = useState<CommercialInput[]>(initialInputs);
  const [property, setProperty] = useState("UEFA Champions League");
  const [cycle, setCycle] = useState("All cycles");
  const [market, setMarket] = useState("All markets");
  const [broadcaster, setBroadcaster] = useState("All broadcasters");
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [importRows, setImportRows] = useState<ImportedRow[]>([]);
  const [importName, setImportName] = useState("");
  const [importError, setImportError] = useState("");
  const [inputRegion, setInputRegion] = useState<Region>("EMEA");
  const [draft, setDraft] = useState({ property: "UEFA Champions League", market: "", cycle: "2024–27", aav: "", cycleTotal: "", currency: "USD", confidence: "Medium" as Confidence, packageDetails: "", commentary: "", matchesSportBusiness: false, owner: "Alberto Horta", ownerEmail: "alberto.horta@img.com", due: "" });

  useEffect(() => {
    try {
      const savedDeals = localStorage.getItem(DEALS_KEY);
      const savedInputs = localStorage.getItem(INPUTS_KEY);
      if (savedDeals) {
        const saved = JSON.parse(savedDeals) as RightsDeal[];
        const byId = new Map(ALL_RIGHTS_DEALS.map((deal) => [deal.id, deal]));
        saved.forEach((deal) => byId.set(deal.id, { ...byId.get(deal.id), ...deal } as RightsDeal));
        setDeals(Array.from(byId.values()).map((deal) => deal.property === "Eredivisie" ? { ...deal, source: "IMG confirmed sale", package: "All matches", term: "2025/26, 2026/27, 2027/28, 2028/29, 2029/30" } : deal));
      }
      if (savedInputs) setInputs(JSON.parse(savedInputs));
    } catch {}
    finally { setIsHydrated(true); }
  }, []);

  useEffect(() => { if (isHydrated) localStorage.setItem(DEALS_KEY, JSON.stringify(deals)); }, [deals, isHydrated]);
  useEffect(() => { localStorage.setItem(INPUTS_KEY, JSON.stringify(inputs)); }, [inputs]);

  const properties = useMemo(() => Array.from(new Set(deals.map((deal) => deal.property))).sort(), [deals]);
  const propertyDeals = deals.filter((deal) => deal.property === property);
  const cycles = Array.from(new Set(propertyDeals.map((deal) => deal.cycle))).sort();
  const markets = Array.from(new Set(propertyDeals.map((deal) => deal.market)));
  const broadcasters = Array.from(new Set(propertyDeals.map((deal) => deal.broadcaster)));
  const visibleDeals = propertyDeals.filter((deal) => (cycle === "All cycles" || deal.cycle === cycle) && (market === "All markets" || deal.market === market) && (broadcaster === "All broadcasters" || deal.broadcaster === broadcaster));
  const territoryRows = Array.from(new Set(visibleDeals.map((deal) => deal.market))).map((territory) => {
    const rows = visibleDeals.filter((deal) => deal.market === territory);
    const currency = rows[0]?.currency || "USD";
    const total = rows.filter((deal) => deal.currency === currency).reduce((sum, deal) => sum + deal.value, 0);
    const commercialTotal = rows.filter((deal) => deal.currency === currency).reduce((sum, deal) => sum + (deal.commercialValue || 0), 0);
    const commercialStatus = rows.length > 0 && rows.every((deal) => deal.commercialStatus === "Verified by commercial") ? "Verified by commercial" : rows.some((deal) => deal.commercialStatus || deal.commercialValue || deal.commercialCommentary) ? "Commercial view" : "Not yet provided";
    return { territory, rows, currency, total, commercialTotal, commercialStatus };
  });
  const selectedTerritoryDeals = selectedMarket ? visibleDeals.filter((deal) => deal.market === selectedMarket) : [];
  const selectedReportedTotal = selectedTerritoryDeals.reduce((sum, deal) => sum + deal.value, 0);
  const selectedCommercialTotal = selectedTerritoryDeals.reduce((sum, deal) => sum + (deal.commercialValue || 0), 0);
  const selectedCommercialStatus = selectedTerritoryDeals.length > 0 && selectedTerritoryDeals.every((deal) => deal.commercialStatus === "Verified by commercial") ? "Verified by commercial" : selectedTerritoryDeals.some((deal) => deal.commercialStatus || deal.commercialValue || deal.commercialCommentary) ? "Commercial view" : "Not yet provided";
  const visibleInputs = inputs.filter((input) => input.region === inputRegion);

  function selectProperty(value: string) {
    setProperty(value);
    setCycle("All cycles");
    setMarket("All markets");
    setBroadcaster("All broadcasters");
    setSelectedMarket(null);
  }

  function updateDraft(field: string, value: string | boolean) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function saveInput() {
    if (!draft.market.trim()) return;
    const input: CommercialInput = {
      id: Date.now(),
      region: inputRegion,
      property: draft.property,
      market: draft.market.trim(),
      cycle: draft.cycle,
      aav: draft.aav,
      cycleTotal: draft.cycleTotal,
      currency: draft.currency,
      confidence: draft.confidence,
      packageDetails: draft.packageDetails,
      commentary: draft.commentary,
      matchesSportBusiness: draft.matchesSportBusiness,
      owner: draft.owner,
      ownerEmail: draft.ownerEmail,
      due: draft.due,
      status: draft.aav || draft.cycleTotal ? "In progress" : "Not started",
      lastUpdated: new Date().toISOString(),
    };
    setInputs((current) => [...current, input]);
    setDraft((current) => ({ ...current, market: "", aav: "", cycleTotal: "", packageDetails: "", commentary: "", matchesSportBusiness: false }));
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportName(file.name);
    setImportError("");
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const mapped = rows.map(importedRow).filter((row) => row.market || row.broadcaster);
      if (!mapped.length) throw new Error("No rights records were found in the file.");
      setImportRows(mapped);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "The file could not be imported.");
    }
  }

  function approveImport() {
    const additions = importRows.map((row, index) => ({ id: Date.now() + index, ...row, region: regionForMarket(row.market), source: "SportBusiness" }));
    setDeals((current) => [...current, ...additions]);
    setImportRows([]);
    setTab("Rights Overview");
  }

  function changeStatus(id: number, status: Status) {
    setInputs((current) => current.map((input) => input.id === id ? { ...input, status, lastUpdated: new Date().toISOString() } : input));
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-[#111827] text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-5">
          <img src="/img-logo-white.png" alt="IMG" className="h-9 w-auto" />
          <div className="border-l border-white/30 pl-4"><p className="text-xs uppercase tracking-[0.25em] text-white/60">Football</p><h1 className="text-xl font-semibold">Rights Tracker — Admin</h1></div>
        </div>
      </header>

      <nav className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl gap-2 px-6">{(["Rights Overview", "SportBusiness Import", "IMG Commercial Inputs"] as Tab[]).map((item) => <button key={item} onClick={() => setTab(item)} className={`border-b-2 px-4 py-4 text-sm font-semibold ${tab === item ? "border-[#e31837] text-[#e31837]" : "border-transparent text-slate-500"}`}>{item}</button>)}</div></nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {tab === "Rights Overview" && <section className="space-y-8">
          <div><p className="text-sm font-semibold uppercase tracking-wider text-[#e31837]">Rights Overview</p><h2 className="mt-1 text-3xl font-bold">Football rights market view</h2><p className="mt-2 text-slate-500">Admin view of SportBusiness and IMG property rights records.</p></div>
          <div className="grid gap-4 md:grid-cols-3">{properties.map((item) => { const records = deals.filter((deal) => deal.property === item); return <button key={item} onClick={() => selectProperty(item)} className="rounded-2xl bg-white p-5 text-left shadow-sm hover:-translate-y-0.5 hover:shadow-md"><div className="min-h-6">{item === "Eredivisie" && <span className="inline-flex rounded-md bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">IMG property</span>}</div><h3 className={`${item === "Eredivisie" ? "mt-2" : "mt-0"} text-lg font-bold`}>{item}</h3><p className="mt-3 text-sm text-slate-500">{records.length} rights records</p><p className="mt-4 text-sm font-semibold text-[#e31837]">View overview →</p></button>; })}</div>
          <div className="flex flex-wrap gap-3"><select value={property} onChange={(e) => selectProperty(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold">{properties.map((item) => <option key={item}>{item}</option>)}</select><select value={cycle} onChange={(e) => { setCycle(e.target.value); setSelectedMarket(null); }} className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"><option>All cycles</option>{cycles.map((item) => <option key={item}>{item}</option>)}</select><select value={market} onChange={(e) => { setMarket(e.target.value); setSelectedMarket(null); }} className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"><option>All markets</option>{markets.map((item) => <option key={item}>{item}</option>)}</select><select value={broadcaster} onChange={(e) => setBroadcaster(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"><option>All broadcasters</option>{broadcasters.map((item) => <option key={item}>{item}</option>)}</select></div>
          {selectedMarket ? <section className="rounded-2xl bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Package breakdown</p><h3 className="mt-1 text-2xl font-bold">{selectedMarket}</h3><p className="mt-1 text-sm text-slate-500">{property}{cycle !== "All cycles" ? ` · ${cycle}` : ""}</p></div><button onClick={() => setSelectedMarket(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">← Back to territory overview</button></div><div className="mt-6">{property === "Eredivisie" ? <div className="rounded-xl border border-blue-200 bg-blue-50 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-blue-700">IMG property details</p><div className="mt-4 space-y-3">{selectedTerritoryDeals.map((deal) => <div key={deal.id} className="border-b border-blue-200 pb-3 last:border-0"><p className="font-semibold">{deal.broadcaster} · {deal.package}</p><p className="text-sm">{deal.packageDetails || "Not specified"} · {formatCurrency(deal.value, deal.currency)}</p></div>)}</div></div> : <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><div className="rounded-xl border border-slate-200 bg-slate-50 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-slate-600">SportBusiness reported</p><div className="mt-3 flex items-end justify-between gap-4"><p className="text-sm text-slate-500">Reported total figure</p><p className="text-xl font-bold">{formatCurrency(selectedReportedTotal, selectedTerritoryDeals[0]?.currency || "USD")}</p></div><div className="mt-5 space-y-3">{selectedTerritoryDeals.map((deal) => <div key={deal.id} className="border-t border-slate-200 pt-3"><p className="font-semibold">{deal.broadcaster} · {deal.package}</p><p className="mt-1 text-sm">{deal.packageDetails || "Not specified"}</p><p className="mt-1 text-xs text-slate-500">{deal.cycle} · {deal.term || "Term not specified"} · {deal.source}</p></div>)}</div></div><div className="rounded-xl border border-blue-200 bg-blue-50 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-blue-700">IMG Commercial view</p><div className="mt-4 space-y-4"><div><p className="text-xs uppercase text-slate-500">IMG Commercial reported total figure</p><p className="mt-1 text-xl font-bold">{selectedCommercialTotal ? formatCurrency(selectedCommercialTotal, selectedTerritoryDeals[0]?.currency || "USD") : "Not provided"}</p></div><div><p className="text-xs uppercase text-slate-500">IMG Commercial status</p><p className="mt-1 font-semibold">{selectedCommercialStatus}</p></div>{selectedCommercialStatus === "Verified by commercial" ? <div className="rounded-lg bg-green-100 p-4 text-sm font-semibold text-green-800">✓ IMG Commercial has verified the SportBusiness package information and reported total.</div> : <div><p className="text-xs uppercase text-slate-500">IMG Commercial commentary</p><p className="mt-1 font-semibold">{selectedTerritoryDeals.map((deal) => deal.commercialCommentary).filter(Boolean).join(" ") || "No separate IMG Commercial breakdown provided."}</p></div>}</div></div></div>}</div></section> : <div className="overflow-hidden rounded-2xl bg-white shadow-sm"><div className="border-b border-slate-200 p-6"><div className="min-h-6">{property === "Eredivisie" && <span className="inline-flex rounded-md bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">IMG property</span>}</div><h3 className="mt-1 text-lg font-bold">{property}</h3><p className="mt-2 text-sm text-slate-500">Select a territory to view its package breakdown.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{(property === "Eredivisie" ? ["Territory", "IMG property total", "Packages"] : ["Territory", "SportBusiness reported total", "IMG Commercial reported total", "IMG Commercial status", "Packages"]).map((head) => <th key={head} className="px-6 py-4">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{territoryRows.map((row) => <tr key={row.territory} onClick={() => setSelectedMarket(row.territory)} className="cursor-pointer transition hover:bg-blue-50"><td className="px-6 py-4 font-semibold">{row.territory}</td>{property === "Eredivisie" ? <><td className="px-6 py-4 font-semibold">{formatCurrency(row.total, row.currency)}</td><td className="px-6 py-4">{row.rows.length}</td></> : <><td className="px-6 py-4 font-semibold">{formatCurrency(row.total, row.currency)}</td><td className="px-6 py-4 font-semibold">{row.commercialTotal ? formatCurrency(row.commercialTotal, row.currency) : "—"}</td><td className="px-6 py-4">{row.commercialStatus}</td><td className="px-6 py-4">{row.rows.length}</td></>}</tr>)}</tbody></table></div></div>}
        </section>}

        {tab === "SportBusiness Import" && <section className="space-y-8"><div><p className="text-sm font-semibold uppercase tracking-wider text-[#e31837]">SportBusiness Import — Admin</p><h2 className="mt-1 text-3xl font-bold">Import and approve rights data</h2></div><div className="rounded-2xl bg-white p-6 shadow-sm"><label className="inline-flex cursor-pointer rounded-lg bg-[#e31837] px-5 py-3 text-sm font-semibold text-white">Choose CSV, XLSX or XLS file<input type="file" accept=".csv,.xlsx,.xls" onChange={handleImport} className="hidden" /></label>{importName && <p className="mt-4 text-sm text-slate-600">Selected file: <strong>{importName}</strong></p>}{importError && <p className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{importError}</p>}</div>{importRows.length > 0 && <div className="overflow-hidden rounded-2xl bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 p-6"><div><h3 className="text-lg font-bold">Import review</h3><p className="text-sm text-slate-500">{importRows.length} rows ready for approval.</p></div><button onClick={approveImport} className="rounded-lg bg-[#e31837] px-5 py-3 text-sm font-semibold text-white">Approve rows</button></div><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><tbody className="divide-y divide-slate-100">{importRows.map((row, index) => <tr key={`${row.market}-${index}`}><td className="px-6 py-4 font-semibold">{row.property}</td><td className="px-6 py-4">{row.market}</td><td className="px-6 py-4">{row.broadcaster}</td><td className="px-6 py-4">{row.package}</td><td className="px-6 py-4">{row.cycle}</td><td className="px-6 py-4">{row.term || "Not specified"}</td><td className="px-6 py-4 font-semibold">{formatCurrency(row.value, row.currency)}</td></tr>)}</tbody></table></div></div>}</section>}

        {tab === "IMG Commercial Inputs" && <section className="space-y-8"><div><p className="text-sm font-semibold uppercase tracking-wider text-[#e31837]">IMG Commercial Inputs — Admin</p><h2 className="mt-1 text-3xl font-bold">Manage IMG Commercial inputs</h2></div><div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><div className="rounded-2xl bg-white p-6 shadow-sm"><h3 className="text-lg font-bold">Add IMG Commercial input</h3><div className="mt-6 space-y-4"><label className="block text-sm font-semibold">Region<select value={inputRegion} onChange={(e) => setInputRegion(e.target.value as Region)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal"><option>EMEA</option><option>APAC</option><option>AMERICAS</option></select></label><label className="block text-sm font-semibold">Property<select value={draft.property} onChange={(e) => updateDraft("property", e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal">{properties.map((item) => <option key={item}>{item}</option>)}</select></label><label className="block text-sm font-semibold">Market<input value={draft.market} onChange={(e) => { updateDraft("market", e.target.value); const owner = ownerForMarket(e.target.value); setDraft((current) => ({ ...current, owner: owner.owner, ownerEmail: owner.ownerEmail })); }} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">Cycle<input value={draft.cycle} onChange={(e) => updateDraft("cycle", e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal" /></label><label className="block text-sm font-semibold">Currency<select value={draft.currency} onChange={(e) => updateDraft("currency", e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal"><option>EUR</option><option>GBP</option><option>USD</option></select></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">AAV<input value={draft.aav} onChange={(e) => updateDraft("aav", e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal" /></label><label className="block text-sm font-semibold">Cycle total<input value={draft.cycleTotal} onChange={(e) => updateDraft("cycleTotal", e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal" /></label></div><label className="block text-sm font-semibold">Owner<input value={draft.owner} onChange={(e) => updateDraft("owner", e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal" /></label><label className="block text-sm font-semibold">Owner email<input value={draft.ownerEmail} onChange={(e) => updateDraft("ownerEmail", e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal" /></label><label className="block text-sm font-semibold">IMG Commercial commentary<textarea value={draft.commentary} onChange={(e) => updateDraft("commentary", e.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal" /></label><button onClick={saveInput} className="w-full rounded-lg bg-[#e31837] px-5 py-3 text-sm font-semibold text-white">Save input</button></div></div><div className="space-y-4"><h3 className="text-lg font-bold">Saved IMG Commercial inputs</h3>{visibleInputs.map((input) => <div key={input.id} className="rounded-2xl bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h4 className="text-lg font-bold">{input.property}</h4><p className="text-sm text-slate-500">{input.market} · {input.cycle}</p></div><Badge status={input.status} /></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">Owner</p><p className="mt-1 font-bold">{input.owner}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">AAV</p><p className="mt-1 font-bold">{input.aav ? formatCurrency(numberFrom(input.aav), input.currency) : "Not provided"}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">Cycle total</p><p className="mt-1 font-bold">{input.cycleTotal ? formatCurrency(numberFrom(input.cycleTotal), input.currency) : "Not provided"}</p></div></div><div className="mt-5 flex justify-end gap-3">{input.status !== "Complete" && <button onClick={() => changeStatus(input.id, "Complete")} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white">Mark complete</button>}{input.status === "Complete" && <button onClick={() => changeStatus(input.id, "In progress")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">Reopen</button>}</div></div>)}</div></div></section>}
      </div>
    </main>
  );
}
