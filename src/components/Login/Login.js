import { Alert, Button, Snackbar } from "@mui/material";
import React, { useEffect, useState, useContext } from "react";
import { login, logout } from "../../api/KeycloakApi";
import { AuthContext } from "../../context/AuthContext";

const Login = () => {
  const { isLogin, setIsLogin } = useContext(AuthContext);
  const [username, setUsername] = useState("");

  const handleClose = () => {
    // setIsLogin(false);
    // setIsLogout(false);
  };

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
    <div>
      {isLogin ? (
        <div>
          <p>Welcome, {username}!</p>
          <div className="logout-wrapper">
            <Button disabled={!isLogin} onClick={() => handleLogout()}>
              {" "}
              Logout{" "}
            </Button>
            <Snackbar open={!isLogin} autoHideDuration={10000}>
              <Alert
                onClose={handleClose}
                severity="success"
                sx={{ width: "100%" }}
              >
                You have successfully logged out.
              </Alert>
            </Snackbar>
          </div>
        </div>
      ) : (
        <div className="login-wrapper">
          <Button disabled={isLogin} onClick={() => handleLogin()}>
            {" "}
            Login{" "}
          </Button>
          <Snackbar open={isLogin} autoHideDuration={10000}>
            <Alert
              onClose={handleClose}
              severity="success"
              sx={{ width: "100%" }}
            >
              You have successfully logged in.
            </Alert>
          </Snackbar>
        </div>
      )}
    </div>
  );
};

export default Login;
