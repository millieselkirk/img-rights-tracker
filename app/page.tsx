"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

type Tab =
  | "Rights Overview"
  | "SportBusiness Import"
  | "Commercial Inputs";

type Region = "EMEA" | "APAC" | "AMERICAS";
type Confidence = "High" | "Medium" | "Low";
type Status= "Not started" | "In progress" | "Complete";

type Deal = {
  id: number;
  property: string;
  market: string;
  region: Region;
  broadcaster: string;
  package: string;
  cycle: string;
  value: number;
  currency: string;
  source: string;
};

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
  contributors: string[];
  due: string;
  status: Status;
  lastUpdated?: string;
  completedAt?: string;
  lastReminderSent?: string;
  reminderCount: number;
};

type CommercialDraft = Omit<
  CommercialInput,
  | "id"
  | "region"
  | "status"
  | "lastUpdated"
  | "completedAt"
  | "lastReminderSent"
  | "reminderCount"
>;

type ImportedRow = {
  property: string;
  market: string;
  broadcaster: string;
  package: string;
  cycle: string;
  value: number;
  currency: string;
  source: string;
};

const STORAGE_KEYS = {
  deals: "img-rights-tracker-deals",
  commercialInputs: "img-rights-tracker-commercial-inputs",
  importRows: "img-rights-tracker-import-rows",
  importFile: "img-rights-tracker-import-file",
  approvedCount: "img-rights-tracker-approved-count",
};

const initialDeals: Deal[] = [
  {
    id: 1,
    property: "UEFA Champions League",
    market: "United Kingdom",
    region: "EMEA",
    broadcaster: "TNT Sports UK",
    package: "Live rights",
    cycle: "2024–27",
    value: 305000000,
    currency: "GBP",
    source: "SportBusiness",
  },
  {
    id: 2,
    property: "UEFA Champions League",
    market: "United Kingdom",
    region: "EMEA",
    broadcaster: "Amazon",
    package: "Selected live matches",
    cycle: "2024–27",
    value: 100000000,
    currency: "GBP",
    source: "SportBusiness",
  },
  {
    id: 3,
    property: "UEFA Champions League",
    market: "United Kingdom",
    region: "EMEA",
    broadcaster: "BBC",
    package: "Highlights",
    cycle: "2024–27",
    value: 6000000,
    currency: "GBP",
    source: "SportBusiness",
  },
  {
    id: 4,
    property: "UEFA Champions League",
    market: "Germany",
    region: "EMEA",
    broadcaster: "DAZN",
    package: "Live rights",
    cycle: "2024–27",
    value: 150000000,
    currency: "EUR",
    source: "SportBusiness",
  },
  {
    id: 5,
    property: "Premier League",
    market: "United Kingdom",
    region: "EMEA",
    broadcaster: "Market total",
    package: "All rights",
    cycle: "2025–29",
    value: 6700000000,
    currency: "GBP",
    source: "SportBusiness",
  },
  {
    id: 6,
    property: "LaLiga",
    market: "United States",
    region: "AMERICAS",
    broadcaster: "Market total",
    package: "All rights",
    cycle: "2024–27",
    value: 175000000,
    currency: "USD",
    source: "SportBusiness",
  },
];

