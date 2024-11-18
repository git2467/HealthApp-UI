import React, { useState, useEffect, useContext } from "react";
import dayjs from "dayjs";
import Header from "../Header";
import Search from "../Search/Search";
import "./MainContainer.scss";
import NutritionDisplay from "../NutritionDisplay/NutritionDisplay";
import FoodDiary from "../FoodDiary/FoodDiary";
import DateSelector from "../DateSelector/DateSelector";
import { login } from "../../api/KeycloakApi";
import { AuthContext } from "../../context/AuthContext";

const MainContainer = () => {
  const { isLogin, setIsLogin, setAge } = useContext(AuthContext);
  const [selectedFood, setSelectedFood] = useState("");
  const [diaryDate, setDiaryDate] = useState(dayjs());
  // refresh key is to for nutrition display to let food diary know that there's a new food entry
  const [refreshKey, setRefreshKey] = useState(0);
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");

  const handleSelectedRow = (row) => {
    setSelectedFood(row);
  };

  const handleDateChange = (date) => {
    setDiaryDate(date);
    setRefreshKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    //upon successful login, redirect back to healthapp
    const urlParams = new URLSearchParams(window.location.search);
    setCode(urlParams.get("code"));
  }, []);

  useEffect(() => {
    const keycloakId = localStorage.getItem("keycloakId");

    //use authorisation code to retrieve access token
    if (code && !keycloakId) {
      const handleLogin = async () => {
        try {
          await login(code);
          setIsLogin(true);
          const age = localStorage.getItem("age");
          setAge(age);
          setUsername(localStorage.getItem("keycloakUsername"));
        } catch (error) {
          console.error("Error in handleLogin:", error);
          setIsLogin(false);
        }
      };

      handleLogin();
    } else if (code && keycloakId) {
      //when user refresh page
      const age = localStorage.getItem("age");
      setIsLogin(true);
      setAge(age);
      setUsername(localStorage.getItem("keycloakUsername"));
    }
  }, [code]);

  return (
    <div className="mainContainer">
      <Header username={username} />
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
      {isLogin ? (
        <>
          <DateSelector
            date={diaryDate}
            onDateChange={handleDateChange}
            showNavButtons={true}
          />
          <FoodDiary foodDate={diaryDate} key={refreshKey} />
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
