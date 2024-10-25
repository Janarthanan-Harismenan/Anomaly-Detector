import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const AnomalyDisplay = () => {
  const [anomalyData, setAnomalyData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Console log token
    console.log("Token: ", token);

    // If no token is found, redirect to login
    if (token === "null" || !token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchAnomalyData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/detect-anomalies-from-data",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setAnomalyData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalyData();
  }, []);

  useEffect(() => {
    let intervalId;

    if (isPlaying && anomalyData.length > 0) {
      intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex < anomalyData.length - 1 ? prevIndex + 1 : 0
        );
      }, 1000);
    }

    return () => clearInterval(intervalId); // Clean up the interval on unmount
  }, [isPlaying, anomalyData]);

  const handleStart = () => {
    setIsPlaying(true); // Set isPlaying to true when the button is pressed
  };

  const handleStop = () => {
    setIsPlaying(false); // Set isPlaying to false to stop displaying results
  };

  if (loading) return <p className="text-purple-600 text-center">Loading...</p>;
  if (error) return <p className="text-red-600 text-center">Error: {error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-purple-600 text-center mb-4">
        Anomaly Detection Results
      </h2>
      <div className="flex justify-center mb-4 space-x-4">
        <button
          onClick={handleStart}
          className="bg-green-600 text-white hover:bg-green-500 font-bold py-1 px-3 rounded"
        >
          Start Displaying Results
        </button>
        <button
          onClick={handleStop}
          disabled={!isPlaying} // Disable button if not playing
          className={`bg-red-600 text-white hover:bg-red-500 font-bold py-1 px-3 rounded ${
            !isPlaying ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Stop Displaying Results
        </button>
      </div>
      {anomalyData.length > 0 && isPlaying ? (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <h3 className="text-xl font-semibold text-purple-600">Input Data:</h3>
          <pre className="bg-white p-2 rounded border border-gray-300 overflow-x-auto">
            {JSON.stringify(anomalyData[currentIndex]?.input_data, null, 2)}
          </pre>
          <h3 className="text-lg font-semibold mt-4">
            <span
              className={
                anomalyData[currentIndex]?.anomaly_class === 0
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              Anomaly Class : {anomalyData[currentIndex].anomaly_class}
            </span>
          </h3>
        </div>
      ) : (
        <p className="text-gray-600 text-center mt-4">
          No data available or waiting to start.
        </p>
      )}
    </div>
  );
};

export default AnomalyDisplay;
