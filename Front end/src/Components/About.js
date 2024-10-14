import React from "react";

const About = () => {
  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl text-center bg-white top-20 p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold mb-4">About Us</h1>
        <p className="text-lg text-gray-700 mb-6">
          We are dedicated to providing innovative solutions in the field of
          anomaly detection within microservices architectures. Our goal is to
          help businesses identify and address irregularities effectively to
          ensure smooth operations and enhanced system reliability.
        </p>
      </div>
    </div>
  );
};

export default About;
