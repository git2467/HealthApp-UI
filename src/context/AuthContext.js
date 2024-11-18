import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [decodedToken, setDecodedToken] = useState();
  const [isLogin, setIsLogin] = useState(false);

  return (
    <AuthContext.Provider
      value={{ decodedToken, setDecodedToken, isLogin, setIsLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
