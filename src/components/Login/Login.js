import { Alert, Button, Snackbar } from "@mui/material";
import React, { useEffect, useState }  from "react";
import { login, logout } from "../../api/KeycloakApi";

const Login = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [isLogout, setIsLogout] = useState(false);
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');  

  const handleClose = () => {
    setIsLogin(false);
    setIsLogout(false);
  };

  const handleLogout = () => {
    logout();
    setIsLogout(true);
    setIsLogin(false);
  };

  const handleLogin = () => {
    setIsLogout(false);
    if(!isLogin){
      //redirect to keycloak login page
      const keycloakUrl = `${process.env.REACT_APP_KEYCLOAK_SERVER_URL + process.env.REACT_APP_KEYCLOAK_REALM}/protocol/openid-connect/auth?client_id=${process.env.REACT_APP_KEYCLOAK_REALM}&redirect_uri=${process.env.REACT_APP_KEYCLOAK_REDIRECT_URL}&response_type=code&scope=openid`;
      window.location.href = keycloakUrl;
    }
  };

  useEffect(() => {
    //upon successful login, redirect back to healthapp
    const urlParams = new URLSearchParams(window.location.search);
    setCode(urlParams.get('code')); 
  }, []);

  useEffect(() => {
    if(code) {
      login(code); //use code (or authorization_code) to get access token
      setIsLogin(true);
      setUsername(localStorage.getItem('keycloakUsername'))
    }
  }, [code]);

  return (
    <div>
      {isLogin ? (<div><p>Welcome, {username}!</p></div>) 
      : (<div className="login-wrapper">
        <Button disabled={isLogin} onClick={() => handleLogin()}> Login </Button>
        <Snackbar open={isLogin} autoHideDuration={10000}>
          <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
            You have successfully logged in.
          </Alert>
        </Snackbar>
      </div>)}
      {isLogout ? (<div></div>) 
      : (<div className="logout-wrapper">
        <Button disabled={isLogout} onClick={() => handleLogout()}> Logout </Button>
        <Snackbar open={isLogout} autoHideDuration={10000}>
          <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
            You have successfully logged out.
          </Alert>
        </Snackbar>
        </div>)}
    </div>
    
  );
};

export default Login;
