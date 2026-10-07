import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [mood, setMood] = useState("");
  const [entries, setEntries] = useState([]);

  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  /*
    Load saved mood entries when the app first starts.

    Input:
    localStorage "moodEntries"

    Output:
    Saved mood entries are loaded into entries state

    Edge cases:
    Nothing is saved yet -> entries stays []
  */
  useEffect(() => {
    const savedEntries = localStorage.getItem("moodEntries");

    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  /*
    Get the current weather for the city entered by the user.

    Input:
    city: string
    apiKey: OpenWeather API key

    Output:
    Weather data is stored in weather state
    Displays city, temperature, weather description, and humidity

    Edge cases:
    Empty city -> alert user and stop
    Invalid city -> alert "City not found" and stop
  */
  async function getWeather() {
    if (city === "") {
      alert("Please enter a city.");
      return;
    }

    const locationResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
    );

    const locationData = await locationResponse.json();

    console.log("Location data:", locationData);

    if (locationData.length === 0) {
      alert("City not found.");
      return;
    }

    const latitude = locationData[0].lat;
    const longitude = locationData[0].lon;

    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${apiKey}`
    );

    const weatherData = await weatherResponse.json();

    console.log("Weather data:", weatherData);

    setWeather(weatherData);
  }

  /*
    Save the user's mood together with the current weather.

    Input:
    mood: string
    weather: current weather data
    entries: previous saved mood entries

    Output:
    Creates a new mood entry
    Adds the entry to entries state
    Saves all entries to localStorage
    Clears the mood input

    Edge cases:
    Empty mood -> alert user and stop
    No weather loaded -> alert user and stop
  */
  function saveMood() {
    if (mood === "") {
      alert("Please enter your mood.");
      return;
    }

    if (weather === null) {
      alert("Search for weather first.");
      return;
    }

    const entry = {
      date: new Date().toLocaleDateString(),
      city: weather.name,
      temperature: weather.main.temp,
      weather: weather.weather[0].description,
      mood: mood,
    };

    const newEntries = [...entries, entry];

    console.log("Mood entry:", entry);

    setEntries(newEntries);

    localStorage.setItem(
      "moodEntries",
      JSON.stringify(newEntries)
    );

    setMood("");
  }

  return (
    <div>
      <h1>Weather Mood App</h1>

      <input
        type="text"
        placeholder="Enter a city"
        value={city}
        onChange={(event) => setCity(event.target.value)}
      />

      <button onClick={getWeather}>
        Get Weather
      </button>

      {weather && (
        <div className="weather-card">
          <h2>{weather.name}</h2>
          <p>Temperature: {weather.main.temp}°F</p>
          <p>Weather: {weather.weather[0].description}</p>
          <p>Humidity: {weather.main.humidity}%</p>
        </div>
      )}

      <input
        type="text"
        placeholder="How are you feeling today?"
        value={mood}
        onChange={(event) => setMood(event.target.value)}
      />

      <button onClick={saveMood}>
        Save Mood
      </button>

      <h2>Mood History</h2>

      {entries.map((entry, index) => (
        <div className="mood-card" key={index}>
          <p>Date: {entry.date}</p>
          <p>City: {entry.city}</p>
          <p>Temperature: {entry.temperature}°F</p>
          <p>Weather: {entry.weather}</p>
          <p>Mood: {entry.mood}</p>
        </div>
      ))}
    </div>
  );
}

export default App;