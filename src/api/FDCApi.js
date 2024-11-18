import Nutrient from "../objects/Nutrient";
import { fdcAxiosInstance } from "./KeycloakApi";
import nutrition from "../constants/nutrition.json";

const { nutritionUnits, recommendedDefault, recommendedByAgeGroup } = nutrition;
// console.log(nutritionUnits);

// to remove inputs after all changes are done
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
    const response = await fdcAxiosInstance.post(`/foods/search`, {
      query: searchTerm,
      dataType: ["SR Legacy"],
      sortBy: "dataType.keyword",
      sortOrder: "asc",
      pageNumber: currentPage,
      pageSize: 10,
    });
    return response;
  } catch (error) {
    console.error("Error fetching search results:", error);
    throw error;
  }
};

export const fetchNutrients = async (searchId) => {
  try {
    const response = await fdcAxiosInstance.get(`/food/${searchId}`);

    //filter out unnecessary nutrients
    const objects = response.data.foodNutrients.filter((foodNutrient) => {
      return recommendedDefault.some(
        (recommended) => recommended.id == foodNutrient.nutrient.id
      );
    });

    //restructure output
    const nutrients = objects.map((object) => {
      var nutrient = new Nutrient();
      nutritionUnits.map((nutritionUnit) => {
        if (object.nutrient.id === nutritionUnit.id) {
          nutrient = new Nutrient(
            nutritionUnit.id,
            nutritionUnit.name,
            object.amount,
            nutritionUnit.unit
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
    const response = await fdcAxiosInstance.get(`/food/${fdcId}`);
    const servingSizeOptions = response.data.foodPortions.map(
      (servingOption) => {
        // get the values needed
        const foodServingSizeUnitValue = servingOption.amount;
        const foodServingSizeUnit = servingOption.modifier;
        const foodServingSizeGramValue = servingOption.gramWeight;

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
    return servingSizeOptions;
  } catch (error) {
    console.log("error", error);
  }
};
