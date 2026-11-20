// Photo diagnosis for 초록방.
// The app sends one plant photo; this function asks Pl@ntNet which species it is and
// Kindwise Plant.id how healthy it looks, and returns one small answer.
// The two API keys live here as function secrets (PLANTNET_API_KEY, KINDWISE_API_KEY),
// so they never reach the app. Without them the function says so instead of guessing.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ALLOWED_ORIGINS = [
  "https://oiui030.github.io",
  "http://localhost:5173",
  "http://localhost:4173",
  "capacitor://localhost",
];
const MAX_BASE64 = 2_800_000; // about 2 MB of image
const PER_MINUTE = 8;
const TIMEOUT_MS = 20_000;

const hits = new Map<string, number[]>();

function cors(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
}

function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > PER_MINUTE;
}

function toBytes(base64: string) {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function identify(key: string, bytes: Uint8Array, mime: string) {
  const form = new FormData();
  form.append("images", new Blob([bytes], { type: mime }), "plant.jpg");
  form.append("organs", "auto");
  const url = `https://my-api.plantnet.org/v2/identify/all?nb-results=3&lang=ko&api-key=${encodeURIComponent(key)}`;
  const res = await fetch(url, { method: "POST", body: form, signal: AbortSignal.timeout(TIMEOUT_MS) });
  // Pl@ntNet answers 404 when it finds no plant it can name.
  if (res.status === 404) return { found: false };
  if (!res.ok) throw new Error(`plantnet ${res.status}`);
  const data = await res.json();
  const top = data.results?.[0];
  if (!top) return { found: false };
  return {
    found: true,
    score: top.score,
    scientific: top.species?.scientificNameWithoutAuthor ?? "",
    genus: top.species?.genus?.scientificNameWithoutAuthor ?? "",
    family: top.species?.family?.scientificNameWithoutAuthor ?? "",
    common: top.species?.commonNames?.[0] ?? "",
  };
}

async function assess(key: string, base64: string) {
  const url = "https://api.plant.id/v3/health_assessment?language=ko&details=local_name,description,treatment";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Api-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ images: [base64], similar_images: false }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`kindwise ${res.status}`);
  const data = await res.json();
  const result = data.result ?? {};
  const issues = (result.disease?.suggestions ?? []).slice(0, 3).map((s: Record<string, any>) => ({
    name: s.name ?? "",
    localName: s.details?.local_name ?? "",
    probability: s.probability ?? 0,
  }));
  return {
    isPlant: result.is_plant?.binary ?? true,
    healthy: result.is_healthy?.binary ?? null,
    healthyProbability: result.is_healthy?.probability ?? null,
    issues,
  };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const headers = cors(origin);
  const plantnetKey = Deno.env.get("PLANTNET_API_KEY") ?? "";
  const kindwiseKey = Deno.env.get("KINDWISE_API_KEY") ?? "";

  if (req.method === "OPTIONS") return new Response("ok", { headers });

  // Lets the app (and us) see whether diagnosis is switched on, without sending a photo.
  if (req.method === "GET") {
    return json({ ok: true, species: Boolean(plantnetKey), health: Boolean(kindwiseKey) }, 200, headers);
  }

  if (req.method !== "POST") return json({ error: "method" }, 405, headers);
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return json({ error: "origin" }, 403, headers);
  if (!plantnetKey && !kindwiseKey) return json({ error: "not_configured" }, 503, headers);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (tooMany(ip)) return json({ error: "rate_limited" }, 429, headers);

  let body: { image?: string; mime?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_request" }, 400, headers);
  }
  const image = (body.image ?? "").replace(/^data:[^,]+,/, "");
  const mime = body.mime === "image/png" ? "image/png" : "image/jpeg";
  if (!image) return json({ error: "bad_request" }, 400, headers);
  if (image.length > MAX_BASE64) return json({ error: "too_large" }, 413, headers);

  let bytes: Uint8Array;
  try {
    bytes = toBytes(image);
  } catch {
    return json({ error: "bad_request" }, 400, headers);
  }

  const [species, health] = await Promise.allSettled([
    plantnetKey ? identify(plantnetKey, bytes, mime) : Promise.resolve(null),
    kindwiseKey ? assess(kindwiseKey, image) : Promise.resolve(null),
  ]);
  if (species.status === "rejected") console.error("species", String(species.reason));
  if (health.status === "rejected") console.error("health", String(health.reason));

  return json({
    species: species.status === "fulfilled" ? species.value : null,
    health: health.status === "fulfilled" ? health.value : null,
    failed: {
      species: species.status === "rejected",
      health: health.status === "rejected",
    },
  }, 200, headers);
});
