import React, { useState } from "react";
import MyProfile from "../components/MyProfile";
import Requirements from "../components/RequirementsTab";
import NavHeader from "./NavHeader";

const CandidateView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "requirements">("profile");

  return (
    <>
      <NavHeader userType="candidate" />
      <div className="container mt-4">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              My Profile
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
          {activeTab === "profile" && <MyProfile />}
          {activeTab === "requirements" && <Requirements />}
        </div>
      </div>
    </>
  );
};

export default CandidateView;
