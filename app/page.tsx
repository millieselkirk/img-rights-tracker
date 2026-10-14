"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import * as XLSX from "xlsx";

type Tab = "Rights Overview" | "SportBusiness Import" | "Commercial Inputs";
type Region = "APAC" | "EMEA" | "AMERICAS";
type Confidence = "High" | "Medium" | "Low";

type Deal = {
  id: number;
  property: string;
  market: string;
  broadcaster: string;
  packageName: string;
  packageDetails: string;
  rightsType: string;
  cycle: string;
  matchCount: number | null;
  aav: number | null;
  cycleTotal: number | null;
  currency: string;
  recordType: "Deal" | "Market total";
  includeInRollup: boolean;
  source: string;
  confidence: Confidence;
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
  due: string;
};

type CommercialDraft = Omit<
  CommercialInput,
  "id" | "region" | "owner" | "due"
>;

type ImportedRow = {
  id: number;
  property: string;
  market: string;
  broadcaster: string;
  packageName: string;
  packageDetails: string;
  rightsType: string;
  cycle: string;
  matchCount: string;
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

const regions: { id: Region; description: string }[] = [
  {
    id: "APAC",
    description: "Asia-Pacific markets",
  },
  {
    id: "EMEA",
    description: "Europe, Middle East and Africa",
  },
  {
    id: "AMERICAS",
    description: "North, Central and South America",
  },
];

const initialDeals: Deal[] = [
  {
    id: 1,
    property: "UEFA Champions League",
    market: "United Kingdom",
    broadcaster: "TNT Sports UK",
    packageName: "Exclusive live package",
    packageDetails:
      "172 live Champions League matches: all Tuesday nights, all Wednesday nights and the final. Also includes Europa League, Europa Conference League and Super Cup.",
    rightsType: "Live",
    cycle: "2024–27",
    matchCount: 172,
    aav: 369.9,
    cycleTotal: 1109.7,
    currency: "USD",
    recordType: "Deal",
    includeInRollup: true,
    source: "SportBusiness screenshot",
    confidence: "High",
  },
  {
    id: 2,
    property: "UEFA Champions League",
    market: "United Kingdom",
    broadcaster: "Amazon",
    packageName: "First-pick live package",
    packageDetails:
      "17 first-pick Champions League matches on Tuesday nights. Excludes the Champions League final.",
    rightsType: "Live",
    cycle: "2024–27",
    matchCount: 17,
    aav: 208.4,
    cycleTotal: 625.2,
    currency: "USD",
    recordType: "Deal",
    includeInRollup: true,
    source: "SportBusiness screenshot",
    confidence: "High",
  },
  {
    id: 3,
    property: "UEFA Champions League",
    market: "United Kingdom",
    broadcaster: "BBC",
    packageName: "Highlights and clips",
    packageDetails: "Highlights and clips rights. No live rights specified.",
    rightsType: "Highlights / clips",
    cycle: "2024–27",
    matchCount: null,
    aav: 7.3,
    cycleTotal: 21.9,
    currency: "USD",
    recordType: "Deal",
    includeInRollup: true,
    source: "SportBusiness screenshot",
    confidence: "High",
  },
  {
    id: 4,
    property: "UEFA Champions League",
    market: "Germany",
    broadcaster: "DAZN",
    packageName: "National live package",
    packageDetails: "Package detail to be confirmed.",
    rightsType: "Live",
    cycle: "2024–27",
    matchCount: null,
    aav: 240,
    cycleTotal: 720,
    currency: "EUR",
    recordType: "Deal",
    includeInRollup: true,
    source: "Sample data",
    confidence: "Medium",
  },
  {
    id: 5,
    property: "Premier League",
    market: "United Kingdom",
    broadcaster: "Reported market benchmark",
    packageName: "All packages",
    packageDetails: "Reported market total.",
    rightsType: "Market total",
    cycle: "2025–29",
    matchCount: null,
    aav: 1700,
    cycleTotal: 6800,
    currency: "GBP",
    recordType: "Market total",
    includeInRollup: false,
    source: "Sample data",
    confidence: "Medium",
  },
  {
    id: 6,
    property: "LaLiga",
    market: "United States",
    broadcaster: "Reported market benchmark",
    packageName: "All packages",
    packageDetails: "Reported market total.",
    rightsType: "Market total",
    cycle: "2024–27",
    matchCount: null,
    aav: 175,
    cycleTotal: 525,
    currency: "USD",
    recordType: "Market total",
    includeInRollup: false,
    source: "Sample data",
    confidence: "Medium",
  },
];

const initialCommercialInputs: CommercialInput[] = [
  {
    id: 1,
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
    owner: "Football Commercial",
    due: "18 Oct 2026",
  },
  {
    id: 2,
    region: "EMEA",
    property: "Premier League",
    market: "United Kingdom",
    cycle: "2025–29",
    aav: "",
    cycleTotal: "",
    currency: "GBP",
    confidence: "Medium",
    packageDetails: "",
    commentary: "",
    matchesSportBusiness: false,
    owner: "Football Commercial",
    due: "18 Oct 2026",
  },
  {
    id: 3,
    region: "AMERICAS",
    property: "LaLiga",
    market: "United States",
    cycle: "2024–27",
    aav: "",
    cycleTotal: "",
    currency: "USD",
    confidence: "Medium",
    packageDetails: "",
    commentary: "",
    matchesSportBusiness: false,
    owner: "Americas Commercial",
    due: "25 Oct 2026",
  },
];

const STORAGE_KEYS = {
  deals: "img-rights-tracker-deals",
  commercialInputs: "img-rights-tracker-commercial-inputs",
  importRows: "img-rights-tracker-import-rows",
  fileName: "img-rights-tracker-import-file",
  approvedCount: "img-rights-tracker-approved-count",
};

function getRegionForMarket(market: string): Region {
  const value = market.toLowerCase();

  const americas = [
    "united states",
    "usa",
    "canada",
    "mexico",
    "brazil",
    "argentina",
    "chile",
    "colombia",
  ];

  const apac = [
    "japan",
    "china",
    "australia",
    "india",
    "singapore",
    "indonesia",
    "malaysia",
    "thailand",
    "korea",
    "new zealand",
    "hong kong",
  ];

  if (americas.some((country) => value.includes(country))) {
    return "AMERICAS";
  }

  if (apac.some((country) => value.includes(country))) {
    return "APAC";
  }

  return "EMEA";
}

function createCommercialDraft(property: string): CommercialDraft {
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
  };
}

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

