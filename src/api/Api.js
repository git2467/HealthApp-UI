import axios from "axios";
import Nutrient from "../objects/Nutrient";

const API_KEY = "rOo4DaIsn7eVzqvRnLPSrUA4khrQ3v3pydrAFDVg";
// hardcode for now until add adrian's part
const accessToken =
  "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJoTGMtZ0x2RElGeDVGSmZHMGxIQUY0Zi1GYTliaWd5YnRvbjFmdDBLQng0In0.eyJleHAiOjE3MzA0NTkxMDMsImlhdCI6MTczMDQ0MTEwMywianRpIjoiNDViYTZmNGItM2JjZC00M2NiLTkzZjAtMjZjZDE1MjA2NDQ5IiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3JlYWxtcy9oZWFsdGhhcHAiLCJhdWQiOlsicmVhbG0tbWFuYWdlbWVudCIsImJyb2tlciIsImFjY291bnQiXSwic3ViIjoiYWMxMDVmMzUtYjM3OS00YjljLTk3NzctZjdlYmVkYTM5OTI0IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiaGVhbHRoYXBwIiwic2lkIjoiOTg5MmNmYWYtMzdhNS00NzExLTg5NWQtNTZhYTk5N2MyMmRmIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIvKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1oZWFsdGhhcHAiLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsicmVhbG0tbWFuYWdlbWVudCI6eyJyb2xlcyI6WyJ2aWV3LWlkZW50aXR5LXByb3ZpZGVycyIsInZpZXctcmVhbG0iLCJtYW5hZ2UtaWRlbnRpdHktcHJvdmlkZXJzIiwiaW1wZXJzb25hdGlvbiIsInJlYWxtLWFkbWluIiwiY3JlYXRlLWNsaWVudCIsIm1hbmFnZS11c2VycyIsInF1ZXJ5LXJlYWxtcyIsInZpZXctYXV0aG9yaXphdGlvbiIsInF1ZXJ5LWNsaWVudHMiLCJxdWVyeS11c2VycyIsIm1hbmFnZS1ldmVudHMiLCJtYW5hZ2UtcmVhbG0iLCJ2aWV3LWV2ZW50cyIsInZpZXctdXNlcnMiLCJ2aWV3LWNsaWVudHMiLCJtYW5hZ2UtYXV0aG9yaXphdGlvbiIsIm1hbmFnZS1jbGllbnRzIiwicXVlcnktZ3JvdXBzIl19LCJicm9rZXIiOnsicm9sZXMiOlsicmVhZC10b2tlbiJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsInZpZXctYXBwbGljYXRpb25zIiwidmlldy1jb25zZW50Iiwidmlldy1ncm91cHMiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsIm1hbmFnZS1jb25zZW50IiwiZGVsZXRlLWFjY291bnQiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoidGVzdDEgdGVzdDEiLCJncm91cHMiOlsiZGVmYXVsdC1yb2xlcy1oZWFsdGhhcHAiLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl0sInByZWZlcnJlZF91c2VybmFtZSI6InRlc3R1c2VyIiwiZ2l2ZW5fbmFtZSI6InRlc3QxIiwiZmFtaWx5X25hbWUiOiJ0ZXN0MSIsImVtYWlsIjoidGVzdGluZ0BnbWFpbC5jb20ifQ.LkKYznfAhiK8MGICG2EUZ3XGLdO6rTMjicYHxaRUN8xOzM5GjR_ML_ivGTSIeTRR-s-E65LA-FT1Qx37uwFBTmiq1yW0-Sp4IlYepBSwo8-MBC-IfObsolJMCtGljvqksCPPxFfG8xUIOUbaEn9gD8VnLjBhLOWovnMA-TzU8lOFeNibfLspsP5GZJFCxWhZVGBeHuE9b6y19p8eCH4rY-1M-elD-fBNWLqprA4zoXhc2Ij5N2tozNaOmfXJgfKFsEwxQ9O3pfGPWWb7smjEOIQBOwQb3UtQkBS8LUYlZS1zqvb3AuTe1KHpoeLxlOh0LuM2_xE1d6r3As-5JMpK6A";
const keycloakId = "user123";

