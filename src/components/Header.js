import { Button } from "@mui/material";
import React, { useContext } from "react";
import { logout } from "../api/KeycloakApi";
import { AuthContext } from "../context/AuthContext";

const Header = ({username}) => {
  const {isLogin, setIsLogin} = useContext(AuthContext);

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

  return (
    <header>
      <h1>Food Diary</h1>
      {isLogin ? (
        //after login aka isLogin == true
        <div>
          <p>Welcome, {username}!</p>
          <div className="logout-wrapper">
            <Button disabled={!isLogin} onClick={() => handleLogout()}>
              Logout
            </Button>
          </div>
        </div>
      ) : (
        //before login aka isLogin == false
        <div className="login-wrapper">
          <Button disabled={isLogin} onClick={() => handleLogin()}>
            Login
          </Button>
        </div>
      )}
    </header>
  );
};

export default Header;
