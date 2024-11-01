import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import Header from "../Header";
import Search from "../Search/Search";
import "./MainContainer.scss";
import NutritionDisplay from "../NutritionDisplay/NutritionDisplay";
import FoodDiary from "../FoodDiary/FoodDiary";
import DateSelector from "../../DateSelector/DateSelector";

const MainContainer = () => {
  const [selectedFood, setSelectedFood] = useState("");
  const [diaryDate, setDiaryDate] = useState(dayjs());

  // change this to mock the
  const keycloakId = "user123";
  // const [selectedDiaryDate, setSelectedDiaryDate] = useState("2024-09-29");

  const handleSelectedRow = (row) => {
    setSelectedFood(row);
  };

  const handleDateChange = (date) => {
    setDiaryDate(date);
  };

  return (
    <div className="mainContainer">
      <Header />
      <div className="mainBody">
        <div className="mainSearch">
          <Search onRowSelected={handleSelectedRow} />
        </div>
        <div className="mainNutritionDisplay">
          {selectedFood && (
            <NutritionDisplay
              selectedFood={selectedFood}
              onAddToDiary={handleDateChange}
            />
          )}
        </div>
      </div>
      {keycloakId !== "" ? (
        <>
          <DateSelector
            date={diaryDate}
            onDateChange={handleDateChange}
            showNavButtons={true}
          />
          <FoodDiary foodDate={diaryDate} />
        </>
      ) : (
        <>
          <h1>Please sign in to use the Food Diary feature</h1>
        </>
      )}
    </div>
  );
};

export default MainContainer;
