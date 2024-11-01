import React, { useState } from "react";
import Header from "../Header";
import Search from "../Search/Search";
import "./MainContainer.scss";
import NutritionDisplay from "../NutritionDisplay/NutritionDisplay";

const MainContainer = () => {
  const [selectedFood, setSelectedFood] = useState("");

  const handleSelectedRow = (row) => {
    setSelectedFood(row);
  };

  return (
    <div className="mainContainer">
      <Header />
      <div className="mainBody">
        <div className="mainSearch">
          <Search onRowSelected={handleSelectedRow} />
        </div>
        <div className="mainNutritionDisplay">
          {selectedFood && <NutritionDisplay selectedFood={selectedFood} />}
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
