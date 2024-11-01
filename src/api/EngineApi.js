import { engineAxiosInstance } from "./KeycloakApi";

const USER_ID = "user200";

export const fetchFoodDiaryById = async () => {
  try {
    const response = await engineAxiosInstance.get(
      `/entry/id?keycloakId=${USER_ID}`
    );
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error fetching search results:", error);
    throw error;
  }
};
