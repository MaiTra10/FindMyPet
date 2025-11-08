import { useState } from "react";

interface PetReport {
  id: number;
  type: string;
  description: string;
  image: string;
  location: string;
}

function App() {
  const [page, setPage] = useState<"home" | "report" | "map">("home");
  const [reports, setReports] = useState<PetReport[]>([]);

  const [newReport, setNewReport] = useState({
    type: "",
    description: "",
    image: "",
    location: "",
  });

  const handleAddReport = () => {
    if (!newReport.type || !newReport.description) return alert("Fill all fields");
    const newPet: PetReport = {
      id: reports.length + 1,
      ...newReport,
    };
    setReports([...reports, newPet]);
    setNewReport({ type: "", description: "", image: "", location: "" });
    setPage("home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-800 flex flex-col items-center">
      {/* Navbar */}
      <nav className="w-full flex justify-center gap-8 py-4 shadow-md bg-white sticky top-0 z-10">
        <button
          onClick={() => setPage("home")}
          className={`font-semibold ${page === "home" ? "text-blue-600" : ""}`}
        >
          Home
        </button>
        <button
          onClick={() => setPage("report")}
          className={`font-semibold ${page === "report" ? "text-blue-600" : ""}`}
        >
          Report Pet
        </button>
        <button
          onClick={() => setPage("map")}
          className={`font-semibold ${page === "map" ? "text-blue-600" : ""}`}
        >
          Map
        </button>
      </nav>

      {/* Page Content */}
      <main className="flex flex-col items-center w-full max-w-xl p-6">
        {page === "home" && (
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">🐾 FindMyPet</h1>
            <p className="text-gray-600 mb-4">
              Reuniting pets with their owners — one paw at a time.
            </p>

            {reports.length === 0 ? (
              <p className="text-gray-500">No reports yet. Be the first to add one!</p>
            ) : (
              <div className="grid gap-4 mt-4">
                {reports.map((r) => (
                  <div key={r.id} className="border rounded-lg p-4 shadow bg-white">
                    {r.image && (
                      <img
                        src={r.image}
                        alt={r.type}
                        className="w-full h-40 object-cover rounded-md mb-2"
                      />
                    )}
                    <h2 className="font-semibold">{r.type}</h2>
                    <p className="text-sm text-gray-600">{r.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{r.location}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {page === "report" && (
          <div className="w-full">
            <h2 className="text-2xl font-bold mb-4 text-center">Report Lost/Found Pet</h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Type (e.g. Cat, Dog)"
                value={newReport.type}
                onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
                className="border rounded-lg p-2"
              />
              <textarea
                placeholder="Description"
                value={newReport.description}
                onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                className="border rounded-lg p-2"
              />
              <input
                type="text"
                placeholder="Image URL (optional)"
                value={newReport.image}
                onChange={(e) => setNewReport({ ...newReport, image: e.target.value })}
                className="border rounded-lg p-2"
              />
              <input
                type="text"
                placeholder="Location (optional)"
                value={newReport.location}
                onChange={(e) => setNewReport({ ...newReport, location: e.target.value })}
                className="border rounded-lg p-2"
              />
              <button
                onClick={handleAddReport}
                className="bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700 transition"
              >
                Submit Report
              </button>
            </div>
          </div>
        )}

        {page === "map" && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Map View</h2>
            <p className="text-gray-600 mb-4">
              (Map integration coming soon — reports will be plotted here!)
            </p>
            <div className="border rounded-lg w-80 h-80 flex items-center justify-center bg-gray-100">
              🗺️ Map Placeholder
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
