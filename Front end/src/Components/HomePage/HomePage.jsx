import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Image from "../../Assets/Image.jpg"; // Import your image
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate(); // Initialize useNavigate for redirection

  useEffect(() => {
    const token = localStorage.getItem("token");

    // console log token
    console.log("Token: ", token);

    // If no token is found, redirect to login
    if (token === "null") {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    // Set token to null in localStorage
    localStorage.setItem("token", null); // Change here
    // Or alternatively, just remove it if you prefer
    // localStorage.removeItem("token");
    // Redirect to login page

    // console log token
    console.log("Token: ", localStorage.getItem("token"));

    navigate("/login");
  };

  return (
    <div className="landing-page">
      <div className="background">
        <div className="welcome">Microservice Anomaly Detector.</div>
        <img src={Image} alt="Anomaly Detection" className="image" />
        <div className="description">
          This application helps in detecting anomalies in microservices
          architectures using advanced machine learning algorithms. Get into the
          testing form page, apply your current data, and find out whether it's
          an anomaly or not.
        </div>
        <div className="button-container">
          <Link to="/Form">
            <button className="btn btn-purple hover-purple">Test</button>
          </Link>
          <Link to="/anomaly-display">
            <button className="btn btn-purple hover-purple">Live Run</button>
          </Link>
          <button className="btn btn-red hover-red" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
