import axios from "axios";
import { jwtDecode } from "jwt-decode";

const fdcAxiosInstance = axios.create({
  baseURL: "https://api.nal.usda.gov/fdc/v1",
  params: {
    api_key: process.env.REACT_APP_FDC_API_KEY,
  },
});

const engineAxiosInstance = axios.create({
  baseURL: "http://localhost:9013",
  params: {
    keycloakId: localStorage.getItem("keycloakId"),
  },
});

export { fdcAxiosInstance, engineAxiosInstance };

export const setTokenInAxios = (token) => {
  if (token) {
    engineAxiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;
  } else {
    delete engineAxiosInstance.defaults.headers.common["Authorization"];
    console.log("Removed access token from engine axios instance");
  }
};

engineAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      if (!localStorage.getItem("refreshToken")) {
        await logout();
        return Promise.reject(error);
      } else {
        await refreshToken();
        return engineAxiosInstance.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);

export const login = async (code) => {
  try {
    const response = await axios.post(
      "/realms/healthapp/protocol/openid-connect/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: "healthapp",
        redirect_uri: "http://localhost:3000/redirect",
        code: code,
        client_secret: process.env.REACT_APP_CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    const decodedToken = jwtDecode(accessToken);
    const keycloakId = decodedToken.sub;
    const keycloakUsername = decodedToken.preferred_username;
    localStorage.setItem("keycloakId", keycloakId);
    localStorage.setItem("keycloakUsername", keycloakUsername);

    setTokenInAxios(accessToken);
    console.log("Logged in successfully.");
  } catch (error) {
    console.error("Error logging in: ", error);
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      console.error(
        "No refresh token found while attempting to refresh token."
      );
      return;
    }

    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("client_id", "healthapp");
    params.append("client_secret", process.env.REACT_APP_CLIENT_SECRET);
    params.append("refresh_token", refreshToken);

    const response = await axios.post(
      `/realms/healthapp/protocol/openid-connect/token`,
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const newAccessToken = response.data.access_token;
    const newRefreshToken = response.data.refresh_token;

    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", newRefreshToken);

    const decodedToken = jwtDecode(newAccessToken);
    const keycloakId = decodedToken.sub;
    localStorage.setItem("keycloakId", keycloakId);

    setTokenInAxios(newAccessToken);
    console.log("Obtained new access token successfully.");
  } catch (error) {
    console.error("Error refreshing token: ", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      console.error("No refresh token found while attempting to logout.");
      return;
    }

    const params = new URLSearchParams();
    params.append("client_id", "healthapp");
    params.append("refresh_token", refreshToken);
    params.append("client_secret", process.env.REACT_APP_CLIENT_SECRET);

    await axios.post(
      `/realms/healthapp/protocol/openid-connect/logout`,
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("keycloakId");
    console.log("Logged out successfully.");
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
