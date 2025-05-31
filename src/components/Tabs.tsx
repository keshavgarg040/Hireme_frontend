import React, { useState } from "react";
import Candidates from "./Candidates.tsx";
import Requirements from "./Requirements.tsx";
import NavHeader from "./NavHeader";
import { FaUsers, FaBriefcase } from "react-icons/fa";

const Tabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"candidates" | "requirements">("candidates");

  return (
    <>
      <NavHeader userType="recruiter" />
      <div className="container py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <button
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                activeTab === "candidates"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("candidates")}
            >
              <FaUsers size={18} />
              <span>Candidates</span>
            </button>
            <button
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                activeTab === "requirements"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("requirements")}
            >
              <FaBriefcase size={18} />
              <span>Requirements</span>
            </button>
          </div>
        </div>

        <div className="tab-content">
          {activeTab === "candidates" && <Candidates />}
          {activeTab === "requirements" && <Requirements />}
        </div>
      </div>
    </>
  );
};

export default Tabs;