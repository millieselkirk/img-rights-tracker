"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "next/navigation";

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
  contributors: string[];
  due: string;
  status: Status;
  lastUpdated?: string;
  completedAt?: string;
  lastReminderSent?: string;
  reminderCount: number;
};

type Deal = {
  property: string;
  market: string;
  broadcaster: string;
  package: string;
  cycle: string;
  value: number;
  currency: string;
};

type ContributorProfile = {
  name: string;
  email: string;
  region: Region;
  description: string;
  markets: string[];
};

const STORAGE_KEY =
  "img-rights-tracker-commercial-inputs";

const PROFILES: Record<string, ContributorProfile> = {
  "alberto-horta": {
    name: "Alberto Horta",
    email: "alberto.horta@img.com",
    region: "EMEA",
    description: "EMEA regional commercial input view",
    markets: [
      "United Kingdom",
      "Germany",
      "Spain",
      "Portugal",
      "France",
      "Italy",
      "Netherlands",
      "Belgium",
      "Austria",
      "Switzerland",
      "Other EMEA market",
    ],
  },

  "jordi-hernandez": {
    name: "Jordi Hernandez",
    email: "jordi.hernandez@img.com",
    region: "EMEA",
    description: "Spain and Portugal commercial input view",
    markets: ["Spain", "Portugal"],
  },
};

const PROPERTIES = [
  "UEFA Champions League",
  "Premier League",
  "LaLiga",
];

const SPORTBUSINESS_DEALS: Deal[] = [
  {
    property: "UEFA Champions League",
    market: "United Kingdom",
    broadcaster: "TNT Sports UK",
    package: "Live rights",
    cycle: "2024–27",
    value: 305000000,
    currency: "GBP",
  },
  {
    property: "UEFA Champions League",
    market: "United Kingdom",
    broadcaster: "Amazon",
    package: "Selected live matches",
    cycle: "2024–27",
    value: 100000000,
    currency: "GBP",
  },
  {
    property: "UEFA Champions League",
    market: "United Kingdom",
    broadcaster: "BBC",
    package: "Highlights",
    cycle: "2024–27",
    value: 6000000,
    currency: "GBP",
  },
  {
    property: "UEFA Champions League",
    market: "Germany",
    broadcaster: "DAZN",
    package: "Live rights",
    cycle: "2024–27",
    value: 150000000,
    currency: "EUR",
  },
  {
    property: "Premier League",
    market: "United Kingdom",
    broadcaster: "Market total",
    package: "All rights",
    cycle: "2025–29",
    value: 6700000000,
    currency: "GBP",
  },
  {
    property: "LaLiga",
    market: "United States",
    broadcaster: "Market total",
    package: "All rights",
    cycle: "2024–27",
    value: 175000000,
    currency: "USD",
  },
];

