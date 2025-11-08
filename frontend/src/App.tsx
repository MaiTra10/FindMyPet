import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import { CatDetails } from "./pages/CatDetails";
import "./styles/globals.css";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cat/:id" element={<CatDetails />} />
        </Routes>
      </div>
    </Router>
  );
}
