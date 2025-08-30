// Fetch cafes from OpenStreetMap (Overpass API)
async function fetchCafes(lat, lng) {
  const query = `
    [out:json];
    node["amenity"="cafe"](around:2000, ${lat}, ${lng});
    out;
  `;
  const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.elements;
  } catch (error) {
    console.error("Could not fetch cafes:", error);
    alert("Sorry, there was an issue fetching the cafes. Please try again later.");
    return [];
  }
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

    const card = document.createElement("a");
    card.className = "card";
    card.target = "_blank";
    // Construct a valid Google Maps URL with latitude and longitude
    card.href = `https://www.google.com/maps/search/?api=1&query=${cafe.lat},${cafe.lon}`;

    card.innerHTML = `
      <h3>${name}</h3>
      <p>${address}</p>
      <button onclick='saveCafe(event, ${JSON.stringify(cafe)})'>Save</button>
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
        console.error("Geolocation error:", error);
        let message;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Please enable location services in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information is currently unavailable.";
            break;
          case error.TIMEOUT:
            message = "The request to get user location timed out.";
            break;
          default:
            message = "An unknown error occurred while trying to get your location.";
            break;
        }
        alert(message);
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// Save cafe to localStorage
function saveCafe(event, cafe) {
  // Prevent the click on the button from triggering the parent card's link
  event.stopPropagation();
  
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
