// Fetch cafes from OpenStreetMap (Overpass API)
async function fetchCafes(lat, lng) {
  const query = `
    [out:json];
    node["amenity"="cafe"](around:2000, ${lat}, ${lng});
    out;
  `;
  const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);

  const response = await fetch(url);
  const data = await response.json();
  return data.elements;
}

// Render cafes into cards
function displayCafes(cafes) {
  const cards = document.querySelector(".cards");
  cards.innerHTML = "";

  if (cafes.length === 0) {
    cards.innerHTML = "<p>No cafes found nearby ☹️</p>";
    return;
  }

  cafes.forEach(cafe => {
    const name = cafe.tags.name || "Unnamed Cafe";
    const address = cafe.tags["addr:street"] || "Address not available";

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${name}</h3>
      <p>${address}</p>
      <a class="map-link" target="_blank" href="https://www.google.com/maps?q=${cafe.lat},${cafe.lon}">📍 Open in Maps</a>
      <button onclick='saveCafe(${JSON.stringify(cafe)})'>Save</button>
    `;

    cards.appendChild(card);
  });
}

// Get browser location
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const cafes = await fetchCafes(lat, lng);
        displayCafes(cafes);
      },
      error => {
        alert("Location access denied. Please enable location and try again.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// Save cafe to localStorage
function saveCafe(cafe) {
  let saved = JSON.parse(localStorage.getItem("cafes")) || [];
  if (!saved.some(c => c.id === cafe.id)) {
    saved.push(cafe);
    localStorage.setItem("cafes", JSON.stringify(saved));
    alert("Cafe saved!");
  } else {
    alert("Already saved!");
  }
}

// Show saved cafes
function showSaved() {
  let saved = JSON.parse(localStorage.getItem("cafes")) || [];
  displayCafes(saved);
}
