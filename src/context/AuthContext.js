import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  // to initialize with default and check stored age
  const [age, setAge] = useState("");

  return (
    <AuthContext.Provider value={{ isLogin, setIsLogin, age, setAge }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
