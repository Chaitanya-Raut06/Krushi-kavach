import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Map click handler
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    password: "",
    role: "farmer",
    language: "en",
    district: "",
    taluka: "",
    qualification: "",
    experience: "",
    longitude: "",
    latitude: "",
  });

  const [mobileError, setMobileError] = useState(""); // 🔥 live warning
  const [idProof, setIdProof] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const mapClickRef = useRef(false);

  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;

  // ----------------------- VALIDATE MOBILE -----------------------
  const validateMobile = (value) => {
    const cleaned = value.replace(/\D/g, ""); // only digits
    if (!cleaned) return "Mobile number is required";
    if (cleaned.length !== 10) return "Mobile number must be exactly 10 digits";
    if (!/^[6-9]\d{9}$/.test(cleaned))
      return "Must start with 6, 7, 8, or 9 and be 10 digits";
    return ""; // valid
  };

  const handleMobileChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    setFormData({ ...formData, mobileNumber: digitsOnly });

    const msg = validateMobile(digitsOnly);
    setMobileError(msg);
  };

  // ----------------------- REVERSE GEOCODING -----------------------
  const reverseGeocode = async (lat, lng) => {
    try {
      setLocationLoading(true);
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.address) {
        const district =
          data.address.state_district ||
          data.address.county ||
          data.address.state ||
          "";

        const taluka =
          data.address.suburb ||
          data.address.town ||
          data.address.city ||
          data.address.village ||
          "";

        setFormData((prev) => ({
          ...prev,
          district: district || prev.district,
          taluka: taluka || prev.taluka,
        }));
      }
    } catch (err) {
      console.log("Geocoding error:", err);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleMapClick = (lat, lng) => {
    mapClickRef.current = true;

    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));

    reverseGeocode(lat, lng);

    setTimeout(() => {
      mapClickRef.current = false;
    }, 150);
  };

  // Handle other input fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setIdProof(e.target.files[0]);
  };

  // ----------------------- SUBMIT FORM -----------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const mobileMsg = validateMobile(formData.mobileNumber);
    if (mobileMsg) {
      setMobileError(mobileMsg);
      return;
    }

    if (formData.role === "agronomist" && !idProof) {
      setError("ID proof is required for agronomist registration.");
      return;
    }

    setLoading(true);

    const result = await register(formData, idProof);

    if (result.success) {
      navigate("/login");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="register-container">
      <style>{`
        .register-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
          padding: 20px;
        }
        .register-form-wrapper {
          width: 100%;
          max-width: 900px;
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 5px 25px rgba(0,0,0,0.15);
        }
        .register-title {
          text-align: center;
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 20px;
          color: #2d5016;
        }
        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }
        .form-group { display: flex; flex-direction: column; }
        .form-label { font-weight: 600; margin-bottom: 5px; }
        .form-input, .form-select {
          padding: 10px 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
        }
        .mobile-warning {
          color: red;
          font-size: 0.9rem;
          margin-top: 3px;
        }
        .submit-button {
          padding: 12px;
          border: none;
          border-radius: 10px;
          background: #28a745;
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          margin-top: 15px;
        }
        .submit-button:disabled {
          background: gray;
          opacity: 0.6;
          cursor: not-allowed;
        }
        .map-container { height: 350px; }
        .location-display {
          background: #fff3cd;
          padding: 10px;
          margin-top: 10px;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
        }
      `}</style>

      <div className="register-form-wrapper">
        <h2 className="register-title">Create Your Account</h2>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          {/* Full Name + Mobile */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                className="form-input"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input
                className="form-input"
                name="mobileNumber"
                required
                maxLength={10}
                value={formData.mobileNumber}
                onChange={handleMobileChange}
              />
              {mobileError && (
                <div className="mobile-warning">{mobileError}</div>
              )}
            </div>
          </div>

          {/* Password + Role */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-input"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role *</label>
              <select
                className="form-select"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="farmer">Farmer</option>
                <option value="agronomist">Agronomist</option>
              </select>
            </div>
          </div>

          {/* Language */}
          <div className="form-group">
            <label className="form-label">Language</label>
            <select
              className="form-select"
              name="language"
              value={formData.language}
              onChange={handleChange}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="mr">Marathi</option>
            </select>
          </div>

          {/* Map for Farmers */}
          {formData.role === "farmer" && (
            <>
              <h3 style={{ marginTop: "20px", color: "#2d5016" }}>
                🌾 Select Your Farm Location
              </h3>

              <div className="map-container">
                <MapContainer
                  center={defaultCenter}
                  zoom={defaultZoom}
                  scrollWheelZoom={true}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                  {formData.latitude && formData.longitude && (
                    <Marker
                      position={[
                        parseFloat(formData.latitude),
                        parseFloat(formData.longitude),
                      ]}
                    />
                  )}

                  <MapClickHandler onMapClick={handleMapClick} />
                </MapContainer>
              </div>

              {formData.latitude && (
                <div className="location-display">
                  🌍 Selected Location: {formData.latitude}, {formData.longitude}
                </div>
              )}

              {locationLoading && (
                <div className="location-display">
                  Detecting district & taluka…
                </div>
              )}
            </>
          )}

          {/* District + Taluka */}
          <div className="form-row" style={{ marginTop: "15px" }}>
            <div className="form-group">
              <label className="form-label">District</label>
              <input
                className="form-input"
                name="district"
                value={formData.district}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Taluka</label>
              <input
                className="form-input"
                name="taluka"
                value={formData.taluka}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Agronomist Extra Fields */}
          {formData.role === "agronomist" && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Qualification *</label>
                  <input
                    className="form-input"
                    name="qualification"
                    required
                    value={formData.qualification}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Experience (Years) *</label>
                  <input
                    type="number"
                    className="form-input"
                    name="experience"
                    required
                    value={formData.experience}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">ID Proof Document *</label>
                <input type="file" required onChange={handleFileChange} />
              </div>
            </>
          )}

          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>

          <p style={{ textAlign: "center", marginTop: "10px" }}>
            <Link to="/login">Already have an account? Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