function parseMatchCount(value: string): number | null {
  const number = Number.parseInt(value.replace(/[^\d]/g, ""), 10);

  return Number.isNaN(number) ? null : number;
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

function getDealKey(
  deal: Pick<
    Deal,
    "property" | "market" | "broadcaster" | "packageName" | "cycle"
  >
) {
  return [
    deal.property,
    deal.market,
    deal.broadcaster,
    deal.packageName,
    deal.cycle,
  ]
    .map((value) => value.trim().toLowerCase())
    .join("|");
}

function normaliseDeal(raw: Partial<Deal>, index: number): Deal {
  return {
    id: Number(raw.id) || Date.now() + index,
    property: String(raw.property ?? ""),
    market: String(raw.market ?? ""),
    broadcaster: String(raw.broadcaster ?? ""),
    packageName: String(raw.packageName ?? ""),
    packageDetails: String(raw.packageDetails ?? ""),
    rightsType: String(raw.rightsType ?? ""),
    cycle: String(raw.cycle ?? ""),
    matchCount:
      raw.matchCount === null || raw.matchCount === undefined
        ? null
        : Number(raw.matchCount),
    aav:
      raw.aav === null || raw.aav === undefined ? null : Number(raw.aav),
    cycleTotal:
      raw.cycleTotal === null || raw.cycleTotal === undefined
        ? null
        : Number(raw.cycleTotal),
    currency: String(raw.currency ?? "EUR"),
    recordType: raw.recordType === "Market total" ? "Market total" : "Deal",
    includeInRollup: raw.includeInRollup !== false,
    source: String(raw.source ?? "Unknown source"),
    confidence:
      raw.confidence === "High" ||
      raw.confidence === "Low" ||
      raw.confidence === "Medium"
        ? raw.confidence
        : "Medium",
  };
}

function normaliseCommercialInput(
  raw: Partial<CommercialInput>,
  index: number
): CommercialInput {
  const market = String(raw.market ?? "");

  return {
    id: Number(raw.id) || Date.now() + index,
    region:
      raw.region === "APAC" ||
      raw.region === "AMERICAS" ||
      raw.region === "EMEA"
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
      raw.confidence === "Low" ||
      raw.confidence === "Medium"
        ? raw.confidence
        : "Medium",
    packageDetails: String(raw.packageDetails ?? ""),
    commentary: String(raw.commentary ?? ""),
    matchesSportBusiness: Boolean(raw.matchesSportBusiness),
    owner: String(raw.owner ?? "Commercial team"),
    due: String(raw.due ?? "Not assigned"),
  };
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("Rights Overview");

  const [selectedProperty, setSelectedProperty] = useState<string | null>(
    null
  );

  const [selectedMarketKey, setSelectedMarketKey] = useState<string | null>(
    null
  );

  const [selectedCommercialRegion, setSelectedCommercialRegion] =
    useState<Region | null>(null);

  const [selectedCommercialProperty, setSelectedCommercialProperty] =
    useState<string | null>(null);

  const [commercialDraft, setCommercialDraft] =
    useState<CommercialDraft>(createCommercialDraft(""));

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
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedDeals = localStorage.getItem(STORAGE_KEYS.deals);
      const savedInputs = localStorage.getItem(
        STORAGE_KEYS.commercialInputs
      );
      const savedRows = localStorage.getItem(STORAGE_KEYS.importRows);
      const savedFileName = localStorage.getItem(STORAGE_KEYS.fileName);
      const savedApprovedCount = localStorage.getItem(
        STORAGE_KEYS.approvedCount
      );

      if (savedDeals) {
        const parsed = JSON.parse(savedDeals) as Partial<Deal>[];
        setDeals(parsed.map(normaliseDeal));
      }

      if (savedInputs) {
        const parsed = JSON.parse(savedInputs) as Partial<CommercialInput>[];
        setCommercialInputs(parsed.map(normaliseCommercialInput));
      }

      if (savedRows) {
        setImportRows(JSON.parse(savedRows) as ImportedRow[]);
      }

      if (savedFileName) {
        setFileName(savedFileName);
      }

      if (savedApprovedCount) {
        setApprovedCount(Number(savedApprovedCount) || 0);
      }
    } catch {
      console.warn("Saved tracker data could not be loaded.");
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    localStorage.setItem(STORAGE_KEYS.deals, JSON.stringify(deals));
    localStorage.setItem(
      STORAGE_KEYS.commercialInputs,
      JSON.stringify(commercialInputs)
    );
    localStorage.setItem(STORAGE_KEYS.importRows, JSON.stringify(importRows));
    localStorage.setItem(STORAGE_KEYS.fileName, fileName);
    localStorage.setItem(
      STORAGE_KEYS.approvedCount,
      approvedCount.toString()
    );
  }, [
    isHydrated,
    deals,
    commercialInputs,
    importRows,
    fileName,
    approvedCount,
  ]);

  const propertyList = useMemo(() => {
    return Array.from(
      new Set([
        ...properties,
        ...deals.map((deal) => deal.property).filter(Boolean),
      ])
    );
  }, [deals]);

  const propertySummaries = useMemo(() => {
    return propertyList.map((property) => {
      const propertyDeals = deals.filter((deal) => deal.property === property);
      const markets = new Set(propertyDeals.map((deal) => deal.market));

      return {
        property,
        markets: markets.size,
        records: propertyDeals.length,
      };
    });
  }, [deals, propertyList]);

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
      const key = `${deal.market}::${deal.cycle}`;

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

      const dealRows = group.rows.filter((row) => row.includeInRollup);

      const dealAav = dealRows.reduce(
        (total, row) => total + (row.aav ?? 0),
        0
      );

      const dealCycleTotal = dealRows.reduce(
        (total, row) => total + (row.cycleTotal ?? 0),
        0
      );

      const commercial = commercialInputs.find(
        (input) =>
          input.property === group.property &&
          input.market.toLowerCase() === group.market.toLowerCase() &&
          input.cycle === group.cycle
      );

      return {
        ...group,
        sportBusinessAav: marketTotal?.aav ?? (dealAav || null),
        sportBusinessTotal:
          marketTotal?.cycleTotal ?? (dealCycleTotal || null),
        commercialAav: commercial
          ? commercial.matchesSportBusiness
            ? marketTotal?.aav ?? (dealAav || null)
            : parseAmount(commercial.aav)
          : null,
        commercialTotal: commercial
          ? commercial.matchesSportBusiness
            ? marketTotal?.cycleTotal ?? (dealCycleTotal || null)
            : parseAmount(commercial.cycleTotal)
          : null,
        commercial,
      };
    });
  }, [deals, commercialInputs, selectedProperty]);

  const selectedDeals = selectedProperty
    ? deals.filter((deal) => deal.property === selectedProperty)
    : [];

  const selectedMarket = marketSummaries.find(
    (market) =>
      `${market.market}::${market.cycle}` === selectedMarketKey
  );

  const breakdownDeals = selectedDeals.filter(
    (deal) =>
      deal.market === selectedMarket?.market &&
      deal.cycle === selectedMarket?.cycle &&
      deal.recordType === "Deal"
  );

  const completedCommercialInputs = commercialInputs.filter(
    (input) => input.aav.trim() || input.cycleTotal.trim() || input.matchesSportBusiness
  ).length;

  const readyToApprove = importRows.filter(
    (row) => row.status === "Ready to review"
  ).length;

  function navigate(tab: Tab) {
    setActiveTab(tab);
    setSelectedProperty(null);
    setSelectedMarketKey(null);
    setSelectedCommercialRegion(null);
    setSelectedCommercialProperty(null);
  }

  function getSportBusinessValues(
    property: string,
    market: string,
    cycle: string
  ) {
    const rows = deals.filter(
      (deal) =>
        deal.property === property &&
        deal.market.toLowerCase() === market.toLowerCase() &&
        deal.cycle === cycle
    );

    const marketTotal = rows.find(
      (row) => row.recordType === "Market total"
    );

    const dealRows = rows.filter((row) => row.includeInRollup);

    const dealAav = dealRows.reduce(
      (total, row) => total + (row.aav ?? 0),
      0
    );

    const dealCycleTotal = dealRows.reduce(
      (total, row) => total + (row.cycleTotal ?? 0),
      0
    );

    return {
      aav: marketTotal?.aav ?? (dealAav || null),
      cycleTotal: marketTotal?.cycleTotal ?? (dealCycleTotal || null),
      currency: marketTotal?.currency ?? rows[0]?.currency ?? "EUR",
    };
  }

  function updateDeal(
    id: number,
    field: "matchCount" | "packageDetails",
    value: string
  ) {
    setDeals((current) =>
      current.map((deal) => {
        if (deal.id !== id) {
          return deal;
        }

        if (field === "matchCount") {
          return {
            ...deal,
            matchCount: value === "" ? null : Number(value),
          };
        }

        return {
          ...deal,
          packageDetails: value,
        };
      })
    );
  }

  function setCommercialMatch(checked: boolean) {
    const benchmark = getSportBusinessValues(
      selectedCommercialProperty ?? "",
      commercialDraft.market,
      commercialDraft.cycle
    );

    setCommercialDraft((current) => ({
      ...current,
      matchesSportBusiness: checked,
      aav:
        checked && benchmark.aav !== null
          ? String(benchmark.aav)
          : current.aav,
      cycleTotal:
        checked && benchmark.cycleTotal !== null
          ? String(benchmark.cycleTotal)
          : current.cycleTotal,
      currency: checked ? benchmark.currency : current.currency,
    }));
  }

  function saveCommercialInput() {
    if (
      !selectedCommercialRegion ||
      !selectedCommercialProperty ||
      !commercialDraft.market.trim() ||
      !commercialDraft.cycle.trim()
    ) {
      return;
    }

    const newInput: CommercialInput = {
      id: Date.now(),
      region: selectedCommercialRegion,
      property: selectedCommercialProperty,
      market: commercialDraft.market.trim(),
      cycle: commercialDraft.cycle.trim(),
      aav: commercialDraft.aav,
      cycleTotal: commercialDraft.cycleTotal,
      currency: commercialDraft.currency,
      confidence: commercialDraft.confidence,
      packageDetails: commercialDraft.packageDetails,
      commentary: commercialDraft.commentary,
      matchesSportBusiness: commercialDraft.matchesSportBusiness,
      owner: "Commercial team",
      due: "Not assigned",
    };

    setCommercialInputs((current) => {
      const existingIndex = current.findIndex(
        (input) =>
          input.property === newInput.property &&
          input.market.toLowerCase() === newInput.market.toLowerCase() &&
          input.cycle === newInput.cycle
      );

      if (existingIndex === -1) {
        return [...current, newInput];
      }

      return current.map((input, index) =>
        index === existingIndex ? { ...newInput, id: input.id } : input
      );
    });

    setCommercialDraft(createCommercialDraft(selectedCommercialProperty));
  }

  function removeCommercialInput(id: number) {
    setCommercialInputs((current) =>
      current.filter((input) => input.id !== id)
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
        .slice(0, 500)
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

          const packageDetails = getCell(row, [
            "package details",
            "description",
            "detail",
            "notes",
          ]);

          const rightsType = getCell(row, [
            "rights type",
            "right type",
            "category",
          ]);

          const cycle = getCell(row, ["cycle", "season", "period"]);

          const matchCount = getCell(row, [
            "match count",
            "number of matches",
            "matches",
            "fixtures",
            "games",
          ]);

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
            packageDetails,
            rightsType,
            cycle,
            matchCount,
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
      packageDetails: row.packageDetails || "",
      rightsType: row.rightsType || "To confirm",
      cycle: row.cycle || "To confirm",
      matchCount: parseMatchCount(row.matchCount),
      aav: parseAmount(row.reportedAav),
      cycleTotal: parseAmount(row.cycleTotal),
      currency: row.currency || "EUR",
      recordType: row.recordType,
      includeInRollup: row.recordType === "Deal",
      source: fileName || "SportBusiness export",
      confidence: "Medium",
    }));

    setDeals((current) => {
      const importedKeys = new Set(newDeals.map(getDealKey));

      return [
        ...current.filter((deal) => !importedKeys.has(getDealKey(deal))),
        ...newDeals,
      ];
    });

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
      } approved and saved in this browser.`
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
                      <p className="text-slate-500">Deal records</p>
                      <p className="mt-1 text-lg font-bold">
                        {summary.records}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProperty(summary.property);
                      setSelectedMarketKey(null);
                    }}
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
              onClick={() => {
                setSelectedProperty(null);
                setSelectedMarketKey(null);
              }}
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
                Select a market to view its broadcaster and package breakdown.
              </p>
            </div>

            <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-bold">Market comparison</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Open a market to see the underlying broadcaster and package
                  details.
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
                      <th className="p-3">Difference</th>
                    </tr>
                  </thead>

                  <tbody>
                    {marketSummaries.map((market) => {
                      const marketKey = `${market.market}::${market.cycle}`;

                      const difference =
                        market.commercialAav !== null &&
                        market.sportBusinessAav !== null
                          ? market.commercialAav -
                            market.sportBusinessAav
                          : null;

                      return (
                        <tr
                          key={marketKey}
                          className={`border-b transition ${
                            selectedMarketKey === marketKey
                              ? "bg-blue-50"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="p-3">
                            <button
                              onClick={() => {
                                setSelectedMarketKey(marketKey);

                                setTimeout(() => {
                                  document
                                    .getElementById(
                                      "broadcaster-breakdown"
                                    )
                                    ?.scrollIntoView({
                                      behavior: "smooth",
                                      block: "start",
                                    });
                                }, 100);
                              }}
                              className="text-left"
                            >
                              <div className="font-semibold text-[#10233f]">
                                {market.market}
                              </div>

                              <div className="mt-1 text-xs font-medium text-[#e21d38]">
                                Open broadcaster breakdown →
                              </div>
                            </button>
                          </td>

                          <td className="p-3 text-slate-500">
                            {market.cycle}
                          </td>

                          <td className="bg-blue-50 p-3 font-semibold text-blue-900">
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

            <section
              id="broadcaster-breakdown"
              className="scroll-mt-6 rounded-xl bg-white p-6 shadow-sm"
            >
              {!selectedMarket ? (
                <div className="rounded-xl border-2 border-dashed border-slate-200 p-10 text-center">
                  <h2 className="text-lg font-bold">
                    Broadcaster breakdown
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Select a market above to see broadcaster, package, match
                    count and deal-value detail.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#e21d38]">
                      Deal-level detail
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      {selectedMarket.market} broadcaster breakdown
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedMarket.cycle} · Package details and match counts
                      can be edited here.
                    </p>
                  </div>

                  <div className="mb-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-blue-50 p-4">
                      <p className="text-xs font-semibold uppercase text-blue-700">
                        SportBusiness market total
                      </p>

                      <p className="mt-1 text-xl font-bold text-blue-950">
                        {formatValue(
                          selectedMarket.sportBusinessAav,
                          selectedMarket.currency
                        )}{" "}
                        AAV
                      </p>

                      <p className="mt-1 text-sm text-blue-800">
                        {formatValue(
                          selectedMarket.sportBusinessTotal,
                          selectedMarket.currency
                        )}{" "}
                        over cycle
                      </p>
                    </div>

                    <div className="rounded-lg bg-red-50 p-4">
                      <p className="text-xs font-semibold uppercase text-[#a31328]">
                        IMG commercial view
                      </p>

                      <p className="mt-1 text-xl font-bold text-[#8e1023]">
                        {formatValue(
                          selectedMarket.commercialAav,
                          selectedMarket.commercial?.currency ??
                            selectedMarket.currency
                        )}{" "}
                        AAV
                      </p>

                      <p className="mt-1 text-sm text-[#8e1023]">
                        {formatValue(
                          selectedMarket.commercialTotal,
                          selectedMarket.commercial?.currency ??
                            selectedMarket.currency
                        )}{" "}
                        over cycle
                      </p>
                    </div>
                  </div>

                  {breakdownDeals.length === 0 ? (
                    <div className="rounded-lg bg-slate-50 p-8 text-center text-sm text-slate-500">
                      No individual broadcaster deals have been recorded for
                      this market yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b text-xs uppercase tracking-wide text-slate-500">
                            <th className="p-3">Broadcaster</th>
                            <th className="p-3">Package</th>
                            <th className="p-3">Matches</th>
                            <th className="p-3">Package details</th>
                            <th className="p-3">AAV</th>
                            <th className="p-3">Cycle total</th>
                            <th className="p-3">Confidence</th>
                          </tr>
                        </thead>

                        <tbody>
                          {breakdownDeals.map((deal) => (
                            <tr
                              key={deal.id}
                              className="border-b align-top last:border-0"
                            >
                              <td className="p-3 font-semibold">
                                {deal.broadcaster}
                              </td>

                              <td className="p-3">{deal.packageName}</td>

                              <td className="p-3">
                                <input
                                  type="number"
                                  min="0"
                                  value={deal.matchCount ?? ""}
                                  onChange={(event) =>
                                    updateDeal(
                                      deal.id,
                                      "matchCount",
                                      event.target.value
                                    )
                                  }
                                  placeholder="—"
                                  className="w-24 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#e21d38] focus:ring-2 focus:ring-red-100"
                                />
                              </td>

                              <td className="min-w-72 p-3">
                                <textarea
                                  value={deal.packageDetails}
                                  onChange={(event) =>
                                    updateDeal(
                                      deal.id,
                                      "packageDetails",
                                      event.target.value
                                    )
                                  }
                                  placeholder="Add package details"
                                  rows={3}
                                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#e21d38] focus:ring-2 focus:ring-red-100"
                                />
                              </td>

                              <td className="p-3">
                                {formatValue(deal.aav, deal.currency)}
                              </td>

                              <td className="p-3">
                                {formatValue(
                                  deal.cycleTotal,
                                  deal.currency
                                )}
                              </td>

                              <td className="p-3">{deal.confidence}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
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
                Upload an export, review the proposed mapping and approve
                verified records.
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
                    The file is read locally in your browser.
                  </span>

                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

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
                  <p>✓ AAV remains separate from cycle total.</p>
                  <p>✓ Market totals are excluded from deal roll-ups.</p>
                  <p>✓ Missing values require human review.</p>
                  <p>✓ Approved rows are saved in this browser.</p>
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
            {!selectedCommercialRegion && (
              <>
                <div className="mb-8">
                  <p className="text-sm font-semibold uppercase tracking-widest text-[#e21d38]">
                    Commercial workspace
                  </p>

                  <h1 className="mt-2 text-3xl font-bold">
                    Select your region
                  </h1>

                  <p className="mt-2 text-slate-600">
                    Choose a region to see its properties and add market
                    intelligence.
                  </p>
                </div>

                <section className="grid gap-5 md:grid-cols-3">
                  {regions.map((region) => {
                    const regionInputs = commercialInputs.filter(
                      (input) => input.region === region.id
                    );

                    const completed = regionInputs.filter(
                      (input) =>
                        input.aav ||
                        input.cycleTotal ||
                        input.matchesSportBusiness
                    ).length;

                    return (
                      <button
                        key={region.id}
                        onClick={() => {
                          setSelectedCommercialRegion(region.id);
                          setSelectedCommercialProperty(null);
                        }}
                        className="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                      >
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#e21d38]">
                          Region
                        </p>

                        <h2 className="mt-2 text-2xl font-bold">
                          {region.id}
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                          {region.description}
                        </p>

                        <div className="mt-6 flex justify-between text-sm">
                          <span>
                            <strong>{regionInputs.length}</strong> views
                          </span>

                          <span>
                            <strong>{completed}</strong> complete
                          </span>
                        </div>

                        <div className="mt-6 font-semibold text-[#10233f]">
                          Open region →
                        </div>
                      </button>
                    );
                  })}
                </section>
              </>
            )}

            {selectedCommercialRegion && !selectedCommercialProperty && (
              <>
                <button
                  onClick={() => setSelectedCommercialRegion(null)}
                  className="mb-6 text-sm font-semibold text-[#e21d38]"
                >
                  ← Back to regions
                </button>

                <div className="mb-8">
                  <p className="text-sm font-semibold uppercase tracking-widest text-[#e21d38]">
                    {selectedCommercialRegion}
                  </p>

                  <h1 className="mt-2 text-3xl font-bold">
                    Select a property
                  </h1>

                  <p className="mt-2 text-slate-600">
                    Choose a property to add or review market views.
                  </p>
                </div>

                <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {propertyList.map((property) => {
                    const submissions = commercialInputs.filter(
                      (input) =>
                        input.property === property &&
                        input.region === selectedCommercialRegion
                    );

                    return (
                      <button
                        key={property}
                        onClick={() => {
                          setSelectedCommercialProperty(property);
                          setCommercialDraft(createCommercialDraft(property));
                        }}
                        className="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                      >
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#e21d38]">
                          Football property
                        </p>

                        <h2 className="mt-2 text-xl font-bold">
                          {property}
                        </h2>

                        <p className="mt-4 text-sm text-slate-500">
                          {submissions.length} saved view
                          {submissions.length === 1 ? "" : "s"}
                        </p>

                        <div className="mt-6 font-semibold text-[#10233f]">
                          Open property →
                        </div>
                      </button>
                    );
                  })}
                </section>
              </>
            )}

            {selectedCommercialRegion && selectedCommercialProperty && (
              <>
                <button
                  onClick={() => setSelectedCommercialProperty(null)}
                  className="mb-6 text-sm font-semibold text-[#e21d38]"
                >
                  ← Back to {selectedCommercialRegion} properties
                </button>

                <div className="mb-8">
                  <p className="text-sm font-semibold uppercase tracking-widest text-[#e21d38]">
                    Commercial input
                  </p>

                  <h1 className="mt-2 text-3xl font-bold">
                    {selectedCommercialProperty}
                  </h1>

                  <p className="mt-2 text-slate-600">
                    Add a market view or confirm that SportBusiness is
                    accurate.
                  </p>
                </div>

                <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold">
                    Add market intelligence
                  </h2>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <label className="text-sm font-semibold">
                      Country / market
                      <input
                        value={commercialDraft.market}
                        onChange={(event) =>
                          setCommercialDraft({
                            ...commercialDraft,
                            market: event.target.value,
                            matchesSportBusiness: false,
                          })
                        }
                        placeholder="e.g. United Kingdom"
                        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
                      />
                    </label>

                    <label className="text-sm font-semibold">
                      Rights cycle
                      <input
                        value={commercialDraft.cycle}
                        onChange={(event) =>
                          setCommercialDraft({
                            ...commercialDraft,
                            cycle: event.target.value,
                            matchesSportBusiness: false,
                          })
                        }
                        placeholder="e.g. 2024–27"
                        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
                      />
                    </label>

                    <label className="text-sm font-semibold">
                      AAV
                      <input
                        value={commercialDraft.aav}
                        disabled={commercialDraft.matchesSportBusiness}
                        onChange={(event) =>
                          setCommercialDraft({
                            ...commercialDraft,
                            aav: event.target.value,
                          })
                        }
                        placeholder="Value in millions"
                        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal disabled:bg-slate-100"
                      />
                    </label>

                    <label className="text-sm font-semibold">
                      Total over cycle
                      <input
                        value={commercialDraft.cycleTotal}
                        disabled={commercialDraft.matchesSportBusiness}
                        onChange={(event) =>
                          setCommercialDraft({
                            ...commercialDraft,
                            cycleTotal: event.target.value,
                          })
                        }
                        placeholder="Total value"
                        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal disabled:bg-slate-100"
                      />
                    </label>

                    <label className="text-sm font-semibold">
                      Currency
                      <select
                        value={commercialDraft.currency}
                        onChange={(event) =>
                          setCommercialDraft({
                            ...commercialDraft,
                            currency: event.target.value,
                          })
                        }
                        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
                      >
                        <option>EUR</option>
                        <option>GBP</option>
                        <option>USD</option>
                        <option>JPY</option>
                      </select>
                    </label>

                    <label className="text-sm font-semibold">
                      Confidence
                      <select
                        value={commercialDraft.confidence}
                        onChange={(event) =>
                          setCommercialDraft({
                            ...commercialDraft,
                            confidence: event.target.value as Confidence,
                          })
                        }
                        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
                      >
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </label>
                  </div>

                  <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    {(() => {
                      const benchmark = getSportBusinessValues(
                        selectedCommercialProperty,
                        commercialDraft.market,
                        commercialDraft.cycle
                      );

                      return (
                        <>
                          <label className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={commercialDraft.matchesSportBusiness}
                              disabled={benchmark.aav === null}
                              onChange={(event) =>
                                setCommercialMatch(event.target.checked)
                              }
                              className="mt-1 h-4 w-4"
                            />

                            <span className="text-sm">
                              <strong>
                                SportBusiness data is accurate
                              </strong>
                              <br />
                              Use the SportBusiness market total automatically
                              instead of entering a separate IMG figure.
                            </span>
                          </label>

                          {benchmark.aav !== null ? (
                            <p className="mt-3 text-sm text-blue-900">
                              Matching SportBusiness record:{" "}
                              <strong>
                                {formatValue(
                                  benchmark.aav,
                                  benchmark.currency
                                )}{" "}
                                AAV
                              </strong>{" "}
                              /{" "}
                              <strong>
                                {formatValue(
                                  benchmark.cycleTotal,
                                  benchmark.currency
                                )}{" "}
                                total
                              </strong>
                            </p>
                          ) : (
                            <p className="mt-3 text-sm text-blue-800">
                              No matching SportBusiness record found for this
                              market and cycle yet.
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <label className="mt-6 block text-sm font-semibold">
                    Package / deal details
                    <textarea
                      value={commercialDraft.packageDetails}
                      onChange={(event) =>
                        setCommercialDraft({
                          ...commercialDraft,
                          packageDetails: event.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Broadcaster, package, match count or other detail"
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
                    />
                  </label>

                  <label className="mt-6 block text-sm font-semibold">
                    Commentary / insight
                    <textarea
                      value={commercialDraft.commentary}
                      onChange={(event) =>
                        setCommercialDraft({
                          ...commercialDraft,
                          commentary: event.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Add context, rationale or market intelligence"
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
                    />
                  </label>

                  <button
                    onClick={saveCommercialInput}
                    disabled={
                      !commercialDraft.market.trim() ||
                      !commercialDraft.cycle.trim()
                    }
                    className="mt-6 rounded-lg bg-[#e21d38] px-5 py-3 font-semibold text-white disabled:opacity-40"
                  >
                    Save market view
                  </button>
                </section>

                <section className="rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold">
                    Saved commercial views
                  </h2>

                  <div className="mt-5 space-y-4">
                    {commercialInputs
                      .filter(
                        (input) =>
                          input.property === selectedCommercialProperty &&
                          input.region === selectedCommercialRegion
                      )
                      .map((input) => {
                        const benchmark = getSportBusinessValues(
                          input.property,
                          input.market,
                          input.cycle
                        );

                        const displayAav = input.matchesSportBusiness
                          ? benchmark.aav
                          : parseAmount(input.aav);

                        const displayTotal = input.matchesSportBusiness
                          ? benchmark.cycleTotal
                          : parseAmount(input.cycleTotal);

                        return (
                          <div
                            key={input.id}
                            className="rounded-xl border border-slate-200 p-5"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-bold">
                                  {input.market}
                                </h3>

                                <p className="text-sm text-slate-500">
                                  {input.cycle} · {input.confidence} confidence
                                </p>
                              </div>

                              <button
                                onClick={() =>
                                  removeCommercialInput(input.id)
                                }
                                className="text-sm font-semibold text-red-600"
                              >
                                Remove
                              </button>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-3">
                              <div>
                                <p className="text-xs uppercase text-slate-500">
                                  AAV
                                </p>

                                <p className="mt-1 font-bold">
                                  {formatValue(displayAav, input.currency)}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs uppercase text-slate-500">
                                  Cycle total
                                </p>

                                <p className="mt-1 font-bold">
                                  {formatValue(
                                    displayTotal,
                                    input.currency
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs uppercase text-slate-500">
                                  Source
                                </p>

                                <p className="mt-1 font-bold">
                                  {input.matchesSportBusiness
                                    ? "SportBusiness confirmed"
                                    : "IMG commercial view"}
                                </p>
                              </div>
                            </div>

                            {input.packageDetails && (
                              <p className="mt-4 text-sm text-slate-600">
                                <strong>Package:</strong>{" "}
                                {input.packageDetails}
                              </p>
                            )}

                            {input.commentary && (
                              <p className="mt-2 text-sm text-slate-600">
                                <strong>Insight:</strong>{" "}
                                {input.commentary}
                              </p>
                            )}
                          </div>
                        );
                      })}

                    {commercialInputs.filter(
                      (input) =>
                        input.property === selectedCommercialProperty &&
                        input.region === selectedCommercialRegion
                    ).length === 0 && (
                      <p className="rounded-lg bg-slate-50 p-6 text-sm text-slate-500">
                        No commercial views added yet.
                      </p>
                    )}
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
