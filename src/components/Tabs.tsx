import React, { useState } from "react";
import Candidates from "./Candidates.tsx";
import Requirements from "./Requirements.tsx";

const Tabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"candidates" | "requirements">("candidates");

  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "candidates" ? "active" : ""}`}
            onClick={() => setActiveTab("candidates")}
          >
            Candidates
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "requirements" ? "active" : ""}`}
            onClick={() => setActiveTab("requirements")}
          >
            Requirements
          </button>
        </li>
      </ul>

      <div className="tab-content mt-3">
        {activeTab === "candidates" && <Candidates />}
        {activeTab === "requirements" && <Requirements />}
      </div>
    </div>
  );
};

export default Tabs;