export const inputs = [
  { name: "Energy", id: 1008, recommendedAmt: 2600, unit: "kcal" },
  { name: "Total Fat", id: 1004, recommendedAmt: 55, unit: "g" },
  { name: "Cholesterol", id: 1253, recommendedAmt: 300, unit: "mg" },
  { name: "Sodium", id: 1093, recommendedAmt: 2300, unit: "mg" },
  { name: "Total Carbohydrate", id: 1005, recommendedAmt: 300, unit: "g" },
  { name: "Protein", id: 1003, recommendedAmt: 40, unit: "g" },
];

export const fetchFoods = async (searchTerm, currentPage) => {
  try {
    const response = await axios.post(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${API_KEY}`,
      {
        query: searchTerm,
        dataType: ["SR Legacy"],
        sortBy: "dataType.keyword",
        sortOrder: "asc",
        pageNumber: currentPage,
        pageSize: 10,
      }
    );
    return response;
  } catch (error) {
    console.error("Error fetching search results:", error);
    throw error;
  }
};

export const fetchNutrients = async (searchId) => {
  try {
    const response = await axios.get(
      `https://api.nal.usda.gov/fdc/v1/food/${searchId}?api_key=${API_KEY}`
    );

    //filter out unnecessary nutrients
    const objects = response.data.foodNutrients.filter((foodNutrient) => {
      return inputs.some((input) => input.id == foodNutrient.nutrient.id);
    });

    //restructure output
    const nutrients = objects.map((object) => {
      var nutrient = new Nutrient();
      inputs.map((input) => {
        if (object.nutrient.id === input.id) {
          nutrient = new Nutrient(
            input.id,
            input.name,
            object.amount,
            input.unit
          );
        }
      });
      return nutrient;
    });
    return nutrients;
  } catch (error) {
    console.log("error", error);
  }
};

export const fetchServingSizeOptions = async (
  fdcId,
  selectedFoodServingSizeUnitValue,
  selectedFoodServingSizeUnit
) => {
  try {
    const response = await axios.get(
      `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${API_KEY}`
    );
    console.log(response);
    const servingSizeOptions = response.data.foodPortions.map(
      (servingOption) => {
        // get the values needed
        const foodServingSizeUnitValue = servingOption.amount;
        const foodServingSizeUnit = servingOption.modifier;
        const foodServingSizeGramValue = servingOption.gramWeight;

        console.log(foodServingSizeUnit);
        console.log(selectedFoodServingSizeUnit);
        return {
          // serving size info for updating of database when selected
          foodServingSizeUnitValue: foodServingSizeUnitValue,
          foodServingSizeUnit: foodServingSizeUnit,
          foodServingSizeGramValue: foodServingSizeGramValue,
          value: `${foodServingSizeUnitValue} ${foodServingSizeUnit} (${foodServingSizeGramValue}g)`,
          label: `${foodServingSizeUnitValue} ${foodServingSizeUnit} (${foodServingSizeGramValue}g)`, // Combine for display
          selected:
            foodServingSizeUnitValue === selectedFoodServingSizeUnitValue &&
            foodServingSizeUnit === selectedFoodServingSizeUnit, // Indicate selected option
        };
      }
    );
    console.log(servingSizeOptions);
    return servingSizeOptions;
  } catch (error) {
    console.log("error", error);
  }
};

// function to get nutrition data for given user and date
export const fetchFoodEntryByDate = async (foodDate) => {
  try {
    const response = await axios.get(
      `http://localhost:9013/entry/date?keycloakId=${keycloakId}&foodDate=${foodDate}`,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error fetching nutrition data:", error);
    throw error;
  }
};

// function to create new nutrition data
export const createFoodEntry = async (foodEntry) => {
  try {
    console.log(foodEntry);
    const response = await axios.post(
      `http://localhost:9013/entry/create`,
      foodEntry,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error deleting nutrition data:", error);
    throw error;
  }
};

// function to update existing food entry
export const updateFoodEntry = async (foodEntry) => {
  try {
    console.log(foodEntry);
    const response = await axios.put(
      `http://localhost:9013/entry/update`,
      foodEntry,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error deleting nutrition data:", error);
    throw error;
  }
};

// function to delete existing food entry
export const deleteFoodEntryById = async (id) => {
  try {
    const response = await axios.delete(`http://localhost:9013/entry/delete`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: id,
    });
    return response;
  } catch (error) {
    console.error("Error deleting nutrition data:", error);
    throw error;
  }
};
