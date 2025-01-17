import { Button } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { logout, relogin, updateAge, getCookie } from "../../api/KeycloakApi";
import { AuthContext } from "../../context/AuthContext";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import "./Header.scss";
import "../Button/Button.scss";
import "../Select/Select.scss";

const Header = () => {
  const { decodedToken, setDecodedToken, isLogin, setIsLogin } =
    useContext(AuthContext);
  const [selectedAge, setSelectedAge] = useState();
  const options = [
    { value: "1-3", label: "1-3" },
    { value: "4-8", label: "4-8" },
    { value: "9-13", label: "9-13" },
    { value: "14-18", label: "14-18" },
    { value: "19-30", label: "19-30" },
    { value: "31-50", label: "31-50" },
    { value: "51+", label: "51+" },
  ];

  const updateAgeOptions = () => {
    const userAge = decodedToken.age;
    setSelectedAge(userAge);
  };

  useEffect(() => {
    if (isLogin) updateAgeOptions();
  }, [isLogin]);

  const handleLogout = () => {
    logout();
    setIsLogin(false);
  };

  const handleLogin = () => {
    if (!isLogin) {
      //redirect to keycloak login page
      const keycloakUrl = `${
        process.env.REACT_APP_KEYCLOAK_SERVER_URL +
        process.env.REACT_APP_KEYCLOAK_REALM
      }/protocol/openid-connect/auth?client_id=${
        process.env.REACT_APP_KEYCLOAK_REALM
      }&redirect_uri=${
        process.env.REACT_APP_KEYCLOAK_REDIRECT_URL
      }&response_type=code&scope=openid`;
      window.location.href = keycloakUrl;
    }
  };

  const handleChange = async (event) => {
    try {
      const newAge = event.target.value;
      // update age display and age in keycloak
      setSelectedAge(newAge);
      await updateAge(newAge);
      // update decodedtoken to update display in fooddiary and nutri display
      await relogin();
      const accessToken = getCookie("accessToken");
      setDecodedToken(jwtDecode(accessToken));
    } catch (error) {
      console.error("Error updating age", error);
    }
  };

  return (
    <header>
      <div className="header-left">
        <h1>Food Diary</h1>
      </div>
      {isLogin && (
        <div className="header-center">
          <p>I am </p>
          <Select
            className="primary-select header-select"
            value={selectedAge || ""}
            onChange={handleChange}
          >
            {options.map((option, index) => (
              <MenuItem key={index} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <p> years old</p>
        </div>
      )}
      <div class="header-right">
        {isLogin ? (
          //after login aka isLogin == true
          <div className="logout-wrapper">
            <p>Welcome, {decodedToken.preferred_username}!</p>
            <Button
              className="secondary-button logout-button"
              disabled={!isLogin}
              onClick={() => handleLogout()}
            >
              Logout
            </Button>
          </div>
        ) : (
          //before login aka isLogin == false
          <div className="login-wrapper">
            <Button
              className="primary-button login-button"
              disabled={isLogin}
              onClick={() => handleLogin()}
            >
              Login
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
