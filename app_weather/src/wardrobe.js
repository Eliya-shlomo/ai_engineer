const COLD_MAX = 10;
const MILD_MAX = 22;

function temperatureBand(temperature) {
  if (temperature < COLD_MAX) return "cold";
  if (temperature <= MILD_MAX) return "mild";
  return "hot";
}

const CONDITION_BUCKETS = {
  clear: "clear",
  "mostly clear": "clear",
  "partly cloudy": "cloudy",
  cloudy: "cloudy",
  foggy: "foggy",
  "light drizzle": "rainy",
  drizzle: "rainy",
  "heavy drizzle": "rainy",
  "freezing drizzle": "icy",
  "light rain": "rainy",
  rain: "rainy",
  "heavy rain": "rainy",
  "freezing rain": "icy",
  "light snow": "snowy",
  snow: "snowy",
  "heavy snow": "snowy",
  "snow grains": "snowy",
  "light showers": "rainy",
  showers: "rainy",
  "heavy showers": "rainy",
  "snow showers": "snowy",
  "heavy snow showers": "snowy",
  thunderstorm: "stormy",
};

function conditionBucket(condition) {
  return CONDITION_BUCKETS[condition] ?? "mild";
}

const TEMPERATURE_ADVICE = {
  cold: "bundle up with warm layers",
  mild: "go with light layers you can adjust",
  hot: "keep it light and breathable",
};

const CONDITION_ADVICE = {
  clear: "sunshine calls for",
  cloudy: "overcast skies pair well with",
  foggy: "low visibility means",
  rainy: "wet conditions mean you'll want",
  snowy: "snow on the ground means",
  icy: "icy conditions mean you'll want",
  stormy: "stormy weather means you'll want",
};

const CATEGORIES = ["hat", "shirt", "pants", "shoes"];

export function buildOutfitPlan({ temperature, condition, clothingPreference }) {
  const band = temperatureBand(temperature);
  const bucket = conditionBucket(condition);

  const items = CATEGORIES.map((category) => ({
    category,
    query: `${clothingPreference} ${category} ${condition} ${band}`,
  }));

  const rationale =
    `It's ${temperature}°C and ${condition} — ${TEMPERATURE_ADVICE[band]}, ` +
    `and ${CONDITION_ADVICE[bucket]} ${clothingPreference} pieces suited to ${bucket} conditions.`;

  return { items, rationale };
}
