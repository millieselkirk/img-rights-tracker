"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import * as XLSX from "xlsx";

type Tab = "Rights Overview" | "SportBusiness Import" | "Commercial Inputs";

type Deal = {
  id: number;
  property: string;
  market: string;
  broadcaster: string;
  packageName: string;
  rightsType: string;
  cycle: string;
  aav: number | null;
  cycleTotal: number | null;
  currency: string;
  recordType: "Deal" | "Market total";
  includeInRollup: boolean;
  source: string;
  confidence: "High" | "Medium" | "Low";
};

type CommercialInput = {
  id: number;
  property: string;
  market: string;
  cycle: string;
  aav: string;
  cycleTotal: string;
  currency: string;
  confidence: "High" | "Medium" | "Low";
  owner: string;
  due: string;
};

type ImportedRow = {
  id: number;
  property: string;
  market: string;
  broadcaster: string;
  packageName: string;
  rightsType: string;
  cycle: string;
  reportedAav: string;
  cycleTotal: string;
  currency: string;
  recordType: "Deal" | "Market total";
  status: "Ready to review" | "Approved" | "Needs attention";
};

const properties = [
  "UEFA Champions League",
  "Premier League",
  "LaLiga",
  "Bundesliga",
  "Serie A",
  "Ligue 1",
  "WSL",
];

const initialDeals: Deal[] = [
  {
    id: 1,
    property: "UEFA Champions League",
    market: "United Kingdom",
    broadcaster: "Reported market benchmark",
    packageName: "All packages",
    rightsType: "Market total",
    cycle: "2024–27",
    aav: 562,
    cycleTotal: 1686,
    currency: "EUR",
    recordType: "Market total",
    includeInRollup: false,
    source: "Sample prototype row",
    confidence: "Medium",
  },
  {
    id: 2,
    property: "UEFA Champions League",
    market: "Germany",
    broadcaster: "DAZN",
    packageName: "National live package",
    rightsType: "Live",
    cycle: "2024–27",
    aav: 240,
    cycleTotal: 720,
    currency: "EUR",
    recordType: "Deal",
    includeInRollup: true,
    source: "Sample prototype row",
    confidence: "Medium",
  },
  {
    id: 3,
    property: "Premier League",
    market: "United Kingdom",
    broadcaster: "Reported market benchmark",
    packageName: "All packages",
    rightsType: "Market total",
    cycle: "2025–29",
    aav: 1700,
    cycleTotal: 6800,
    currency: "GBP",
    recordType: "Market total",
    includeInRollup: false,
    source: "Sample prototype row",
    confidence: "Medium",
  },
  {
    id: 4,
    property: "LaLiga",
    market: "United States",
    broadcaster: "Reported market benchmark",
    packageName: "All packages",
    rightsType: "Market total",
    cycle: "2024–27",
    aav: 175,
    cycleTotal: 525,
    currency: "USD",
    recordType: "Market total",
    includeInRollup: false,
    source: "Sample prototype row",
    confidence: "Medium",
  },
  {
    id: 5,
    property: "Bundesliga",
    market: "United States",
    broadcaster: "Broadcaster to confirm",
    packageName: "Package to confirm",
    rightsType: "Live",
    cycle: "2025–29",
    aav: null,
    cycleTotal: null,
    currency: "USD",
    recordType: "Deal",
    includeInRollup: true,
    source: "Pending input",
    confidence: "Low",
  },
  {
    id: 6,
    property: "Serie A",
    market: "United Kingdom",
    broadcaster: "Broadcaster to confirm",
    packageName: "Package to confirm",
    rightsType: "Live",
    cycle: "2024–27",
    aav: null,
    cycleTotal: null,
    currency: "GBP",
    recordType: "Deal",
    includeInRollup: true,
    source: "Pending input",
    confidence: "Low",
  },
  {
    id: 7,
    property: "Ligue 1",
    market: "United Kingdom",
    broadcaster: "Broadcaster to confirm",
    packageName: "Package to confirm",
    rightsType: "Live",
    cycle: "2024–27",
    aav: null,
    cycleTotal: null,
    currency: "GBP",
    recordType: "Deal",
    includeInRollup: true,
    source: "Pending input",
    confidence: "Low",
  },
  {
    id: 8,
    property: "WSL",
    market: "United Kingdom",
    broadcaster: "Broadcaster to confirm",
    packageName: "Package to confirm",
    rightsType: "Live",
    cycle: "2025–29",
    aav: null,
    cycleTotal: null,
    currency: "GBP",
    recordType: "Deal",
    includeInRollup: true,
    source: "Pending input",
    confidence: "Low",
  },
];