const initialCommercialInputs: CommercialInput[] = [
  {
    id: 101,
    region: "EMEA",
    property: "UEFA Champions League",
    market: "United Kingdom",
    cycle: "2024–27",
    aav: "411000000",
    cycleTotal: "1233000000",
    currency: "GBP",
    confidence: "High",
    packageDetails: "TNT Sports, Amazon and BBC packages",
    commentary: "",
    matchesSportBusiness: true,
    owner: "Alberto Horta",
    ownerEmail: "alberto.horta@img.com",
    contributors: [],
    due: "2026-11-10",
    status: "In progress",
    reminderCount: 0,
  },
  {
    id: 102,
    region: "EMEA",
    property: "UEFA Champions League",
    market: "Germany",
    cycle: "2024–27",
    aav: "50000000",
    cycleTotal: "150000000",
    currency: "EUR",
    confidence: "Medium",
    packageDetails: "DAZN live rights",
    commentary: "",
    matchesSportBusiness: true,
    owner: "Alberto Horta",
    ownerEmail: "alberto.horta@img.com",
    contributors: [],
    due: "2026-11-10",
    status: "In progress",
    reminderCount: 0,
  },
  {
    id: 103,
    region: "EMEA",
    property: "UEFA Champions League",
    market: "Spain",
    cycle: "2024–27",
    aav: "",
    cycleTotal: "",
    currency: "EUR",
    confidence: "Medium",
    packageDetails: "",
    commentary: "Demo contributor record for Jordi Hernandez.",
    matchesSportBusiness: false,
    owner: "Jordi Hernandez",
    ownerEmail: "jordi.hernandez@img.com",
    contributors: [],
    due: "2026-11-17",
    status: "Not started",
    reminderCount: 0,
  },
  {
    id: 104,
    region: "EMEA",
    property: "UEFA Champions League",
    market: "Portugal",
    cycle: "2024–27",
    aav: "",
    cycleTotal: "",
    currency: "EUR",
    confidence: "Medium",
    packageDetails: "",
    commentary: "Demo contributor record for Jordi Hernandez.",
    matchesSportBusiness: false,
    owner: "Jordi Hernandez",
    ownerEmail: "jordi.hernandez@img.com",
    contributors: [],
    due: "2026-11-17",
    status: "Not started",
    reminderCount: 0,
  },
  {
    id: 105,
    region: "EMEA",
    property: "Premier League",
    market: "United Kingdom",
    cycle: "2025–29",
    aav: "1675000000",
    cycleTotal: "6700000000",
    currency: "GBP",
    confidence: "High",
    packageDetails: "Domestic live rights",
    commentary: "",
    matchesSportBusiness: true,
    owner: "Alberto Horta",
    ownerEmail: "alberto.horta@img.com",
    contributors: [],
    due: "2026-11-17",
    status: "In progress",
    reminderCount: 0,
  },
  {
    id: 106,
    region: "AMERICAS",
    property: "LaLiga",
    market: "United States",
    cycle: "2024–27",
    aav: "58333333",
    cycleTotal: "175000000",
    currency: "USD",
    confidence: "Medium",
    packageDetails: "US market total",
    commentary: "",
    matchesSportBusiness: true,
    owner: "Hillary Mandel",
    ownerEmail: "hillary.mandel@img.com",
    contributors: [],
    due: "2026-11-17",
    status: "In progress",
    reminderCount: 0,
  },
];

function getRegionForMarket(market: string): Region {
  const value = market.toLowerCase();

  if (
    [
      "australia",
      "china",
      "india",
      "indonesia",
      "japan",
      "singapore",
      "south korea",
    ].some((item) => value.includes(item))
  ) {
    return "APAC";
  }

  if (
    [
      "united states",
      "usa",
      "canada",
      "mexico",
      "brazil",
      "argentina",
    ].some((item) => value.includes(item))
  ) {
    return "AMERICAS";
  }

  return "EMEA";
}

function getDefaultOwner(market: string) {
  const value = market.toLowerCase();

  if (
    value.includes("spain") ||
    value.includes("portugal")
  ) {
    return {
      owner: "Jordi Hernandez",
      ownerEmail: "jordi.hernandez@img.com",
      contributors: [],
    };
  }

  if (
    value.includes("united states") ||
    value.includes("usa") ||
    value.includes("canada") ||
    value.includes("mexico")
  ) {
    return {
      owner: "Hillary Mandel",
      ownerEmail: "hillary.mandel@img.com",
      contributors: [],
    };
  }

  if (
    value.includes("australia") ||
    value.includes("china") ||
    value.includes("india") ||
    value.includes("indonesia") ||
    value.includes("japan") ||
    value.includes("singapore") ||
    value.includes("south korea")
  ) {
    return {
      owner: "Dale Levin",
      ownerEmail: "dale.levin@img.com",
      contributors: [],
    };
  }

  return {
    owner: "Alberto Horta",
    ownerEmail: "alberto.horta@img.com",
    contributors: [],
  };
}