function formatCurrency(
  value: number,
  currency: string
) {
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

function getCycleLength(cycle: string) {
  const match = cycle.match(/(\d{4}).*?(\d{2,4})/);

  if (!match) {
    return 1;
  }

  const startYear = Number(match[1]);

  let endYear = Number(match[2]);

  if (endYear < 100) {
    endYear += 2000;
  }

  return Math.max(1, endYear - startYear);
}

function ContributorPageContent() {
  const params = useParams<{ person: string }>();
  const profile = PROFILES[String(params.person)];

  const [inputs, setInputs] = useState<CommercialInput[]>(
    []
  );

  const [property, setProperty] = useState(
    "UEFA Champions League"
  );

  const [market, setMarket] = useState("");
  const [cycle, setCycle] = useState("2024–27");
  const [currency, setCurrency] = useState("EUR");
  const [aav, setAav] = useState("");
  const [cycleTotal, setCycleTotal] = useState("");
  const [confidence, setConfidence] =
    useState<Confidence>("Medium");
  const [packageDetails, setPackageDetails] =
    useState("");
  const [commentary, setCommentary] = useState("");
  const [matchesSportBusiness, setMatchesSportBusiness] =
    useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!profile) return;

    setMarket(profile.markets[0]);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setInputs(parsed);
        }
      }
    } catch {
      // Ignore invalid localStorage values.
    }
  }, [profile]);

  const sportBusinessRecords = useMemo(() => {
    return SPORTBUSINESS_DEALS.filter(
      (deal) =>
        deal.property === property &&
        deal.market === market
    );
  }, [property, market]);

  const profileInputs = useMemo(() => {
    if (!profile) return [];

    return inputs.filter(
      (input) =>
        input.ownerEmail === profile.email ||
        profile.markets.includes(input.market)
    );
  }, [inputs, profile]);

  function clearSportBusinessSelection() {
    setMatchesSportBusiness(false);
    setAav("");
    setCycleTotal("");
  }

  function handleSportBusinessChange(
    checked: boolean
  ) {
    setMatchesSportBusiness(checked);

    if (
      checked &&
      sportBusinessRecords.length > 0
    ) {
      const totalValue =
        sportBusinessRecords.reduce(
          (sum, deal) => sum + deal.value,
          0
        );

      const referenceCycle =
        sportBusinessRecords[0].cycle;

      const cycleLength =
        getCycleLength(referenceCycle);

      const annualAverageValue =
        totalValue / cycleLength;

      setAav(
        String(Math.round(annualAverageValue))
      );

      setCycleTotal(
        String(Math.round(totalValue))
      );

      setCurrency(
        sportBusinessRecords[0].currency
      );

      setCycle(referenceCycle);
    }

    if (!checked) {
      setAav("");
      setCycleTotal("");
    }
  }

  function submitContribution(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!profile || !market || !cycle) {
      return;
    }

    const now = new Date().toISOString();

    const newInput: CommercialInput = {
      id: Date.now(),
      region: profile.region,
      property,
      market,
      cycle,
      aav,
      cycleTotal,
      currency,
      confidence,
      packageDetails,
      commentary,
      matchesSportBusiness,
      owner: profile.name,
      ownerEmail: profile.email,
      contributors: [],
      due: "",
      status: "In progress",
      lastUpdated: now,
      reminderCount: 0,
    };

    const existingIndex = inputs.findIndex(
      (input) =>
        input.property === property &&
        input.market === market &&
        input.cycle === cycle
    );

    const nextInputs =
      existingIndex === -1
        ? [...inputs, newInput]
        : inputs.map((input, index) =>
            index === existingIndex
              ? {
                  ...newInput,
                  id: input.id,
                  status: input.status,
                  completedAt: input.completedAt,
                  reminderCount: input.reminderCount,
                }
              : input
          );

    setInputs(nextInputs);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextInputs)
    );

    setMessage(
      `Contribution saved for ${market}.`
    );

    setAav("");
    setCycleTotal("");
    setPackageDetails("");
    setCommentary("");
    setMatchesSportBusiness(false);
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">
            Contributor link not found
          </h1>

          <p className="mt-3 text-slate-500">
            This contributor profile does not exist.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-[#111827] text-white">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <img
            src="/img-logo-white.png"
            alt="IMG"
            className="h-9 w-auto"
          />

          <p className="mt-6 text-sm uppercase tracking-wider text-white/60">
            Football Rights Tracker
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Commercial input
          </h1>

          <p className="mt-2 text-white/70">
            {profile.name} · {profile.description}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
          <form
            onSubmit={submitContribution}
            className="rounded-2xl bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-bold">
              Add your market contribution
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Review the SportBusiness data before
              submitting your commercial input.
            </p>

            <div className="mt-6 space-y-5">
              <label className="block text-sm font-semibold">
                Property

                <select
                  value={property}
                  onChange={(event) => {
                    setProperty(event.target.value);
                    clearSportBusinessSelection();
                  }}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal"
                >
                  {PROPERTIES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold">
                Market

                <select
                  value={market}
                  onChange={(event) => {
                    setMarket(event.target.value);
                    clearSportBusinessSelection();
                  }}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal"
                >
                  {profile.markets.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  SportBusiness reference data
                </p>

                <p className="mt-2 text-sm text-blue-900">
                  Review the reference data below before
                  entering your commercial input.
                </p>

                {sportBusinessRecords.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {sportBusinessRecords.map((deal) => (
                      <div
                        key={`${deal.broadcaster}-${deal.package}`}
                        className="rounded-lg border border-blue-100 bg-white p-3"
                      >
                        <div className="flex justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {deal.broadcaster}
                            </p>

                            <p className="text-xs text-slate-500">
                              {deal.package} · {deal.cycle}
                            </p>
                          </div>

                          <p className="text-right text-sm font-bold text-slate-900">
                            {formatCurrency(
                              deal.value,
                              deal.currency
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 rounded-lg bg-white p-3 text-sm text-slate-600">
                    No SportBusiness record is currently
                    available for this market. Please enter
                    your own commercial view.
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold">
                  Rights cycle

                  <input
                    value={cycle}
                    onChange={(event) =>
                      setCycle(event.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
                  />
                </label>

                <label className="block text-sm font-semibold">
                  Currency

                  <select
                    value={currency}
                    onChange={(event) =>
                      setCurrency(event.target.value)
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
                  Annual average value

                  <input
                    value={aav}
                    onChange={(event) =>
                      setAav(event.target.value)
                    }
                    placeholder="Optional"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
                  />
                </label>

                <label className="block text-sm font-semibold">
                  Total cycle value

                  <input
                    value={cycleTotal}
                    onChange={(event) =>
                      setCycleTotal(event.target.value)
                    }
                    placeholder="Optional"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold">
                Confidence

                <select
                  value={confidence}
                  onChange={(event) =>
                    setConfidence(
                      event.target.value as Confidence
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>

              <label className="block text-sm font-semibold">
                Package or rights details

                <textarea
                  value={packageDetails}
                  onChange={(event) =>
                    setPackageDetails(event.target.value)
                  }
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
                />
              </label>

              <label className="block text-sm font-semibold">
                Additional commentary

                <textarea
                  value={commentary}
                  onChange={(event) =>
                    setCommentary(event.target.value)
                  }
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
                />
              </label>

              {sportBusinessRecords.length > 0 && (
                <label className="rounded-xl bg-slate-50 p-4 text-sm">
                  <span className="flex items-center gap-3 font-semibold">
                    <input
                      type="checkbox"
                      checked={matchesSportBusiness}
                      onChange={(event) =>
                        handleSportBusinessChange(
                          event.target.checked
                        )
                      }
                    />

                    SportBusiness data is correct
                  </span>

                  <span className="mt-2 block pl-7 text-xs font-normal text-slate-500">
                    Selecting this will automatically
                    populate the AAV and total cycle value
                    above. Leave this unchecked and enter
                    your own figures if your view differs
                    from the SportBusiness data.
                  </span>
                </label>
              )}

              {sportBusinessRecords.length === 0 && (
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  No SportBusiness record is available for
                  this market. Please enter your own
                  commercial view.
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-[#e31837] px-5 py-3 text-sm font-semibold text-white hover:bg-[#c91531]"
              >
                Submit contribution
              </button>

              {message && (
                <p className="rounded-lg bg-green-50 p-4 text-sm font-semibold text-green-800">
                  {message}
                </p>
              )}
            </div>
          </form>

          <aside className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">
              Your responsibility
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              You can submit information for:
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {profile.markets.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 border-t border-slate-200 pt-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Existing submissions
              </p>

              <p className="mt-2 text-3xl font-bold">
                {profileInputs.length}
              </p>

              <p className="text-sm text-slate-500">
                saved contribution
                {profileInputs.length === 1 ? "" : "s"}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function ContributorPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-100">
          <p className="text-slate-600">
            Loading contributor view...
          </p>
        </main>
      }
    >
      <ContributorPageContent />
    </Suspense>
  );
}
