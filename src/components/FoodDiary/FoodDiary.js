import React, { useState, useEffect, useRef, useMemo, useContext } from "react";
import Table from "../Table/Table";
import dayjs from "dayjs";
import { fetchNutrients, fetchServingSizeOptions } from "../../api/FDCApi";
import {
  deleteFoodEntryById,
  fetchFoodEntryByDate,
  updateFoodEntry,
} from "../../api/EngineApi";
import nutrition from "../../constants/nutrition.json";
import { debounce } from "lodash";
import { AuthContext } from "../../context/AuthContext";

// Also used by nutritiondisplay to calculate
export const calculateFoodNutrients = (
  nutrients,
  servingSizeGramValue,
  servingQty
) => {
  const foodNutrients = nutrients.map((nutrient) => ({
    name: nutrient.name,
    amount: Number.parseFloat(
      ((nutrient.amount * servingSizeGramValue) / 100) * servingQty
    ).toFixed(2),
  }));
  return foodNutrients;
};

export default function FoodDiary({ foodDate, key }) {
  foodDate = dayjs(foodDate).format("YYYY-MM-DD");
  const { decodedToken } = useContext(AuthContext);
  const keycloakId = decodedToken.sub;
  const age = decodedToken.age;

  const { nutritionUnits, recommendedByAgeGroup } = nutrition;
  const recommendedNutrients = recommendedByAgeGroup[age];

  // add a type in column to put as dropdown, or input field
  const columns = [
    { label: "Food Name", field: "foodName" },
    { label: "Serving", field: "foodServingQty", type: "input" },
    { label: "Serving Size", field: "servingSizeDisplay", type: "select" },
    {
      label: `Energy, ${
        nutritionUnits.find((nutrient) => nutrient.name === "Energy")?.unit
      }`,
      field: "energy",
    },
    {
      label: `Fat, ${
        nutritionUnits.find((nutrient) => nutrient.name === "Total Fat")?.unit
      }`,
      field: "fat",
    },
    {
      label: `Cholesterol, ${
        nutritionUnits.find((nutrient) => nutrient.name === "Cholesterol")?.unit
      }`,
      field: "cholesterol",
    },
    {
      label: `Sodium, ${
        nutritionUnits.find((nutrient) => nutrient.name === "Sodium")?.unit
      }`,
      field: "sodium",
    },
    {
      label: `Carbohydrate, ${
        nutritionUnits.find(
          (nutrient) => nutrient.name === "Total Carbohydrate"
        )?.unit
      }`,
      field: "carbohydrate",
    },
    {
      label: `Protein, ${
        nutritionUnits.find((nutrient) => nutrient.name === "Protein")?.unit
      }`,
      field: "protein",
    },
  ];

  const totalColumns = [
    { label: "", field: "text" },
    {
      label: `Energy, ${
        nutritionUnits.find((nutrient) => nutrient.name === "Energy")?.unit
      }`,
      field: "energy",
    },
    {
      label: `Fat, ${
        nutritionUnits.find((nutrient) => nutrient.name === "Total Fat")?.unit
      }`,
      field: "fat",
    },
    {
      label: `Cholesterol, ${
        nutritionUnits.find((nutrient) => nutrient.name === "Cholesterol")?.unit
      }`,
      field: "cholesterol",
    },
    {
      label: `Sodium, ${
        nutritionUnits.find((nutrient) => nutrient.name === "Sodium")?.unit
      }`,
      field: "sodium",
    },
    {
      label: `Carbohydrate, ${
        nutritionUnits.find(
          (nutrient) => nutrient.name === "Total Carbohydrate"
        )?.unit
      }`,
      field: "carbohydrate",
    },
    {
      label: `Protein, ${
        nutritionUnits.find((nutrient) => nutrient.name === "Protein")?.unit
      }`,
      field: "protein",
    },
  ];

  const [rows, setRows] = useState();
  const [totalRows, setTotalRows] = useState();

  // HELPER FUNCTIONS
  // Calculate the nutrient amounts based on serving size * serving qty

  const updateFoodNutrients = async (
    row,
    servingSizeGramValue,
    foodServingQty
  ) => {
    try {
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

      return updatedRow;
    } catch (error) {
      console.error("Error updating food nutrients:", error);
      return null;
    }
  };

  const updateGroupedRows = (updatedRow) => {
    setRows((prevRows) => {
      return prevRows.map((mealGroup) => {
        // meal here refers to breakfast/lunch/dinner
        const [meal, ...rowsForMeal] = mealGroup;

        // Search for the row and update the display if true
        const updatedRowsForMeal = rowsForMeal.map((row) =>
          updatedRow.id === row.id ? { ...row, ...updatedRow } : row
        );
        return [meal, ...updatedRowsForMeal];
      });
    });
  };

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
    const remaining = {
      energy:
        recommendedNutrients.find(
          (recommended) => recommended.name === "Energy"
        )?.recommendedAmt - totals.energy,
      fat:
        recommendedNutrients.find(
          (recommended) => recommended.name === "Total Fat"
        )?.recommendedAmt - totals.fat,
      cholesterol:
        recommendedNutrients.find(
          (recommended) => recommended.name === "Cholesterol"
        )?.recommendedAmt - totals.cholesterol,
      sodium:
        recommendedNutrients.find(
          (recommended) => recommended.name === "Sodium"
        )?.recommendedAmt - totals.sodium,
      carbohydrate:
        recommendedNutrients.find(
          (recommended) => recommended.name === "Total Carbohydrate"
        )?.recommendedAmt - totals.carbohydrate,
      protein:
        recommendedNutrients.find(
          (recommended) => recommended.name === "Protein"
        )?.recommendedAmt - totals.protein,
    };
    for (let key in remaining) {
      remaining[key] = parseFloat(remaining[key].toFixed(2));
    }
    return remaining;
  };

  // MAIN FUNCTION
  const updateFoodEntryByDate = async () => {
    try {
      const response = await fetchFoodEntryByDate(foodDate, keycloakId);
      const updatedRows = await Promise.all(
        response.data.map(async (food) => {
          // Fetch nutrients for the current food item
          const nutrientsResponse = await fetchNutrients(food.fdcId);

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
      console.error("error:", error);
    }
  };

  // update food entries when date changes
  useEffect(() => {
    if (foodDate !== null) {
      updateFoodEntryByDate();
    }
  }, [foodDate, key]);

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
  }, [rows, decodedToken]);

  // EVENT HANDLERS
  const handleDelete = (rowToDeleteId) => {
    setRows((prevRows) => {
      return prevRows.map((mealGroup) => {
        const [meal, ...rowsForMeal] = mealGroup;
        // Search for the row and update the display if true
        const updatedRowsForMeal = rowsForMeal.filter(
          (row) => row.id !== rowToDeleteId
        );
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

  // usedebounce hook to delay execution by specified delay
  const useDebounce = (callback, delay = 500) => {
    const callbackRef = useRef(callback);

    // Update the ref when the callback changes
    useEffect(() => {
      callbackRef.current = callback;
    }, [callback]);

    return useMemo(() => {
      // Return a debounced function that returns a promise
      const debouncedFunction = debounce(
        (...args) => callbackRef.current(...args),
        delay
      );

      return (...args) =>
        new Promise((resolve, reject) => {
          debouncedFunction(...args)
            .then(resolve)
            .catch(reject);
        });
    }, [delay]);
  };

  const debouncedRequest = useDebounce(async (rowToUpdate, foodServingQty) => {
    try {
      // Get the current selected serving size gram value
      const servingSizeGramValue = rowToUpdate.servingSizeDisplay.find(
        (option) => option.selected
      ).foodServingSizeGramValue;

      // Update nutrients based on the current foodServingQty
      const updatedRow = await updateFoodNutrients(
        rowToUpdate,
        servingSizeGramValue,
        foodServingQty
      );
      updateGroupedRows(updatedRow);
      return updatedRow;
    } catch (error) {
      console.error("Error updating food nutrients:", error);
    }
  });

  const handleInputChange = async (
    value,
    rowToUpdate,
    fieldToUpdate,
    changeType
  ) => {
    if (fieldToUpdate == "foodServingQty") {
      // update row with the changed serving size qty (without updating the nutrient display)
      setRows((prevRows) => {
        return prevRows.map((mealGroup) => {
          const [meal, ...rowsForMeal] = mealGroup;
          const updatedRowsForMeal = rowsForMeal.map((row) => {
            if (row.id === rowToUpdate.id) {
              return {
                ...row,
                foodServingQty: value,
              };
            }
            return row;
          });
          return [meal, ...updatedRowsForMeal];
        });
      });
      try {
        // recalculate and update nutrient display every xx seconds
        const updatedRow = await debouncedRequest(rowToUpdate, value);
        // update database if user exit the input box
        if (changeType == "blur") {
          await updateFoodEntryDB({ ...updatedRow, foodServingQty: value });
        }
      } catch (error) {
        console.error("Error updating food quantity in database: ", error);
      }
    }

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
            {
              ...rowToUpdate,
              servingSizeDisplay: updatedServingSizeDisplay,
            },
            updatedFields.foodServingSizeGramValue,
            rowToUpdate.foodServingQty
          );

          // Update row display and database
          updateGroupedRows(updatedRow);
          await updateFoodEntryDB({ ...updatedRow, ...updatedFields });
        } catch (error) {
          console.error(
            "Error updating food serving size selection in database: ",
            error
          );
        }
      })();
    }
  };

  return (
    <>
      <h1>Food Diary</h1>
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
