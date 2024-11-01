import React, { useState, useEffect } from "react";
import Table from "../Table/Table";
import Button from "../Button/Button";
import dayjs from "dayjs";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { inputs } from "../../api/Api";
import {
  calculateDiaryNutrients,
  deleteFoodEntryById,
  fetchFoodEntryByDate,
  fetchNutrients,
  fetchServingSizeOptions,
  updateFoodEntry,
} from "../../api/Api";

// Also used by nutritiondisplay to calculate
export const calculateFoodNutrients = (
  nutrients,
  servingSizeGramValue,
  servingQty
) => {
  const foodNutrients = nutrients.map((nutrient) => ({
    name: nutrient.name,
    amount:
      Number.parseFloat(
        ((nutrient.amount * servingSizeGramValue) / 100) * servingQty
      ).toFixed(2) + nutrient.unit,
  }));
  return foodNutrients;
};

export default function FoodDiary({ foodDate }) {
  // add a type in column to put as dropdown, or input field
  const columns = [
    { label: "Food Name", field: "foodName" },
    { label: "Serving", field: "foodServingQty", type: "input" },
    { label: "Serving Size", field: "servingSizeDisplay", type: "select" },
    { label: "Energy", field: "energy" },
    { label: "Fat", field: "fat" },
    { label: "Cholesterol", field: "cholesterol" },
    { label: "Sodium", field: "sodium" },
    { label: "Carbohydrate", field: "carbohydrate" },
    { label: "Protein", field: "protein" },
  ];

  const totalColumns = [
    { label: "", field: "text" },
    { label: "Energy", field: "energy" },
    { label: "Fat", field: "fat" },
    { label: "Cholesterol", field: "cholesterol" },
    { label: "Sodium", field: "sodium" },
    { label: "Carbohydrate", field: "carbohydrate" },
    { label: "Protein", field: "protein" },
  ];

  // format the fooddate value
  foodDate = dayjs(foodDate).format("YYYY-MM-DD");

  const [rows, setRows] = useState();
  const [totalRows, setTotalRows] = useState();

  // hardcode for now for update flow
  const keycloakId = "user123";
  // to check no keycloakId

  // HELPER FUNCTIONS
  // Calculate the nutrient amounts based on serving size * serving qty

  const updateFoodNutrients = async (
    row,
    servingSizeGramValue,
    foodServingQty
  ) => {
    try {
      // Fetch the nutrients using the provided fdcId
      const nutrients = await fetchNutrients(row.fdcId);

      // Calculate the nutrient amounts
      const foodNutrients = calculateFoodNutrients(
        nutrients,
        servingSizeGramValue,
        foodServingQty
      );

      // Update row with the updated nutrient values
      const updatedRow = {
        ...row,
        foodServingSizeGramValue: servingSizeGramValue,
        foodServingQty: foodServingQty,
        energy:
          foodNutrients.find((nutrient) => nutrient.name === "Energy")
            ?.amount || "",
        fat:
          foodNutrients.find((nutrient) => nutrient.name === "Total Fat")
            ?.amount || "",
        cholesterol:
          foodNutrients.find((nutrient) => nutrient.name === "Cholesterol")
            ?.amount || "",
        sodium:
          foodNutrients.find((nutrient) => nutrient.name === "Sodium")
            ?.amount || "",
        carbohydrate:
          foodNutrients.find(
            (nutrient) => nutrient.name === "Total Carbohydrate"
          )?.amount || "",
        protein:
          foodNutrients.find((nutrient) => nutrient.name === "Protein")
            ?.amount || "",
      };

      // Return the updated row
      return updatedRow;
    } catch (error) {
      // Handle errors in case the async operation fails
      console.error("Error fetching nutrients:", error);
      return null; // Return null or handle error appropriately
    }
  };

  // function to update groupedrows with an updated row
  const updateGroupedRows = (updatedRow) => {
    setRows((prevRows) => {
      return prevRows.map((mealGroup) => {
        // meal here refers to breakfast/lunch/dinner
        const [meal, ...rowsForMeal] = mealGroup;

        // Search for the row and update the display if true
        const updatedRowsForMeal = rowsForMeal.map((row) =>
          updatedRow.id === row.id ? { ...row, ...updatedRow } : row
        );

        // Return the updated meal group
        return [meal, ...updatedRowsForMeal];
      });
    });
  };

  // function to update database with row data
  const updateFoodEntryDB = async (rowData) => {
    await updateFoodEntry({
      id: rowData.id,
      keycloakId,
      fdcId: rowData.fdcId,
      foodDate: foodDate,
      foodMeal: rowData.foodMeal,
      foodName: rowData.foodName,
      foodServingQty: rowData.foodServingQty,
      foodServingSizeUnitValue: rowData.foodServingSizeUnitValue,
      foodServingSizeUnit: rowData.foodServingSizeUnit,
      foodServingSizeGramValue: rowData.foodServingSizeGramValue,
      createdOn: rowData.createdOn,
    });
  };

  // Function to calculate totals
  const calculateColumnTotals = (rows) => {
    const totals = {
      energy: 0,
      fat: 0,
      cholesterol: 0,
      sodium: 0,
      carbohydrate: 0,
      protein: 0,
    };

    rows.forEach(([meal, ...mealRows]) => {
      mealRows.forEach((row) => {
        totals.energy += parseFloat(row.energy) || 0;
        totals.fat += parseFloat(row.fat) || 0;
        totals.cholesterol += parseFloat(row.cholesterol) || 0;
        totals.sodium += parseFloat(row.sodium) || 0;
        totals.carbohydrate += parseFloat(row.carbohydrate) || 0;
        totals.protein += parseFloat(row.protein) || 0;
      });
    });

    // Round to two decimal places if needed
    for (let key in totals) {
      totals[key] = parseFloat(totals[key].toFixed(2));
    }

    return totals;
  };

  const calculateRemaining = (totals) => {
    console.log(inputs);
    const remaining = {
      energy:
        inputs.find((input) => input.name === "Energy")?.recommendedAmt -
        totals.energy,
      fat:
        inputs.find((input) => input.name === "Total Fat")?.recommendedAmt -
        totals.fat,
      cholesterol:
        inputs.find((input) => input.name === "Cholesterol")?.recommendedAmt -
        totals.cholesterol,
      sodium:
        inputs.find((input) => input.name === "Sodium")?.recommendedAmt -
        totals.sodium,
      carbohydrate:
        inputs.find((input) => input.name === "Total Carbohydrate")
          ?.recommendedAmt - totals.carbohydrate,
      protein:
        inputs.find((input) => input.name === "Protein")?.recommendedAmt -
        totals.protein,
    };
    for (let key in remaining) {
      remaining[key] = parseFloat(remaining[key].toFixed(2));
    }
    return remaining;
  };

  // MAIN FUNCTION
  const updateFoodEntryByDate = async () => {
    try {
      const response = await fetchFoodEntryByDate(foodDate);
      console.log(response.data);

      const updatedRows = await Promise.all(
        response.data.map(async (food) => {
          // Fetch nutrients for the current food item
          const nutrientsResponse = await fetchNutrients(food.fdcId);
          console.log(nutrientsResponse);

          // Calculate the nutrient amounts based on serving size * serving qty
          const foodNutrients = calculateFoodNutrients(
            nutrientsResponse,
            food.foodServingSizeGramValue,
            food.foodServingQty
          );

          // fetch serving size options for the current fooditem
          const servingSizeOptions = await fetchServingSizeOptions(
            food.fdcId,
            food.foodServingSizeUnitValue,
            food.foodServingSizeUnit
          );
          console.log(servingSizeOptions);

          // return the updated rows with food and nutrient data
          return {
            id: food.id,
            fdcId: food.fdcId,
            foodMeal: food.foodMeal,
            foodName: food.foodName,
            foodServingQty: food.foodServingQty,
            foodServingSizeUnitValue: food.foodServingSizeUnitValue,
            foodServingSizeUnit: food.foodServingSizeUnit,
            foodServingSizeGramValue: food.foodServingSizeGramValue,
            createdOn: food.createdOn,
            servingSizeDisplay: servingSizeOptions,
            energy:
              foodNutrients.find((nutrient) => nutrient.name === "Energy")
                ?.amount || "",
            fat:
              foodNutrients.find((nutrient) => nutrient.name === "Total Fat")
                ?.amount || "",
            cholesterol:
              foodNutrients.find((nutrient) => nutrient.name === "Cholesterol")
                ?.amount || "",
            sodium:
              foodNutrients.find((nutrient) => nutrient.name === "Sodium")
                ?.amount || "",
            carbohydrate:
              foodNutrients.find(
                (nutrient) => nutrient.name === "Total Carbohydrate"
              )?.amount || "",
            protein:
              foodNutrients.find((nutrient) => nutrient.name === "Protein")
                ?.amount || "",
          };
        })
      );

      // grouped into rows with breakfast lunch dinner
      const foodMeals = ["Breakfast", "Lunch", "Dinner", "Snack"];
      const groupedRows = foodMeals.map((meal) => {
        const rowsForMeal = updatedRows.filter(
          (updatedRow) => updatedRow.foodMeal === meal
        );
        return [meal, ...rowsForMeal];
      });

      // Set rows after all nutrient data has been fetched and processed
      setRows(groupedRows);
    } catch (error) {
      console.log("error:", error);
    }
  };

  // update food entries when date changes
  useEffect(() => {
    updateFoodEntryByDate();
    console.log(foodDate);
  }, [foodDate]);

  // update food entries when other thing changes besides date
  useEffect(() => {
    if (rows) {
      // Calculate the totals
      const totals = calculateColumnTotals(rows);
      const remaining = calculateRemaining(totals);
      setTotalRows([
        {
          text: "Total",
          energy: totals.energy,
          fat: totals.fat,
          cholesterol: totals.cholesterol,
          sodium: totals.sodium,
          carbohydrate: totals.carbohydrate,
          protein: totals.protein,
        },
        {
          text: "Goal",
          energy: (totals.energy + remaining.energy).toFixed(2),
          fat: (totals.fat + remaining.fat).toFixed(2),
          cholesterol: (totals.cholesterol + remaining.cholesterol).toFixed(2),
          sodium: (totals.sodium + remaining.sodium).toFixed(2),
          carbohydrate: (totals.carbohydrate + remaining.carbohydrate).toFixed(
            2
          ),
          protein: (totals.protein + remaining.protein).toFixed(2),
        },
        {
          text: "Remaining",
          energy: remaining.energy,
          fat: remaining.fat,
          cholesterol: remaining.cholesterol,
          sodium: remaining.sodium,
          carbohydrate: remaining.carbohydrate,
          protein: remaining.protein,
        },
      ]);
    }
  }, [rows]);

  // EVENT HANDLERS
  const handleDelete = (rowToDeleteId) => {
    // Update row display
    setRows((prevRows) => {
      return prevRows.map((mealGroup) => {
        // meal here refers to breakfast/lunch/dinner
        const [meal, ...rowsForMeal] = mealGroup;

        // Search for the row and update the display if true
        const updatedRowsForMeal = rowsForMeal.filter(
          (row) => row.id !== rowToDeleteId
        );

        // Return the updated meal group
        return [meal, ...updatedRowsForMeal];
      });
    });

    // update database
    try {
      deleteFoodEntryById(rowToDeleteId);
    } catch (error) {
      console.error("Error deleting from database: ", error);
    }
  };

  const handleInputChange = (value, rowToUpdate, fieldToUpdate, changeType) => {
    if (fieldToUpdate == "foodServingQty") {
      (async () => {
        try {
          // Get the current selected serving size gram value
          const servingSizeGramValue = rowToUpdate.servingSizeDisplay.find(
            (option) => option.selected
          ).foodServingSizeGramValue;

          // update input values
          const updatedRow = await updateFoodNutrients(
            rowToUpdate,
            servingSizeGramValue,
            value
          );

          // Update row display
          updateGroupedRows(updatedRow);

          // update database if user exit the input box
          if (changeType == "blur") {
            await updateFoodEntryDB({ ...updatedRow, foodServingQty: value });
          }
        } catch (error) {
          console.error("Failed to update food entry:", error);
        }
      })();
    }

    // servingsize display
    if (fieldToUpdate == "servingSizeDisplay") {
      (async () => {
        try {
          // get servingSizeOptions with nothing selected
          const servingSizeOptions = await fetchServingSizeOptions(
            rowToUpdate.fdcId
          );

          let updatedFields = {};
          // get updated serving size display by setting the new selected value as selected
          const updatedServingSizeDisplay = servingSizeOptions.map((option) => {
            if (option.value == value) {
              option.selected = true;
              updatedFields = {
                foodServingSizeUnitValue: option.foodServingSizeUnitValue,
                foodServingSizeUnit: option.foodServingSizeUnit,
                foodServingSizeGramValue: option.foodServingSizeGramValue,
              };
            }
            return option;
          });

          // calculate the updated nutrient display
          const updatedRow = await updateFoodNutrients(
            // updated row with new serving size display
            {
              ...rowToUpdate,
              servingSizeDisplay: updatedServingSizeDisplay,
            },
            updatedFields.foodServingSizeGramValue,
            rowToUpdate.foodServingQty
          );

          // Update row display
          updateGroupedRows(updatedRow);

          // Update database
          await updateFoodEntryDB({ ...updatedRow, ...updatedFields });
        } catch (error) {
          console.error("Failed to update food entry:", error);
        }
      })();
    }
  };

  return (
    <>
      <h1>Testing</h1>
      <Table
        columns={columns}
        groupedRows={rows}
        onDelete={handleDelete}
        onInputChange={handleInputChange}
      />
      {rows && <Table columns={totalColumns} rows={totalRows} />}
    </>
  );
}