function createCommercialDraft(property: string): CommercialDraft {
  const owner = getDefaultOwner("");

  return {
    property,
    market: "",
    cycle: "2024–27",
    aav: "",
    cycleTotal: "",
    currency: "EUR",
    confidence: "Medium",
    packageDetails: "",
    commentary: "",
    matchesSportBusiness: false,
    owner: owner.owner,
    ownerEmail: owner.ownerEmail,
    contributors: [],
    due: "2026-11-10",
  };
}

function normaliseCommercialInput(
  raw: Partial<CommercialInput>,
  index: number
): CommercialInput {
  const market = String(raw.market ?? "");
  const fallbackOwner = getDefaultOwner(market);

  const hasData = Boolean(
    String(raw.aav ?? "").trim() ||
      String(raw.cycleTotal ?? "").trim() ||
      raw.matchesSportBusiness
  );

  const oldOwner =
    !raw.owner ||
    raw.owner === "Football Commercial" ||
    raw.owner === "EMEA Commercial" ||
    raw.owner === "APAC Commercial" ||
    raw.owner === "Americas Commercial";

  return {
    id: Number(raw.id) || Date.now() + index,
    region:
      raw.region === "EMEA" ||
      raw.region === "APAC" ||
      raw.region === "AMERICAS"
        ? raw.region
        : getRegionForMarket(market),
    property: String(raw.property ?? ""),
    market,
    cycle: String(raw.cycle ?? "2024–27"),
    aav: String(raw.aav ?? ""),
    cycleTotal: String(raw.cycleTotal ?? ""),
    currency: String(raw.currency ?? "EUR"),
    confidence:
      raw.confidence === "High" ||
      raw.confidence === "Medium" ||
      raw.confidence === "Low"
        ? raw.confidence
        : "Medium",
    packageDetails: String(raw.packageDetails ?? ""),
    commentary: String(raw.commentary ?? ""),
    matchesSportBusiness: Boolean(raw.matchesSportBusiness),
    owner: oldOwner
      ? fallbackOwner.owner
      : String(raw.owner),
    ownerEmail: oldOwner
      ? fallbackOwner.ownerEmail
      : String(raw.ownerEmail ?? ""),
    contributors: Array.isArray(raw.contributors)
      ? raw.contributors.map(String)
      : [],
    due: String(raw.due ?? "2026-11-10"),
    status:
      raw.status === "Not started" ||
      raw.status === "In progress" ||
      raw.status === "Complete"
        ? raw.status
        : hasData
          ? "In progress"
          : "Not started",
    lastUpdated: raw.lastUpdated,
    completedAt: raw.completedAt,
    lastReminderSent: raw.lastReminderSent,
    reminderCount: Number(raw.reminderCount ?? 0),
  };
}

