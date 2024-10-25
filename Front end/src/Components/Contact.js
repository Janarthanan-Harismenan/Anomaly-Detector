import React from "react";

const Contact = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-b from-blue-300 to-purple-500 min-h-screen p-4 bg-gray-50">
      <div className="max-w-lg w-full bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-center mb-4">Contact Us</h1>
        <p className="text-lg text-center mb-2">
          Email:{" "}
          <a href="mailto:your-email@gmail.com" className="text-purple-600">
            kadavule@gmail.com
          </a>
        </p>
        <p className="text-lg text-center">
          Phone: <span className="text-purple-600">077 118-1193</span>
        </p>
      </div>
    </div>
  );
};

export default Contact;
