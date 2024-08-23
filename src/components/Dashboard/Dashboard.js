import React, { useState, useEffect } from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";
import SearchBar from "../Search/SearchBar";
import "./Dashboard.css";
import data from "../../data/foodData.json";

const Dashboard = () => {
  const foodData = data.SRLegacyFoods.map((food) => ({
    description: food.description,
    fdcId: food.fdcId,
  }));
  console.log(foodData);

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-body">
        <Sidebar />
        <SearchBar foodData={foodData} />
      </div>
    </div>
  );
};

export default Dashboard;
