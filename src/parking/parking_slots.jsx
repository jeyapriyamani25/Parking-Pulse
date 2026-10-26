import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/parking-pulse-logo.png";
import Booking from "./Booking";

export default function ParkingSlots() {
  const navigate = useNavigate();

  const [slots, setSlots] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingMessage, setBookingMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/parking_slots_list/", {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load parking slots.");
        }
        return response.json();
      })
      .then((data) => {
        setSlots(data);
        setError("");
      })
      .catch((error) => {
        console.error("Error:", error);
        setError("Could not load parking slots. Please check Django server.");
      })
      .finally(() => setLoading(false));
  }, []);

  const isAvailable = (slot) =>
    String(slot.status || "").toLowerCase() === "available";

  const filteredSlots = slots.filter((slot) => {
    if (filter === "All") return true;

    return String(slot.vehicle_type || "").toLowerCase() ===
      filter.toLowerCase();
  });

  const availableCount = slots.filter(isAvailable).length;
  const occupiedCount = slots.length - availableCount;

  return (
    <div className="dashboard">
      <header className="dashboard-nav">
        <Link to="/parking_slots" className="dashboard-brand">
          <img src={logo} alt="Parking Pulse" />
          <span>Parking <strong>Pulse</strong></span>
        </Link>

        <div className="dashboard-nav-right">
          <span className="live-indicator">Parking Overview</span>
          <Link to="/login" className="dashboard-logout">
            Log out
          </Link>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">PARK • RIDE • GO</p>
            <h1>Find your parking spot.</h1>
            <p className="dashboard-subtitle">
              A simpler way to view bike and car parking availability.
            </p>
          </div>
          <div className="welcome-icon" aria-hidden="true">
            <span className="parking-icon-letter">P</span>
            <span className="parking-icon-line"></span>
          </div>
        </section>

        <section className="parking-stats">
          <article className="stat-card">
            <div className="stat-icon total-icon" aria-hidden="true">
              <span className="parking-icon-letter">P</span>
            </div>
            <div>
              <p>Total Slots</p>
              <h2>{slots.length}</h2>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon available-icon">✓</div>
            <div>
              <p>Available Slots</p>
              <h2>{availableCount}</h2>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon occupied-icon">●</div>
            <div>
              <p>Other Slots</p>
              <h2>{occupiedCount}</h2>
            </div>
          </article>
        </section>

        <section className="parking-section">
          <div className="parking-section-heading">
            <div>
              <h2>Parking Spaces</h2>
              <p>Explore the slots currently listed in the system.</p>
            </div>

            <div className="parking-filters">
              {["All", "Bike", "Car"].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`filter-button ${
                    filter === type ? "active" : ""
                  }`}
                  onClick={() => setFilter(type)}
                >
                  {type === "All" ? "All Vehicles" : type}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <p className="dashboard-feedback">Loading parking slots...</p>
          )}

          {error && (
            <p className="dashboard-feedback error-message">{error}</p>
          )}

          {!loading && !error && filteredSlots.length === 0 && (
            <div className="empty-slots">
              <div>🅿️</div>
              <h3>No parking slots found</h3>
              <p>There are no slots matching this filter yet.</p>
            </div>
          )}

          {!loading && !error && filteredSlots.length > 0 && (
            <div className="parking-grid">
              {filteredSlots.map((slot) => {
                const available = isAvailable(slot);

                return (
                  <article className="parking-card" key={slot.id}>
                    <div className="parking-card-top">
                      <span className="slot-label">PARKING SLOT</span>
                      <span
                        className={`slot-status ${
                          available ? "status-available" : "status-other"
                        }`}
                      >
                        {slot.status || "Unknown"}
                      </span>
                    </div>

                    <div className="slot-number">
                     <span className="slot-pin" aria-hidden="true">
                      {String(slot.vehicle_type || "").toLowerCase().includes("bike")
                      ? "🏍️"
                      : "🚗"}
                      </span>
                      <h3>{slot.slot_number}</h3>
                    </div>

                    <div className="slot-divider" />

                    <div className="slot-details">
                      <span>Vehicle type</span>
                      <strong>{slot.vehicle_type || "Not specified"}</strong>
                    </div>

                    <div className="slot-details">
                      <span>Availability</span>
                      <strong className={available ? "available-text" : ""}>
                        {available ? "Ready to park" : "Check status"}
                      </strong>
                    </div>
                    {available && (
                    <button 
                    type="button" 
                    className="book-now-button" 
                    onClick={() =>
                      navigate("/booking",{state:{slot} })} >
                    Book Now
                    <span aria-hidden="true"> →</span>
                  </button>
                  )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
        {selectedSlot && (
          <Booking
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}/>
        )}

        <footer className="dashboard-footer">
          <span>Parking Pulse</span>
          <span>Park • Ride • Go</span>
        </footer>

      
      </main>
    </div>
  );
}
