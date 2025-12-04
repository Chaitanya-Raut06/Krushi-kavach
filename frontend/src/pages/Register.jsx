import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
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

  const [mobileError, setMobileError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [idProof, setIdProof] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const mapClickRef = useRef(false);
  const { t } = useTranslation();

  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;

  // ----------------------- VALIDATE MOBILE -----------------------
  const validateMobile = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) return t('register.mobileRequired');
    if (cleaned.length !== 10) return t('register.mobileLength');
    if (!/^[6-9]\d{9}$/.test(cleaned))
      return t('register.mobileFormat');
    return "";
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
      setError(t('register.idProofRequired'));
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 text-center">
            <div className="text-5xl mb-3">📝</div>
            <h2 className="text-3xl font-bold text-white">{t('register.title')}</h2>
            <p className="mt-2 text-green-100 text-sm">Create your account and get started</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-8">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Full Name + Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('register.fullName')} *
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('common.mobileNumber')} *
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  name="mobileNumber"
                  required
                  maxLength={10}
                  value={formData.mobileNumber}
                  onChange={handleMobileChange}
                  placeholder="10-digit mobile number"
                />
                {mobileError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {mobileError}
                  </p>
                )}
              </div>
            </div>

            {/* Password + Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('common.password')} *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('register.role')} *
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="farmer">{t('register.farmer')}</option>
                  <option value="agronomist">{t('register.agronomist')}</option>
                </select>
              </div>
            </div>

            {/* Language */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('register.language')}
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
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
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🌾</span>
                  <span>{t('register.selectFarmLocation')}</span>
                </h3>

                <div className="border-2 border-gray-200 rounded-lg overflow-hidden" style={{ height: "350px" }}>
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
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                    <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                      <span>🌍</span>
                      <span>{t('register.selectedLocation')}: {formData.latitude}, {formData.longitude}</span>
                    </p>
                  </div>
                )}

                {locationLoading && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                    <p className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('register.detecting')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* District + Taluka */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('register.district')}
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="District"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('register.taluka')}
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  name="taluka"
                  value={formData.taluka}
                  onChange={handleChange}
                  placeholder="Taluka"
                />
              </div>
            </div>

            {/* Agronomist Extra Fields */}
            {formData.role === "agronomist" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('register.qualification')} *
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      name="qualification"
                      required
                      value={formData.qualification}
                      onChange={handleChange}
                      placeholder="Your qualification"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('register.experience')} *
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      name="experience"
                      required
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="Years of experience"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('register.idProof')} *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      required
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">{t('register.idProofRequired')}</p>
                </div>
              </>
            )}

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('register.registering')}
                  </>
                ) : (
                  t('common.register')
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t('register.alreadyHaveAccount')}{' '}
                <Link to="/login" className="font-semibold text-green-600 hover:text-green-700 transition-colors">
                  {t('common.signIn')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