const initialCommercialInputs: CommercialInput[] = [
  {
    id: 1,
    property: "UEFA Champions League",
    market: "United Kingdom",
    cycle: "2024–27",
    aav: "",
    cycleTotal: "",
    currency: "EUR",
    confidence: "Medium",
    owner: "Football Commercial",
    due: "18 Oct 2026",
  },
  {
    id: 2,
    property: "Premier League",
    market: "United Kingdom",
    cycle: "2025–29",
    aav: "",
    cycleTotal: "",
    currency: "GBP",
    confidence: "Medium",
    owner: "Football Commercial",
    due: "18 Oct 2026",
  },
  {
    id: 3,
    property: "LaLiga",
    market: "United States",
    cycle: "2024–27",
    aav: "",
    cycleTotal: "",
    currency: "USD",
    confidence: "Medium",
    owner: "Americas Commercial",
    due: "25 Oct 2026",
  },
  {
    id: 4,
    property: "Bundesliga",
    market: "United States",
    cycle: "2025–29",
    aav: "",
    cycleTotal: "",
    currency: "USD",
    confidence: "Low",
    owner: "Americas Commercial",
    due: "25 Oct 2026",
  },
  {
    id: 5,
    property: "Serie A",
    market: "United Kingdom",
    cycle: "2024–27",
    aav: "",
    cycleTotal: "",
    currency: "GBP",
    confidence: "Low",
    owner: "Football Commercial",
    due: "1 Nov 2026",
  },
  {
    id: 6,
    property: "Ligue 1",
    market: "United Kingdom",
    cycle: "2024–27",
    aav: "",
    cycleTotal: "",
    currency: "GBP",
    confidence: "Low",
    owner: "Football Commercial",
    due: "1 Nov 2026",
  },
  {
    id: 7,
    property: "WSL",
    market: "United Kingdom",
    cycle: "2025–29",
    aav: "",
    cycleTotal: "",
    currency: "GBP",
    confidence: "Low",
    owner: "Football Commercial",
    due: "8 Nov 2026",
  },
];

const sampleImport: ImportedRow[] = [
  {
    id: 101,
    property: "UEFA Champions League",
    market: "Germany",
    broadcaster: "DAZN",
    packageName: "National live package",
    rightsType: "Live",
    cycle: "2024–27",
    reportedAav: "240",
    cycleTotal: "720",
    currency: "EUR",
    recordType: "Deal",
    status: "Ready to review",
  },
  {
    id: 102,
    property: "Premier League",
    market: "United Kingdom",
    broadcaster: "Reported market benchmark",
    packageName: "All packages",
    rightsType: "Market total",
    cycle: "2025–29",
    reportedAav: "1700",
    cycleTotal: "6800",
    currency: "GBP",
    recordType: "Market total",
    status: "Ready to review",
  },
  {
    id: 103,
    property: "LaLiga",
    market: "Japan",
    broadcaster: "",
    packageName: "",
    rightsType: "",
    cycle: "2024–27",
    reportedAav: "",
    cycleTotal: "",
    currency: "JPY",
    recordType: "Deal",
    status: "Needs attention",
  },
];

function parseAmount(value: string): number | null {
  const cleaned = value.toLowerCase().replace(/,/g, "").trim();

  if (!cleaned) {
    return null;
  }

  const number = Number.parseFloat(cleaned.replace(/[^\d.-]/g, ""));

  if (Number.isNaN(number)) {
    return null;
  }

  return cleaned.includes("bn") ? number * 1000 : number;
}

function formatValue(value: number | null, currency: string): string {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }

  const symbols: Record<string, string> = {
    EUR: "€",
    GBP: "£",
    USD: "$",
    JPY: "¥",
  };

  const symbol = symbols[currency] ?? `${currency} `;

  if (Math.abs(value) >= 1000) {
    return `${symbol}${(value / 1000).toFixed(1)}bn`;
  }

  return `${symbol}${Number.isInteger(value) ? value : value.toFixed(1)}m`;
}

