
import { useEffect, useState } from "react";

const API = "http://localhost:8000/api";

export default function OwnerDashboard() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [slotNumber, setSlotNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("Car");

  async function loadSlots() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API}/owner/slots/`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || "Unable to load slots.");
      }

      setSlots(data);
    } catch (error) {
      setMessage(error.message || "Unable to connect to Django.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSlots();
  }, []);

  async function addSlot(event) {
    event.preventDefault();
    setMessage("");

    try {
      const csrfResponse = await fetch(`${API}/csrf/`, {
        credentials: "include",
      });
      const csrfData = await csrfResponse.json();

      if (!csrfData.csrfToken) {
        throw new Error("CSRF token not received. Please log in again.");
      }

      const response = await fetch(`${API}/owner/slots/create/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": decodeURIComponent(csrfData.csrfToken),
        },
        body: JSON.stringify({
          slot_number: slotNumber,
          vehicle_type: vehicleType,
          status: "Available",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || data.error ||
          JSON.stringify(data) || "Could not add slot."
        );
      }

      setSlotNumber("");
      setMessage("Parking slot added successfully.");
      await loadSlots();
    } catch (error) {
      setMessage(error.message || "Could not add slot.");
    }
  }

  async function deleteSlot(slotId) {
    if (!window.confirm("Are you sure you want to delete this slot?")) {
      return;
    }

    setMessage("");

    try {
      const csrfResponse = await fetch(`${API}/csrf/`, {
        credentials: "include",
      });
      const csrfData = await csrfResponse.json();

      const response = await fetch(`${API}/owner/slots/${slotId}/delete/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-CSRFToken": decodeURIComponent(csrfData.csrfToken),
        },
      });

      if (!response.ok) {
        let data = {};
        try {
          data = await response.json();
        } catch {
          // The response may not contain JSON.
        }
        throw new Error(data.detail || data.error || "Could not delete slot.");
      }

      setMessage("Parking slot deleted successfully.");
      await loadSlots();
    } catch (error) {
      setMessage(error.message || "Could not delete slot.");
    }
  }

  function logout() {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("isAdmin");
    window.location.href = "/login";
  }

  return (
    <main style={{
      maxWidth: "1100px",
      margin: "40px auto",
      padding: "24px",
      fontFamily: "Arial, sans-serif",
      color: "#172b4d"
    }}>
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap"
      }}>
        <div>
          <p style={{ color: "#0d9488", fontWeight: 700 }}>
            PARKING PULSE • MANAGEMENT
          </p>
          <h1>Owner Dashboard</h1>
          <p>Manage parking slots and check their availability.</p>
        </div>

        <button onClick={logout} style={buttonStyle}>
          Log out
        </button>
      </header>

      <section style={{
        background: "#f1f5f9",
        padding: "22px",
        borderRadius: "12px",
        marginTop: "24px"
      }}>
        <h2>Add Parking Slot</h2>

        <form onSubmit={addSlot} style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginTop: "16px"
        }}>
          <input
            value={slotNumber}
            onChange={(event) => setSlotNumber(event.target.value)}
            placeholder="Slot number (e.g. A101)"
            required
            style={inputStyle}
          />

          <select
            value={vehicleType}
            onChange={(event) => setVehicleType(event.target.value)}
            style={inputStyle}
          >
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
          </select>

          <button type="submit" style={buttonStyle}>
            + Add Slot
          </button>
        </form>
      </section>

      {message && (
        <p role="status" style={{ marginTop: "20px" }}>
          {message}
        </p>
      )}

      <section style={{ marginTop: "30px" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px"
        }}>
          <h2>Parking Slots ({slots.length})</h2>
          <button onClick={loadSlots} style={buttonStyle}>
            Refresh
          </button>
        </div>

        {loading && <p>Loading slots...</p>}

        {!loading && slots.length === 0 && (
          <p>No slots found yet. Add your first slot above.</p>
        )}

        {!loading && slots.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "16px"
            }}>
              <thead>
                <tr style={{ background: "#e2e8f0", textAlign: "left" }}>
                  <th style={cellStyle}>Slot</th>
                  <th style={cellStyle}>Vehicle</th>
                  <th style={cellStyle}>Status</th>
                  <th style={cellStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr key={slot.id}>
                    <td style={cellStyle}>{slot.slot_number}</td>
                    <td style={cellStyle}>{slot.vehicle_type}</td>
                    <td style={cellStyle}>{slot.status}</td>
                    <td style={cellStyle}>
                      <button
                        onClick={() => deleteSlot(slot.id)}
                        style={{
                          ...buttonStyle,
                          background: "#b91c1c"
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

const buttonStyle = {
  background: "#0f766e",
  color: "#ffffff",
  border: "none",
  padding: "11px 16px",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: 600
};

const inputStyle = {
  padding: "11px",
  border: "1px solid #cbd5e1",
  borderRadius: "7px",
  minWidth: "170px"
};

const cellStyle = {
  padding: "13px",
  borderBottom: "1px solid #e2e8f0"
};
