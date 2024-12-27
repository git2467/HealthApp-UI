import React, { useState, useEffect, useContext } from "react";
import dayjs from "dayjs";
import Header from "../Header/Header";
import Search from "../Search/Search";
import "./MainContainer.scss";
import NutritionDisplay from "../NutritionDisplay/NutritionDisplay";
import FoodDiary from "../FoodDiary/FoodDiary";
import {
  login,
  relogin,
  getCookie,
  checkTokenExpiry,
} from "../../api/KeycloakApi";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../../context/AuthContext";

const MainContainer = () => {
  const { setDecodedToken, isLogin, setIsLogin } = useContext(AuthContext);
  const [selectedFood, setSelectedFood] = useState("");
  const [diaryDate, setDiaryDate] = useState(dayjs());
  const [refreshKey, setRefreshKey] = useState(0); // refresh key is to for nutrition display to let food diary know that there's a new food entry

  const [code, setCode] = useState("");

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
    const accessToken = getCookie("accessToken");
    const refreshToken = getCookie("refreshToken");

    //use authorisation code to retrieve access token
    if (code && !accessToken) {
      const handleLogin = async () => {
        try {
          const response = await login(code);
          setDecodedToken(response);
          setIsLogin(true);
        } catch (error) {
          console.error("Error in handleLogin:", error);
          setIsLogin(false);
        }
      };
      handleLogin();
    } else if (accessToken) {
      if (checkTokenExpiry("accessToken")) {
        //when token expire
        setIsLogin(false);
      } else {
        //when user refresh page
        const handleRefreshPage = async () => {
          try {
            const newAccessToken = await relogin();
            setDecodedToken(jwtDecode(newAccessToken));
            setIsLogin(true);
          } catch (error) {
            console.error("Error in handleRefreshPage:", error);
            setIsLogin(false);
          }
        };
        handleRefreshPage();
      }
    }
  }, [code]);

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
      <div className="foodDiaryContainer">
        {isLogin ? (
          <FoodDiary
            foodDate={diaryDate}
            key={refreshKey}
            onDateChange={handleDateChange}
          />
        ) : (
          <>
            <h1>Please sign in to use the Food Diary feature</h1>
          </>
        )}
      </div>
    </div>
  );
};

export default MainContainer;
