import React, { useState, useEffect, useContext } from "react";
import dayjs from "dayjs";
import Header from "../Header/Header";
import Search from "../Search/Search";
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
import { Alert } from "@mui/material";

import "./MainContainer.scss";

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

    //use authorisation code to retrieve access token
    if (code && !accessToken) {
      const handleLogin = async () => {
        try {
          const response = await login(code);
          setDecodedToken(response);
          setIsLogin(true);
          window.history.replaceState(null, "", "/");
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
      <hr
        style={{
          border: "0.5px solid #e0e0e0",
          margin: "20px 0",
        }}
      />
      <div className="foodDiaryContainer">
        <div className="foodDiaryHeader">
          <h1>Food Diary</h1>
          {!isLogin && (
            <Alert className="signInPrompt" severity="info">
              Please sign in to use the Food Diary feature.
            </Alert>
          )}
        </div>
        <div className={`foodDiaryWrapper ${isLogin ? "" : "blurred"}`}>
          <FoodDiary
            isLogin={isLogin}
            foodDate={diaryDate}
            key={refreshKey}
            onDateChange={handleDateChange}
          />
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
