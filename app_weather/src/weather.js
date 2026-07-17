const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

// WMO weather codes -> short condition label
const WEATHER_CODE_CONDITIONS = {
  0: "clear",
  1: "mostly clear",
  2: "partly cloudy",
  3: "cloudy",
  45: "foggy",
  48: "foggy",
  51: "light drizzle",
  53: "drizzle",
  55: "heavy drizzle",
  56: "freezing drizzle",
  57: "freezing drizzle",
  61: "light rain",
  63: "rain",
  65: "heavy rain",
  66: "freezing rain",
  67: "freezing rain",
  71: "light snow",
  73: "snow",
  75: "heavy snow",
  77: "snow grains",
  80: "light showers",
  81: "showers",
  82: "heavy showers",
  85: "snow showers",
  86: "heavy snow showers",
  95: "thunderstorm",
  96: "thunderstorm",
  99: "thunderstorm",
};

function conditionForCode(code) {
  return WEATHER_CODE_CONDITIONS[code] ?? "unknown";
}

export async function getWeather(city) {
  const geoRes = await fetch(
    `${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1`
  );
  if (!geoRes.ok) {
    throw new Error("Failed to look up city");
  }
  const geoData = await geoRes.json();
  const place = geoData.results?.[0];
  if (!place) {
    throw new Error(`City "${city}" not found`);
  }

  const forecastRes = await fetch(
    `${FORECAST_URL}?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code`
  );
  if (!forecastRes.ok) {
    throw new Error("Failed to fetch weather");
  }
  const forecastData = await forecastRes.json();
  const current = forecastData.current;

  const location = [place.name, place.admin1, place.country]
    .filter(Boolean)
    .join(", ");

  return {
    location,
    temperature: current.temperature_2m,
    unit: "C",
    condition: conditionForCode(current.weather_code),
  };
}