function getCell(row: Record<string, unknown>, hints: string[]): string {
  const key = Object.keys(row).find((column) =>
    hints.some((hint) => column.toLowerCase().includes(hint))
  );

  return key ? String(row[key] ?? "") : "";
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("Rights Overview");
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [commercialInputs, setCommercialInputs] = useState<
    CommercialInput[]
  >(initialCommercialInputs);
  const [importRows, setImportRows] = useState<ImportedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importMessage, setImportMessage] = useState(
    "Upload a SportBusiness CSV or Excel export to begin."
  );
  const [approvedCount, setApprovedCount] = useState(0);

  const propertySummaries = useMemo(() => {
    return properties.map((property) => {
      const propertyDeals = deals.filter((deal) => deal.property === property);
      const markets = new Set(propertyDeals.map((deal) => deal.market));
      const inputs = commercialInputs.filter(
        (input) => input.property === property
      );
      const completedInputs = inputs.filter(
        (input) => input.aav.trim() || input.cycleTotal.trim()
      ).length;

      return {
        property,
        markets: markets.size,
        records: propertyDeals.length,
        completedInputs,
        totalInputs: inputs.length,
      };
    });
  }, [deals, commercialInputs]);

  const marketSummaries = useMemo(() => {
    if (!selectedProperty) {
      return [];
    }

    const propertyDeals = deals.filter(
      (deal) => deal.property === selectedProperty
    );

    const grouped = new Map<
      string,
      {
        property: string;
        market: string;
        cycle: string;
        currency: string;
        rows: Deal[];
      }
    >();

    propertyDeals.forEach((deal) => {
      const key = `${deal.market}-${deal.cycle}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          property: deal.property,
          market: deal.market,
          cycle: deal.cycle,
          currency: deal.currency,
          rows: [],
        });
      }

      grouped.get(key)?.rows.push(deal);
    });

    return Array.from(grouped.values()).map((group) => {
      const marketTotal = group.rows.find(
        (row) => row.recordType === "Market total"
      );

      const dealAav = group.rows
        .filter((row) => row.includeInRollup)
        .reduce((total, row) => total + (row.aav ?? 0), 0);

      const dealCycleTotal = group.rows
        .filter((row) => row.includeInRollup)
        .reduce((total, row) => total + (row.cycleTotal ?? 0), 0);

      const commercial = commercialInputs.find(
        (input) =>
          input.property === group.property &&
          input.market === group.market &&
          input.cycle === group.cycle
      );

      const sportBusinessAav = marketTotal?.aav ?? (dealAav || null);
      const sportBusinessTotal =
        marketTotal?.cycleTotal ?? (dealCycleTotal || null);

      const commercialAav = commercial
        ? parseAmount(commercial.aav)
        : null;

      const commercialTotal = commercial
        ? parseAmount(commercial.cycleTotal)
        : null;

      return {
        ...group,
        dealCount: group.rows.filter((row) => row.recordType === "Deal")
          .length,
        sportBusinessAav,
        sportBusinessTotal,
        commercialAav,
        commercialTotal,
        commercial,
      };
    });
  }, [deals, commercialInputs, selectedProperty]);

  const selectedDeals = selectedProperty
    ? deals.filter((deal) => deal.property === selectedProperty)
    : [];

  const completedCommercialInputs = commercialInputs.filter(
    (input) => input.aav.trim() || input.cycleTotal.trim()
  ).length;

  const readyToApprove = importRows.filter(
    (row) => row.status === "Ready to review"
  ).length;

  function navigate(tab: Tab) {
    setActiveTab(tab);
    setSelectedProperty(null);
  }

  function updateCommercial(
    id: number,
    field: "aav" | "cycleTotal" | "confidence",
    value: string
  ) {
    setCommercialInputs((current) =>
      current.map((input) =>
        input.id === id ? { ...input, [field]: value } : input
      )
    );
  }

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileName(file.name);
    setImportMessage("Reading export and mapping recognised columns...");

    try {
      const workbook = XLSX.read(await file.arrayBuffer(), {
        type: "array",
      });

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        firstSheet,
        { defval: "" }
      );

      const mappedRows: ImportedRow[] = rawRows
        .slice(0, 100)
        .map((row, index) => {
          const property = getCell(row, [
            "property",
            "competition",
            "tournament",
            "league",
          ]);

          const market = getCell(row, [
            "market",
            "territory",
            "country",
            "region",
          ]);

          const broadcaster = getCell(row, [
            "broadcaster",
            "platform",
            "partner",
            "licensee",
          ]);

          const packageName = getCell(row, [
            "package",
            "bundle",
            "selection",
          ]);

          const rightsType = getCell(row, [
            "rights type",
            "right type",
            "category",
          ]);

          const cycle = getCell(row, ["cycle", "season", "period"]);

          const reportedAav = getCell(row, [
            "aav",
            "annual",
            "per season",
            "value",
            "fee",
          ]);

          const cycleTotal = getCell(row, [
            "cycle total",
            "total over cycle",
            "total value",
            "total",
          ]);

          const currency = getCell(row, ["currency", "ccy"]) || "EUR";

          const recordTypeText = getCell(row, [
            "record type",
            "data type",
            "aggregation",
          ]).toLowerCase();

          const recordType = recordTypeText.includes("market")
            ? "Market total"
            : "Deal";

          return {
            id: Date.now() + index,
            property,
            market,
            broadcaster,
            packageName,
            rightsType,
            cycle,
            reportedAav,
            cycleTotal,
            currency,
            recordType,
            status:
              property && market && (reportedAav || cycleTotal)
                ? "Ready to review"
                : "Needs attention",
          };
        });

      setImportRows(mappedRows);
      setImportMessage(
        `${mappedRows.length} rows read. Review the proposed mapping before approval.`
      );
    } catch {
      setImportRows([]);
      setImportMessage(
        "This file could not be read. Please check that it is a valid CSV or Excel export."
      );
    }
  }

  function loadSampleExport() {
    setFileName("sample-sportbusiness-export.xlsx");
    setImportRows(sampleImport);
    setImportMessage(
      "Sample export loaded. Review the rows before approving them."
    );
  }

  function approveRows() {
    const rowsToApprove = importRows.filter(
      (row) => row.status === "Ready to review"
    );

    const newDeals: Deal[] = rowsToApprove.map((row, index) => ({
      id: Date.now() + index,
      property: row.property,
      market: row.market,
      broadcaster: row.broadcaster || "Broadcaster to confirm",
      packageName: row.packageName || "Package to confirm",
      rightsType: row.rightsType || "To confirm",
      cycle: row.cycle || "To confirm",
      aav: parseAmount(row.reportedAav),
      cycleTotal: parseAmount(row.cycleTotal),
      currency: row.currency || "EUR",
      recordType: row.recordType,
      includeInRollup: row.recordType === "Deal",
      source: fileName || "SportBusiness export",
      confidence: "Medium",
    }));

    setDeals((current) => [...current, ...newDeals]);
    setApprovedCount((current) => current + rowsToApprove.length);

    setImportRows((current) =>
      current.map((row) =>
        row.status === "Ready to review"
          ? { ...row, status: "Approved" }
          : row
      )
    );

    setImportMessage(
      `${rowsToApprove.length} row${
        rowsToApprove.length === 1 ? "" : "s"
      } approved for the tracker.`
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#10233f]">
      <header className="bg-[#10233f] px-8 py-5 text-white">
        <div className="mx-auto flex max-w-7xl items-center">
          <img
            src="/img-logo-white.png"
            alt="IMG"
            className="h-9 w-auto object-contain"
          />

          <div className="mx-4 h-8 w-px bg-slate-500" />

          <div>
            <div className="font-semibold">Rights Tracker</div>
            <div className="text-xs text-slate-300">
              Football rights intelligence
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b bg-white px-8">
        <div className="mx-auto flex max-w-7xl gap-7">
          {(
            [
              "Rights Overview",
              "SportBusiness Import",
              "Commercial Inputs",
            ] as Tab[]
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => navigate(tab)}
              className={`border-b-2 px-1 py-4 text-sm font-semibold ${
                activeTab === tab
                  ? "border-[#e21d38] text-[#e21d38]"
                  : "border-transparent text-slate-500 hover:text-[#10233f]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-8 py-10">
        {activeTab === "Rights Overview" && !selectedProperty && (
          <>
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#e21d38]">
                IMG Rights Intelligence
              </p>

              <h1 className="mt-2 text-3xl font-bold">Rights Overview</h1>

              <p className="mt-2 text-slate-600">
                Select a property to explore reported deals, market totals and
                the IMG commercial view.
              </p>
            </div>

            <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-950">
              <strong>Prototype data:</strong> the figures currently shown are
              sample rows to demonstrate the structure. Approved SportBusiness
              data will replace them through the import workflow.
            </div>

            <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {propertySummaries.map((summary) => (
                <article
                  key={summary.property}
                  className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-5 flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#e21d38]">
                        Football property
                      </p>

                      <h2 className="mt-2 text-xl font-bold">
                        {summary.property}
                      </h2>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {summary.records} records
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Markets</p>
                      <p className="mt-1 text-lg font-bold">
                        {summary.markets}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">IMG inputs</p>
                      <p className="mt-1 text-lg font-bold">
                        {summary.completedInputs}/{summary.totalInputs}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedProperty(summary.property)}
                    className="mt-6 w-full rounded-lg bg-[#10233f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1b3558]"
                  >
                    View property
                  </button>
                </article>
              ))}
            </section>

            <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
              <h2 className="font-bold">How to read the tracker</h2>

              <div className="mt-4 flex flex-wrap gap-6 text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-blue-600" />
                  SportBusiness / reported data
                </span>

                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#e21d38]" />
                  IMG commercial view
                </span>

                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  Needs review or input
                </span>
              </div>
            </section>
          </>
        )}

        {activeTab === "Rights Overview" && selectedProperty && (
          <>
            <button
              onClick={() => setSelectedProperty(null)}
              className="mb-6 text-sm font-semibold text-[#e21d38] hover:underline"
            >
              ← Back to rights overview
            </button>

            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#e21d38]">
                Property detail
              </p>

              <h1 className="mt-2 text-3xl font-bold">{selectedProperty}</h1>

              <p className="mt-2 text-slate-600">
                Market-level comparison supported by a broadcaster and deal-level
                register.
              </p>
            </div>

            <section className="mb-8 grid gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Markets</p>
                <p className="mt-2 text-2xl font-bold">
                  {marketSummaries.length}
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Deal records</p>
                <p className="mt-2 text-2xl font-bold">
                  {selectedDeals.filter((deal) => deal.recordType === "Deal")
                    .length}
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">IMG inputs</p>
                <p className="mt-2 text-2xl font-bold">
                  {
                    marketSummaries.filter(
                      (market) => market.commercialAav !== null
                    ).length
                  }
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Approved imports</p>
                <p className="mt-2 text-2xl font-bold">{approvedCount}</p>
              </div>
            </section>

            <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-bold">Market comparison</h2>
                <p className="mt-1 text-sm text-slate-500">
                  SportBusiness figures are kept separate from the IMG
                  commercial view.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b text-xs uppercase tracking-wide text-slate-500">
                      <th className="p-3">Market</th>
                      <th className="p-3">Cycle</th>
                      <th className="bg-blue-50 p-3 text-blue-900">
                        SportBusiness AAV
                      </th>
                      <th className="bg-blue-50 p-3 text-blue-900">
                        SportBusiness total
                      </th>
                      <th className="bg-red-50 p-3 text-[#a31328]">
                        IMG AAV
                      </th>
                      <th className="bg-red-50 p-3 text-[#a31328]">
                        IMG total
                      </th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {marketSummaries.map((market) => {
                      const difference =
                        market.commercialAav !== null &&
                        market.sportBusinessAav !== null
                          ? market.commercialAav - market.sportBusinessAav
                          : null;

                      return (
                        <tr
                          key={`${market.market}-${market.cycle}`}
                          className="border-b last:border-0"
                        >
                          <td className="p-3 font-semibold">
                            {market.market}
                          </td>

                          <td className="p-3 text-slate-500">
                            {market.cycle}
                          </td>

                          <td className="bg-blue-50 p-3 font-medium text-blue-950">
                            {formatValue(
                              market.sportBusinessAav,
                              market.currency
                            )}
                          </td>

                          <td className="bg-blue-50 p-3 text-blue-950">
                            {formatValue(
                              market.sportBusinessTotal,
                              market.currency
                            )}
                          </td>

                          <td className="bg-red-50 p-3 font-medium text-[#a31328]">
                            {formatValue(
                              market.commercialAav,
                              market.commercial?.currency ??
                                market.currency
                            )}
                          </td>

                          <td className="bg-red-50 p-3 text-[#a31328]">
                            {formatValue(
                              market.commercialTotal,
                              market.commercial?.currency ??
                                market.currency
                            )}
                          </td>

                          <td className="p-3">
                            {difference === null ? (
                              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                                Awaiting IMG view
                              </span>
                            ) : (
                              <span className="text-sm font-semibold text-slate-700">
                                {difference >= 0 ? "+" : ""}
                                {formatValue(difference, market.currency)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-bold">
                  Deal register and reported records
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  One row per broadcaster, package or reported market total.
                  Market totals are excluded from deal roll-ups to prevent
                  double-counting.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b text-xs uppercase tracking-wide text-slate-500">
                      <th className="p-3">Market</th>
                      <th className="p-3">Broadcaster / record</th>
                      <th className="p-3">Package</th>
                      <th className="p-3">Rights type</th>
                      <th className="p-3">AAV</th>
                      <th className="p-3">Cycle total</th>
                      <th className="p-3">Record type</th>
                      <th className="p-3">Confidence</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedDeals.map((deal) => (
                      <tr key={deal.id} className="border-b last:border-0">
                        <td className="p-3">{deal.market}</td>
                        <td className="p-3 font-semibold">
                          {deal.broadcaster}
                        </td>
                        <td className="p-3">{deal.packageName}</td>
                        <td className="p-3">{deal.rightsType}</td>
                        <td className="p-3">
                          {formatValue(deal.aav, deal.currency)}
                        </td>
                        <td className="p-3">
                          {formatValue(deal.cycleTotal, deal.currency)}
                        </td>
                        <td className="p-3">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {deal.recordType}
                          </span>
                        </td>
                        <td className="p-3">{deal.confidence}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activeTab === "SportBusiness Import" && (
          <>
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#e21d38]">
                Input workflow
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                SportBusiness Import
              </h1>

              <p className="mt-2 text-slate-600">
                Upload an export, review the proposed deal-level mapping and
                approve verified records.
              </p>
            </div>

            <section className="mb-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold">Upload export</h2>

                <p className="mt-1 text-sm text-slate-500">
                  CSV, XLSX and XLS files are supported.
                </p>

                <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-[#e21d38]">
                  <span className="text-3xl">↑</span>

                  <span className="mt-2 font-semibold">
                    Choose a SportBusiness export
                  </span>

                  <span className="mt-1 text-xs text-slate-500">
                    This prototype reads the file locally in your browser.
                  </span>

                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={loadSampleExport}
                  className="mt-4 text-sm font-semibold text-[#e21d38] hover:underline"
                >
                  Load sample export instead
                </button>

                {fileName && (
                  <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
                    Selected: <strong>{fileName}</strong>
                  </p>
                )}
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold">Review rules</h2>

                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <p>✓ One row represents a broadcaster, package or total.</p>
                  <p>✓ AAV remains separate from total cycle value.</p>
                  <p>✓ Market totals are not included in deal roll-ups.</p>
                  <p>✓ Missing values require human review.</p>
                  <p>✓ Only approved rows enter the tracker.</p>
                </div>
              </div>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Review imported rows</h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {importMessage}
                  </p>
                </div>

                <button
                  onClick={approveRows}
                  disabled={readyToApprove === 0}
                  className="rounded-lg bg-[#10233f] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Approve {readyToApprove} row
                  {readyToApprove === 1 ? "" : "s"}
                </button>
              </div>

              {importRows.length === 0 ? (
                <div className="rounded-lg bg-slate-50 p-8 text-center text-sm text-slate-500">
                  No rows to review yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b text-xs uppercase tracking-wide text-slate-500">
                        <th className="p-3">Property</th>
                        <th className="p-3">Market</th>
                        <th className="p-3">Broadcaster</th>
                        <th className="p-3">Package</th>
                        <th className="p-3">AAV</th>
                        <th className="p-3">Cycle total</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {importRows.map((row) => (
                        <tr key={row.id} className="border-b last:border-0">
                          <td className="p-3 font-semibold">
                            {row.property || "Missing"}
                          </td>
                          <td className="p-3">{row.market || "Missing"}</td>
                          <td className="p-3">
                            {row.broadcaster || "Missing"}
                          </td>
                          <td className="p-3">
                            {row.packageName || "Missing"}
                          </td>
                          <td className="p-3">
                            {row.reportedAav
                              ? formatValue(
                                  parseAmount(row.reportedAav),
                                  row.currency
                                )
                              : "Not found"}
                          </td>
                          <td className="p-3">
                            {row.cycleTotal
                              ? formatValue(
                                  parseAmount(row.cycleTotal),
                                  row.currency
                                )
                              : "Not found"}
                          </td>
                          <td className="p-3">{row.recordType}</td>
                          <td className="p-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                row.status === "Approved"
                                  ? "bg-green-100 text-green-800"
                                  : row.status === "Needs attention"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "Commercial Inputs" && (
          <>
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#e21d38]">
                Input workflow
              </p>

              <h1 className="mt-2 text-3xl font-bold">Commercial Inputs</h1>

              <p className="mt-2 text-slate-600">
                Enter the IMG commercial view separately from SportBusiness
                reported figures.
              </p>
            </div>

            <section className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5">
              <h2 className="font-bold text-[#8e1023]">
                IMG commercial view
              </h2>

              <p className="mt-1 text-sm text-[#8e1023]">
                These values are internal estimates or intelligence. They are
                not used to overwrite SportBusiness records.
              </p>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    Submit market intelligence
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Figures are held in this prototype session only.
                  </p>
                </div>

                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-[#a31328]">
                  {completedCommercialInputs}/{commercialInputs.length} complete
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b text-xs uppercase tracking-wide text-slate-500">
                      <th className="p-3">Property</th>
                      <th className="p-3">Market</th>
                      <th className="p-3">SportBusiness AAV</th>
                      <th className="bg-red-50 p-3 text-[#a31328]">
                        IMG AAV
                      </th>
                      <th className="bg-red-50 p-3 text-[#a31328]">
                        IMG cycle total
                      </th>
                      <th className="bg-red-50 p-3 text-[#a31328]">
                        Confidence
                      </th>
                      <th className="p-3">Owner / due</th>
                    </tr>
                  </thead>

                  <tbody>
                    {commercialInputs.map((input) => {
                      const benchmark = marketSummaries.find(
                        (market) =>
                          market.property === input.property &&
                          market.market === input.market &&
                          market.cycle === input.cycle
                      );

                      const fallbackBenchmark = deals.find(
                        (deal) =>
                          deal.property === input.property &&
                          deal.market === input.market &&
                          deal.cycle === input.cycle
                      );

                      const benchmarkValue =
                        benchmark?.sportBusinessAav ??
                        fallbackBenchmark?.aav ??
                        null;

                      return (
                        <tr
                          key={input.id}
                          className="border-b last:border-0"
                        >
                          <td className="p-3 font-semibold">
                            {input.property}
                          </td>

                          <td className="p-3">{input.market}</td>

                          <td className="p-3 text-blue-900">
                            {formatValue(benchmarkValue, input.currency)}
                          </td>

                          <td className="bg-red-50 p-3">
                            <input
                              value={input.aav}
                              onChange={(event) =>
                                updateCommercial(
                                  input.id,
                                  "aav",
                                  event.target.value
                                )
                              }
                              placeholder="AAV in millions"
                              className="w-36 rounded-lg border border-red-200 bg-white px-3 py-2 outline-none focus:border-[#e21d38] focus:ring-2 focus:ring-red-100"
                            />
                          </td>

                          <td className="bg-red-50 p-3">
                            <input
                              value={input.cycleTotal}
                              onChange={(event) =>
                                updateCommercial(
                                  input.id,
                                  "cycleTotal",
                                  event.target.value
                                )
                              }
                              placeholder="Cycle total"
                              className="w-36 rounded-lg border border-red-200 bg-white px-3 py-2 outline-none focus:border-[#e21d38] focus:ring-2 focus:ring-red-100"
                            />
                          </td>

                          <td className="bg-red-50 p-3">
                            <select
                              value={input.confidence}
                              onChange={(event) =>
                                updateCommercial(
                                  input.id,
                                  "confidence",
                                  event.target.value
                                )
                              }
                              className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm"
                            >
                              <option>High</option>
                              <option>Medium</option>
                              <option>Low</option>
                            </select>
                          </td>

                          <td className="p-3 text-sm text-slate-600">
                            <div>{input.owner}</div>
                            <div className="mt-1 font-medium">
                              Due {input.due}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
