import { getAnalysis, getDataGaps } from "../../../lib/rights-store";


function authorised(request: Request) {
  const configuredToken = process.env.RIGHTS_API_TOKEN;
  if (!configuredToken) return true; // Useful for the first local/demo deployment.
  return request.headers.get("authorization") === `Bearer ${configuredToken}`;
}

export async function GET(request: Request) {
  if (!authorised(request)) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }

  const analysis = getAnalysis(request);
  const gaps = getDataGaps(request);

  return Response.json(
    { ...analysis, dataGaps: gaps },
    { headers: { "Cache-Control": "no-store" } }
  );
}