function parseNumber(value: unknown) {
  const cleaned = String(value ?? "")
    .replace(/[£€$,\s]/g, "")
    .replace(/[^\d.-]/g, "");

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString()}`;
  }
}

function findColumn(
  row: Record<string, unknown>,
  names: string[]
) {
  const entries = Object.entries(row);

  for (const name of names) {
    const exact = entries.find(
      ([key]) =>
        key.toLowerCase().trim() === name.toLowerCase()
    );

    if (exact) return exact[1];
  }

  for (const name of names) {
    const partial = entries.find(([key]) =>
      key.toLowerCase().includes(name.toLowerCase())
    );

    if (partial) return partial[1];
  }

  return "";
}

function mapImportedRow(
  row: Record<string, unknown>
): ImportedRow {
  return {
    property: String(
      findColumn(row, [
        "property",
        "competition",
        "league",
      ]) || "UEFA Champions League"
    ),
    market: String(
      findColumn(row, [
        "market",
        "territory",
        "country",
        "region",
      ])
    ),
    broadcaster: String(
      findColumn(row, [
        "broadcaster",
        "rightsholder",
        "rights holder",
        "licensee",
      ]) || "Market total"
    ),
    package: String(
      findColumn(row, [
        "package",
        "package details",
        "rights package",
      ]) || "Live rights"
    ),
    cycle: String(
      findColumn(row, [
        "cycle",
        "term",
        "contract cycle",
        "season",
      ]) || "2024–27"
    ),
    value: parseNumber(
      findColumn(row, [
        "value",
        "aav",
        "annual value",
        "rights value",
        "amount",
      ])
    ),
    currency: String(
      findColumn(row, ["currency", "ccy"]) || "EUR"
    ).toUpperCase(),
    source: "SportBusiness",
  };
}

function StatusBadge({ status }: { status: Status }) {
  const style =
    status === "Complete"
      ? "bg-green-100 text-green-800"
      : status === "In progress"
        ? "bg-blue-100 text-blue-800"
        : "bg-amber-100 text-amber-800";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
}

export default function Page() {
  const [activeTab, setActiveTab] =
    useState<Tab>("Rights Overview");

  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [commercialInputs, setCommercialInputs] =
    useState<CommercialInput[]>(initialCommercialInputs);

  const [importedRows, setImportedRows] = useState<ImportedRow[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [approvedCount, setApprovedCount] = useState(0);
  const [uploadError, setUploadError] = useState("");

  const [selectedProperty, setSelectedProperty] =
    useState("UEFA Champions League");
  const [marketFilter, setMarketFilter] =
    useState("All markets");
  const [broadcasterFilter, setBroadcasterFilter] =
    useState("All broadcasters");

  const [commercialRegion, setCommercialRegion] =
    useState<Region>("EMEA");
  const [commercialProperty, setCommercialProperty] =
    useState("UEFA Champions League");

  const [draft, setDraft] = useState<CommercialDraft>(
    createCommercialDraft("UEFA Champions League")
  );

  useEffect(() => {
    try {
      const savedDeals = localStorage.getItem(STORAGE_KEYS.deals);
      const savedInputs = localStorage.getItem(
        STORAGE_KEYS.commercialInputs
      );
      const savedRows = localStorage.getItem(
        STORAGE_KEYS.importRows
      );
      const savedFile = localStorage.getItem(
        STORAGE_KEYS.importFile
      );
      const savedApproved = localStorage.getItem(
        STORAGE_KEYS.approvedCount
      );

      if (savedDeals) {
        const parsed = JSON.parse(savedDeals);
        if (Array.isArray(parsed)) setDeals(parsed);
      }

      if (savedInputs) {
        const parsed = JSON.parse(savedInputs);

        if (Array.isArray(parsed)) {
          setCommercialInputs(
            parsed.map((item, index) =>
              normaliseCommercialInput(item, index)
            )
          );
        }
      }

      if (savedRows) {
        const parsed = JSON.parse(savedRows);
        if (Array.isArray(parsed)) setImportedRows(parsed);
      }

      if (savedFile) setImportFileName(savedFile);

      if (savedApproved) {
        setApprovedCount(Number(savedApproved) || 0);
      }
    } catch {
      // Ignore invalid legacy localStorage values.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.deals, JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.commercialInputs,
      JSON.stringify(commercialInputs)
    );
  }, [commercialInputs]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.importRows,
      JSON.stringify(importedRows)
    );
  }, [importedRows]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.importFile, importFileName);
  }, [importFileName]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.approvedCount,
      String(approvedCount)
    );
  }, [approvedCount]);

  const properties = useMemo(
    () =>
      Array.from(
        new Set([
          ...deals.map((deal) => deal.property),
          ...commercialInputs.map((input) => input.property),
        ])
      ).sort(),
    [deals, commercialInputs]
  );

  const propertyDeals = deals.filter(
    (deal) => deal.property === selectedProperty
  );

  const selectedDeals = propertyDeals.filter((deal) => {
    const marketMatches =
      marketFilter === "All markets" ||
      deal.market === marketFilter;

    const broadcasterMatches =
      broadcasterFilter === "All broadcasters" ||
      deal.broadcaster === broadcasterFilter;

    return marketMatches && broadcasterMatches;
  });

  const markets = Array.from(
    new Set(propertyDeals.map((deal) => deal.market))
  );

  const broadcasters = Array.from(
    new Set(propertyDeals.map((deal) => deal.broadcaster))
  );

  const regionInputs = commercialInputs.filter(
    (input) => input.region === commercialRegion
  );

  function updateDraft(
    field: keyof CommercialDraft,
    value: string | boolean | string[]
  ) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function changeRegion(region: Region) {
    setCommercialRegion(region);

    const existing = commercialInputs.find(
      (input) => input.region === region
    );

    const property =
      existing?.property ||
      properties[0] ||
      "UEFA Champions League";

    setCommercialProperty(property);
    setDraft(createCommercialDraft(property));
  }

  function changeProperty(property: string) {
    setCommercialProperty(property);
    setDraft(createCommercialDraft(property));
  }

  function saveCommercialInput() {
    if (!draft.market.trim() || !draft.cycle.trim()) {
      return;
    }

    const now = new Date().toISOString();

    const input: CommercialInput = {
      id: Date.now(),
      region: commercialRegion,
      property: commercialProperty,
      market: draft.market.trim(),
      cycle: draft.cycle.trim(),
      aav: draft.aav,
      cycleTotal: draft.cycleTotal,
      currency: draft.currency,
      confidence: draft.confidence,
      packageDetails: draft.packageDetails,
      commentary: draft.commentary,
      matchesSportBusiness: draft.matchesSportBusiness,
      owner: draft.owner.trim() || "Alberto Horta",
      ownerEmail: draft.ownerEmail.trim(),
      contributors: draft.contributors,
      due: draft.due,
      status:
        draft.aav.trim() ||
        draft.cycleTotal.trim() ||
        draft.matchesSportBusiness
          ? "In progress"
          : "Not started",
      lastUpdated: now,
      reminderCount: 0,
    };

    setCommercialInputs((current) => {
      const existingIndex = current.findIndex(
        (item) =>
          item.property === input.property &&
          item.market.toLowerCase() ===
            input.market.toLowerCase() &&
          item.cycle === input.cycle
      );

      if (existingIndex === -1) {
        return [...current, input];
      }

      return current.map((item, index) =>
        index === existingIndex
          ? {
              ...input,
              id: item.id,
              status: item.status,
              completedAt: item.completedAt,
              reminderCount: item.reminderCount,
            }
          : item
      );
    });

    setDraft(createCommercialDraft(commercialProperty));
  }

  function markComplete(id: number) {
    const now = new Date().toISOString();

    setCommercialInputs((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Complete",
              completedAt: now,
              lastUpdated: now,
            }
          : item
      )
    );
  }

  function reopenInput(id: number) {
    setCommercialInputs((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "In progress",
              completedAt: undefined,
              lastUpdated: new Date().toISOString(),
            }
          : item
      )
    );
  }

  function removeInput(id: number) {
    setCommercialInputs((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  async function handleImport(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setImportFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: true,
      });

      const sheetName = workbook.SheetNames[0];
      if (!sheetName) throw new Error("No worksheet found.");

      const rows = XLSX.utils.sheet_to_json<
        Record<string, unknown>
      >(workbook.Sheets[sheetName], {
        defval: "",
      });

      const mapped = rows
        .map(mapImportedRow)
        .filter(
          (row) =>
            row.property ||
            row.market ||
            row.broadcaster
        );

      if (!mapped.length) {
        throw new Error(
          "The file did not contain recognisable rights data."
        );
      }

      setImportedRows(mapped);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "The file could not be imported."
      );
    }
  }

  function approveRows() {
    if (!importedRows.length) return;

    const newDeals: Deal[] = importedRows.map((row, index) => ({
      id: Date.now() + index,
      property: row.property,
      market: row.market,
      region: getRegionForMarket(row.market),
      broadcaster: row.broadcaster,
      package: row.package,
      cycle: row.cycle,
      value: row.value,
      currency: row.currency,
      source: row.source,
    }));

    setDeals((current) => [...current, ...newDeals]);

    setCommercialInputs((current) => {
      const additions = importedRows
        .filter(
          (row) =>
            !current.some(
              (input) =>
                input.property.toLowerCase() ===
                  row.property.toLowerCase() &&
                input.market.toLowerCase() ===
                  row.market.toLowerCase() &&
                input.cycle.toLowerCase() ===
                  row.cycle.toLowerCase()
            )
        )
        .map((row, index) => {
          const owner = getDefaultOwner(row.market);

          return {
            id: Date.now() + 10000 + index,
            region: getRegionForMarket(row.market),
            property: row.property,
            market: row.market,
            cycle: row.cycle,
            aav: "",
            cycleTotal: "",
            currency: row.currency,
            confidence: "Medium" as Confidence,
            packageDetails: row.package,
            commentary:
              "Created from approved SportBusiness import.",
            matchesSportBusiness: false,
            owner: owner.owner,
            ownerEmail: owner.ownerEmail,
            contributors: [],
            due: "2026-11-10",
            status: "Not started" as Status,
            lastUpdated: new Date().toISOString(),
            reminderCount: 0,
          };
        });

      return [...current, ...additions];
    });

    setApprovedCount((count) => count + importedRows.length);
    setImportedRows([]);
    setActiveTab("Commercial Inputs");
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-[#111827] text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-5">
          <img
            src="/img-logo-white.png"
            alt="IMG"
            className="h-9 w-auto"
          />

          <div className="border-l border-white/30 pl-4">
            <p className="text-xs uppercase tracking-[0.25em] text-white/60">
              Football
            </p>
            <h1 className="text-xl font-semibold">
              Rights Tracker — Admin
            </h1>
          </div>
        </div>
      </header>

      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl gap-2 px-6">
          {(
            [
              "Rights Overview",
              "SportBusiness Import",
              "Commercial Inputs",
            ] as Tab[]
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-4 py-4 text-sm font-semibold ${
                activeTab === tab
                  ? "border-[#e31837] text-[#e31837]"
                  : "border-transparent text-slate-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {activeTab === "Rights Overview" && (
          <section className="space-y-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#e31837]">
                Rights Overview
              </p>
              <h2 className="mt-1 text-3xl font-bold">
                Football rights market view
              </h2>
              <p className="mt-2 text-slate-500">
                Review current SportBusiness deal data by property,
                market and broadcaster.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={selectedProperty}
                onChange={(event) => {
                  setSelectedProperty(event.target.value);
                  setMarketFilter("All markets");
                  setBroadcasterFilter("All broadcasters");
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold"
              >
                {properties.map((property) => (
                  <option key={property}>{property}</option>
                ))}
              </select>

              <select
                value={marketFilter}
                onChange={(event) =>
                  setMarketFilter(event.target.value)
                }
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
              >
                <option>All markets</option>
                {markets.map((market) => (
                  <option key={market}>{market}</option>
                ))}
              </select>

              <select
                value={broadcasterFilter}
                onChange={(event) =>
                  setBroadcasterFilter(event.target.value)
                }
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
              >
                <option>All broadcasters</option>
                {broadcasters.map((broadcaster) => (
                  <option key={broadcaster}>{broadcaster}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl bg-[#111827] p-5 text-white">
                <p className="text-sm text-white/60">
                  Selected property
                </p>
                <p className="mt-3 text-xl font-bold">
                  {selectedProperty}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Deal records
                </p>
                <p className="mt-3 text-3xl font-bold">
                  {propertyDeals.length}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Markets covered
                </p>
                <p className="mt-3 text-3xl font-bold">
                  {markets.length}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Displayed records
                </p>
                <p className="mt-3 text-3xl font-bold">
                  {selectedDeals.length}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="border-b border-slate-200 p-6">
                <h3 className="text-lg font-bold">
                  SportBusiness deal records
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Property</th>
                      <th className="px-6 py-4">Market</th>
                      <th className="px-6 py-4">Broadcaster</th>
                      <th className="px-6 py-4">Package</th>
                      <th className="px-6 py-4">Cycle</th>
                      <th className="px-6 py-4">Value</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {selectedDeals.map((deal) => (
                      <tr key={deal.id}>
                        <td className="px-6 py-4 font-semibold">
                          {deal.property}
                        </td>
                        <td className="px-6 py-4">
                          {deal.market}
                        </td>
                        <td className="px-6 py-4">
                          {deal.broadcaster}
                        </td>
                        <td className="px-6 py-4">
                          {deal.package}
                        </td>
                        <td className="px-6 py-4">
                          {deal.cycle}
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          {formatCurrency(
                            deal.value,
                            deal.currency
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {activeTab === "SportBusiness Import" && (
          <section className="space-y-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#e31837]">
                SportBusiness Import — Admin
              </p>
              <h2 className="mt-1 text-3xl font-bold">
                Import and approve rights data
              </h2>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <label className="inline-flex cursor-pointer rounded-lg bg-[#e31837] px-5 py-3 text-sm font-semibold text-white">
                Choose CSV, XLSX or XLS file
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>

              {importFileName && (
                <p className="mt-4 text-sm text-slate-600">
                  Selected file:{" "}
                  <strong>{importFileName}</strong>
                </p>
              )}

              {uploadError && (
                <p className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                  {uploadError}
                </p>
              )}
            </div>

            {importedRows.length > 0 && (
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 p-6">
                  <div>
                    <h3 className="text-lg font-bold">
                      Import review
                    </h3>
                    <p className="text-sm text-slate-500">
                      {importedRows.length} rows ready for approval.
                    </p>
                  </div>

                  <button
                    onClick={approveRows}
                    className="rounded-lg bg-[#e31837] px-5 py-3 text-sm font-semibold text-white"
                  >
                    Approve rows
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-6 py-4">Property</th>
                        <th className="px-6 py-4">Market</th>
                        <th className="px-6 py-4">Broadcaster</th>
                        <th className="px-6 py-4">Package</th>
                        <th className="px-6 py-4">Cycle</th>
                        <th className="px-6 py-4">Value</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {importedRows.map((row, index) => (
                        <tr key={`${row.market}-${index}`}>
                          <td className="px-6 py-4 font-semibold">
                            {row.property}
                          </td>
                          <td className="px-6 py-4">
                            {row.market}
                          </td>
                          <td className="px-6 py-4">
                            {row.broadcaster}
                          </td>
                          <td className="px-6 py-4">
                            {row.package}
                          </td>
                          <td className="px-6 py-4">
                            {row.cycle}
                          </td>
                          <td className="px-6 py-4 font-semibold">
                            {formatCurrency(
                              row.value,
                              row.currency
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "Commercial Inputs" && (
          <section className="space-y-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#e31837]">
                Commercial Inputs — Admin
              </p>
              <h2 className="mt-1 text-3xl font-bold">
                Manage commercial inputs
              </h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold">
                  Add or edit input
                </h3>

                <div className="mt-6 space-y-4">
                  <label className="block text-sm font-semibold">
                    Region
                    <select
                      value={commercialRegion}
                      onChange={(event) =>
                        changeRegion(
                          event.target.value as Region
                        )
                      }
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal"
                    >
                      <option>EMEA</option>
                      <option>APAC</option>
                      <option>AMERICAS</option>
                    </select>
                  </label>

                  <label className="block text-sm font-semibold">
                    Property
                    <select
                      value={commercialProperty}
                      onChange={(event) =>
                        changeProperty(event.target.value)
                      }
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal"
                    >
                      {properties.map((property) => (
                        <option key={property}>{property}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-semibold">
                    Market
                    <input
                      value={draft.market}
                      onChange={(event) =>
                        updateDraft("market", event.target.value)
                      }
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-semibold">
                      Cycle
                      <input
                        value={draft.cycle}
                        onChange={(event) =>
                          updateDraft("cycle", event.target.value)
                        }
                        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
                      />
                    </label>

                    <label className="block text-sm font-semibold">
                      Currency
                      <select
                        value={draft.currency}
                        onChange={(event) =>
                          updateDraft(
                            "currency",
                            event.target.value
                          )
                        }
                        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal"
                      >
                        <option>EUR</option>
                        <option>GBP</option>
                        <option>USD</option>
                        <option>CHF</option>
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-semibold">
                      AAV
                      <input
                        value={draft.aav}
                        onChange={(event) =>
                          updateDraft("aav", event.target.value)
                        }
                        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
                      />
                    </label>

                    <label className="block text-sm font-semibold">
                      Cycle total
                      <input
                        value={draft.cycleTotal}
                        onChange={(event) =>
                          updateDraft(
                            "cycleTotal",
                            event.target.value
                          )
                        }
                        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
                      />
                    </label>
                  </div>

                  <label className="block text-sm font-semibold">
                    Owner
                    <input
                      value={draft.owner}
                      onChange={(event) =>
                        updateDraft("owner", event.target.value)
                      }
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
                    />
                  </label>

                  <label className="block text-sm font-semibold">
                    Owner email
                    <input
                      type="email"
                      value={draft.ownerEmail}
                      onChange={(event) =>
                        updateDraft(
                          "ownerEmail",
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
                    />
                  </label>

                  <label className="block text-sm font-semibold">
                    Contributors
                    <input
                      value={draft.contributors.join(", ")}
                      onChange={(event) =>
                        updateDraft(
                          "contributors",
                          event.target.value
                            .split(",")
                            .map((value) => value.trim())
                            .filter(Boolean)
                        )
                      }
                      placeholder="Separate names with commas"
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
                    />
                  </label>

                  <label className="block text-sm font-semibold">
                    Due date
                    <input
                      type="date"
                      value={draft.due}
                      onChange={(event) =>
                        updateDraft("due", event.target.value)
                      }
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
                    />
                  </label>

                  <label className="block text-sm font-semibold">
                    Package details
                    <textarea
                      value={draft.packageDetails}
                      onChange={(event) =>
                        updateDraft(
                          "packageDetails",
                          event.target.value
                        )
                      }
                      rows={3}
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
                    />
                  </label>

                  <label className="block text-sm font-semibold">
                    Commentary
                    <textarea
                      value={draft.commentary}
                      onChange={(event) =>
                        updateDraft(
                          "commentary",
                          event.target.value
                        )
                      }
                      rows={3}
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
                    />
                  </label>

                  <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={draft.matchesSportBusiness}
                      onChange={(event) =>
                        updateDraft(
                          "matchesSportBusiness",
                          event.target.checked
                        )
                      }
                    />
                    SportBusiness data is accurate
                  </label>

                  <button
                    onClick={saveCommercialInput}
                    disabled={
                      !draft.market.trim() ||
                      !draft.cycle.trim()
                    }
                    className="w-full rounded-lg bg-[#e31837] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    Save input
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">
                    Saved commercial inputs
                  </h3>

                  <select
                    value={commercialRegion}
                    onChange={(event) =>
                      changeRegion(
                        event.target.value as Region
                      )
                    }
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option>EMEA</option>
                    <option>APAC</option>
                    <option>AMERICAS</option>
                  </select>
                </div>

                {regionInputs.map((input) => (
                  <div
                    key={input.id}
                    className="rounded-2xl bg-white p-6 shadow-sm"
                  >
                    <div className="flex justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-lg font-bold">
                            {input.property}
                          </h4>
                          <StatusBadge status={input.status} />
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {input.market} · {input.cycle}
                        </p>
                      </div>

                      <button
                        onClick={() => removeInput(input.id)}
                        className="text-sm font-semibold text-red-600"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs uppercase text-slate-500">
                          Owner
                        </p>
                        <p className="mt-1 font-bold">
                          {input.owner}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {input.ownerEmail}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs uppercase text-slate-500">
                          Due
                        </p>
                        <p className="mt-1 font-bold">
                          {input.due || "Not assigned"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs uppercase text-slate-500">
                          AAV
                        </p>
                        <p className="mt-1 font-bold">
                          {input.aav
                            ? formatCurrency(
                                parseNumber(input.aav),
                                input.currency
                              )
                            : "Not provided"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs uppercase text-slate-500">
                          Cycle total
                        </p>
                        <p className="mt-1 font-bold">
                          {input.cycleTotal
                            ? formatCurrency(
                                parseNumber(input.cycleTotal),
                                input.currency
                              )
                            : "Not provided"}
                        </p>
                      </div>
                    </div>

                    {input.commentary && (
                      <p className="mt-4 text-sm text-slate-700">
                        <strong>Commentary:</strong>{" "}
                        {input.commentary}
                      </p>
                    )}

                    <div className="mt-5 flex justify-between border-t border-slate-100 pt-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          input.matchesSportBusiness
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {input.matchesSportBusiness
                          ? "SportBusiness matched"
                          : "Not matched"}
                      </span>

                      {input.status === "Complete" ? (
                        <button
                          onClick={() => reopenInput(input.id)}
                          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold"
                        >
                          Reopen
                        </button>
                      ) : (
                        <button
                          onClick={() => markComplete(input.id)}
                          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white"
                        >
                          Mark complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
