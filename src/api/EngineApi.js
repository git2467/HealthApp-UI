import { engineAxiosInstance } from "./KeycloakApi";

export const fetchFoodEntryByDate = async (foodDate) => {
  try {
    const response = await engineAxiosInstance.get(
      `/entry/date?keycloakId=${localStorage.getItem(
        "keycloakId"
      )}&foodDate=${foodDate}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching food entry: ", error);
    throw error;
  }
};

export const createFoodEntry = async (foodEntry) => {
  try {
    const response = await engineAxiosInstance.post(`/entry/create`, foodEntry);
    return response;
  } catch (error) {
    console.error("Error creating food entry: ", error);
    throw error;
  }
};

export const updateFoodEntry = async (foodEntry) => {
  console.log(foodEntry);
  try {
    const response = await engineAxiosInstance.put(`/entry/update`, foodEntry);
    return response;
  } catch (error) {
    console.error("Error updating food entry: ", error);
    throw error;
  }
};

export const deleteFoodEntryById = async (id) => {
  try {
    const response = await engineAxiosInstance.delete(`/entry/delete`, {
      data: id,
    });
    return response;
  } catch (error) {
    console.error("Error deleting food entry: ", error);
    throw error;
  }
};
