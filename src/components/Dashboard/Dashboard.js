import React, { useState, useEffect } from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";
import SearchBar from "../Search/SearchBar";
import "./Dashboard.css";
// import data from "../../data/foodData.json";
import NutritionDisplay from "../NutritionDisplay/NutritionDisplay";

const Dashboard = () => {
  // const foodData = data.SRLegacyFoods.map((food) => ({
  //   description: food.description,
  //   fdcId: food.fdcId,
  // }));
  // console.log(foodData);

  // added as example, will remove during integration
  var selectedFood = {
    fdcId: 167782,
    description: "Abiyuch, raw",
  };
  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-body">
        <Sidebar />
        {/* <SearchBar foodData={foodData} /> */}
        <SearchBar />
        <NutritionDisplay selectedFood={selectedFood} />
      </div>
    </div>
  );
};

export default Dashboard;
