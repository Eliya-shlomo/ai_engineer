const form = document.getElementById("suggestion-form");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const weatherSummaryEl = document.getElementById("weather-summary");
const rationaleEl = document.getElementById("rationale");
const imageGridEl = document.getElementById("image-grid");

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = document.getElementById("city").value.trim();
  const clothingPreference = document.getElementById("clothingPreference").value.trim();

  statusEl.textContent = "Loading...";
  resultsEl.hidden = true;

  try {
    const res = await fetch("/api/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, clothingPreference }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    statusEl.textContent = "";
    weatherSummaryEl.textContent = `${data.location}: ${data.weather.temperature}°${data.weather.unit}, ${data.weather.condition}`;
    rationaleEl.textContent = data.rationale;

    imageGridEl.innerHTML = "";
    for (const image of data.images) {
      const figure = document.createElement("figure");

      const link = document.createElement("a");
      link.href = image.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      const img = document.createElement("img");
      img.src = image.url;
      img.alt = image.alt;
      link.appendChild(img);

      const caption = document.createElement("figcaption");
      caption.textContent = `${capitalize(image.category)} — Photo by ${image.credit}`;

      figure.appendChild(link);
      figure.appendChild(caption);
      imageGridEl.appendChild(figure);
    }

    resultsEl.hidden = false;
  } catch (err) {
    statusEl.textContent = err.message;
  }
});
