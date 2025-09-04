// Navbar.js
import React from "react";

export default function Navbar() {
  return (
    <>
      <nav className="navbar">
        <h1 className="navbar-title">ClubHub</h1>
      </nav>

      {/* Inline CSS inside the same file */}
      <style>{`
        .navbar {
          padding: 15px 20px;
          background: linear-gradient(90deg, #6a11cb, #2575fc);
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .navbar-title {
          font-size: 2rem;
          font-weight: bold;
          color: white;
          letter-spacing: 2px;
          text-transform: uppercase;
          animation: fadeInScale 1.2s ease-in-out;
        }

        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .navbar-title:hover {
          color: #ffd700;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
          cursor: default;
        }
      `}</style>
    </>
  );
}
