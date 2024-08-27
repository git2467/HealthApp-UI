import React, { useState, useEffect } from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";
import SearchBar from "../Search/SearchBar";
import "./Dashboard.css";
import NutritionDisplay from "../NutritionDisplay/NutritionDisplay";

const Dashboard = () => {
  const [selectedFood, setSelectedFood] = useState("");

  const handleSelectedFood = (id) => {
    setSelectedFood(id);
  };

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-body">
        <Sidebar />
        <SearchBar selectedFood={handleSelectedFood} />
        <NutritionDisplay selectedFood={selectedFood} />
      </div>
    </div>
  );
};

export default Dashboard;
