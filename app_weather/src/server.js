import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getWeather } from "./weather.js";
import { buildOutfitPlan } from "./wardrobe.js";
import { getOutfitImages } from "./images.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.post("/api/suggestions", async (req, res) => {
  const { city, clothingPreference } = req.body;

  if (!city || !clothingPreference) {
    return res.status(400).json({ error: "city and clothingPreference are required" });
  }

  try {
    const weather = await getWeather(city);
    const { items, rationale } = buildOutfitPlan({
      temperature: weather.temperature,
      condition: weather.condition,
      clothingPreference,
    });
    const images = await getOutfitImages(items);

    res.json({
      location: weather.location,
      weather: {
        temperature: weather.temperature,
        unit: weather.unit,
        condition: weather.condition,
      },
      rationale,
      images,
    });
  } catch (err) {
    const notFound = err.message.includes("not found");
    res.status(notFound ? 404 : 502).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Weather Wardrobe running on http://localhost:${PORT}`);
});
