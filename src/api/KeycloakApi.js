import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const getCookie = (cookieType) => {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((cookie) => cookie.startsWith(cookieType + "="));
  return cookie ? cookie.split("=")[1] : null;
};

const removeCookie = (cookieType) => {
  document.cookie = `${cookieType}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
};

const fdcAxiosInstance = axios.create({
  baseURL: "https://api.nal.usda.gov/fdc/v1",
  params: {
    api_key: process.env.REACT_APP_FDC_API_KEY,
  },
});

const engineAxiosInstance = axios.create({
  baseURL: "http://localhost:9013",
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
      if (!getCookie("accessToken")) {
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
    document.cookie = `accessToken=${accessToken}; path=/; Secure; SameSite=Strict; max-age=86400;`;
    document.cookie = `refreshToken=${refreshToken}; path=/; Secure; SameSite=Strict; max-age=86400;`;

    const decodedToken = jwtDecode(accessToken);

    setTokenInAxios(accessToken);
    console.log("Logged in successfully.");
    return decodedToken;
  } catch (error) {
    console.error("Error logging in: ", error);
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const refreshToken = getCookie("refreshToken");

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
    document.cookie = `accessToken=${newAccessToken}; path=/; Secure; SameSite=Strict; max-age=86400;`;
    document.cookie = `refreshToken=${newRefreshToken}; path=/; Secure; SameSite=Strict; max-age=86400;`;

    setTokenInAxios(newAccessToken);
    console.log("Obtained new access token successfully.");
  } catch (error) {
    console.error("Error refreshing token: ", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const refreshToken = getCookie("refreshToken");

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

    removeCookie("accessToken");
    removeCookie("refreshToken");

    console.log("Logged out successfully.");
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
