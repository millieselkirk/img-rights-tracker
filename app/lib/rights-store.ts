import { ALL_RIGHTS_DEALS } from "../data/rights-data";
import type { RightsDeal } from "../data/rights-data";

export type ApiRightsDeal = RightsDeal & {
  isImgOwnedProperty: boolean;
 marketStatus: "Unknown" | "Unsold";

};

export function getRightsDeals(): ApiRightsDeal[] {
  return ALL_RIGHTS_DEALS.map((deal) => ({
    ...deal,
    isImgOwnedProperty: Boolean(deal.imgProperty),
    // Do not infer Unsold from a blank value. This must be confirmed separately.
    marketStatus: "Unknown",
  }));
}

export function filterDeals(request: Request): ApiRightsDeal[] {
  const url = new URL(request.url);
  const deals = getRightsDeals();
  const property = url.searchParams.get("property");
  const market = url.searchParams.get("market");
  const cycle = url.searchParams.get("cycle");
  const broadcaster = url.searchParams.get("broadcaster");

  return deals.filter((deal) =>
    (!property || deal.property === property) &&
    (!market || deal.market === market) &&
    (!cycle || deal.cycle === cycle) &&
    (!broadcaster || deal.broadcaster === broadcaster)
  );
}

export function getAnalysis(request: Request) {
  const deals = filterDeals(request);
  const currencies = Array.from(new Set(deals.map((deal) => deal.currency)));
  const reportedTotal = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const commercialTotal = deals.reduce((sum, deal) => sum + (deal.commercialValue || 0), 0);
  const variance = commercialTotal - reportedTotal;
  const hasCommercialValues = deals.some((deal) => deal.commercialValue !== undefined);
  const missingCommercialCount = deals.filter(
    (deal) => !deal.commercialStatus || deal.commercialStatus === "Not yet provided"
  ).length;
  const verifiedDealCount = deals.filter(
    (deal) => deal.commercialStatus === "Verified by commercial"
  ).length;

  return {
    filters: Object.fromEntries(new URL(request.url).searchParams.entries()),
    generatedAt: new Date().toISOString(),
    recordCount: deals.length,
    currencies,
    warning: currencies.length > 1 ? "Multiple currencies are present; totals must not be combined without conversion." : undefined,
    reportedTotal,
    commercialTotal: hasCommercialValues ? commercialTotal : null,
    variance: hasCommercialValues ? variance : null,
    variancePercent: hasCommercialValues && reportedTotal ? (variance / reportedTotal) * 100 : null,
    verifiedDealCount,
    missingCommercialCount,
    unsoldMarketCount: deals.filter((deal) => deal.isImgOwnedProperty && deal.marketStatus === "Unsold").length,
    deals,
  };
}

export function getDataGaps(request: Request) {
  const deals = filterDeals(request);
  return deals.flatMap((deal) => {
    const gaps: string[] = [];
    if (!deal.commercialStatus || deal.commercialStatus === "Not yet provided") gaps.push("IMG Commercial input");
    if (!deal.packageDetails) gaps.push("package details");
    if (!deal.term) gaps.push("term");
    return gaps.length ? [{ id: deal.id, property: deal.property, market: deal.market, cycle: deal.cycle, broadcaster: deal.broadcaster, missingFields: gaps }] : [];
  });
}
