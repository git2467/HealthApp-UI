import React, { useState, useEffect } from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";
import SearchMain from "../Search/SearchMain";
import "./Dashboard.css";
import NutritionDisplay from "../NutritionDisplay/NutritionDisplay";

const Dashboard = () => {
  const [selectedFood, setSelectedFood] = useState("");

  const handleSelectedRow = (row) => {
    setSelectedFood(row);
  };

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-body">
        <Sidebar />
        <SearchMain onRowSelected={handleSelectedRow}/>
        {selectedFood && <NutritionDisplay selectedFood={selectedFood} />}
      </div>
    </div>
  );
};

export default Dashboard;