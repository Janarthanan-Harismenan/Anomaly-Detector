import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Signup from "./Components/Signup/Signup";
import Login from "./Components/Login/Login";
import LandingPage from "./Components/LandingPage/LandingPage";
import HomePage from "./Components/HomePage/HomePage";
import Form from "./Components/Form";
import About from "./Components/About";
import Contact from "./Components/Contact";
import Header from "./Components/Header";
import AnomalyDisplay from "./Components/AnomalyDisplay"; // Import the AnomalyDisplay component

function App() {
  return (
    <div>
      <Router>
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* Restricted Routes */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/form" element={<Form />} />
          {/* Anomaly Display Route */}
          <Route path="/anomaly-display" element={<AnomalyDisplay />} />{" "}
          {/* Add this line */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
