import axios from "axios";
import Nutrient from "../objects/Nutrient";

const API_KEY = "rOo4DaIsn7eVzqvRnLPSrUA4khrQ3v3pydrAFDVg";

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
  const inputs = [
    { name: "Energy", id: 1008, recommendedAmt: 2600, unit: "kcal" },
    { name: "Total Fat", id: 1004, recommendedAmt: 55, unit: "g" },
    { name: "Cholesterol", id: 1253, recommendedAmt: 300, unit: "mg" },
    { name: "Sodium", id: 1093, recommendedAmt: 2300, unit: "mg" },
    { name: "Total Carbohydrate", id: 1005, recommendedAmt: 300, unit: "g" },
    { name: "Protein", id: 1003, recommendedAmt: 40, unit: "g" }
  ];

  try {
      const response = await axios.get(
        `https://api.nal.usda.gov/fdc/v1/food/${searchId}?api_key=${API_KEY}`
      )
      
      //filter out unnecessary nutrients
      const objects = response.data.foodNutrients.filter((foodNutrient) => {
        return inputs.some(input => input.id == foodNutrient.nutrient.id);
      });

      //restructure output
      const nutrients = objects.map((object) => {
        var nutrient = new Nutrient();
        inputs.map((input) => {
          if(object.nutrient.id === input.id){
            //calculate nutrient's daily amount (percentage)
              //daily amount = total amount/recommended amount * 100%
            const dailyAmt = Number(
              object.amount / input.recommendedAmt
            ).toLocaleString(undefined, {
              style: "percent",
              minimumFractionDigits: 1,
            });
            //restructure
            nutrient = new Nutrient(input.id, input.name, object.amount, dailyAmt, input.unit);
          }
        })
        return nutrient;
      });
      return nutrients;
  } catch (error) {
    console.log("error", error);
  }
};
