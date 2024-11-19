import React, { useState, useEffect, useContext } from "react";
import { fetchNutrients, fetchServingSizeOptions } from "../../api/FDCApi";

import nutrition from "../../constants/nutrition.json";

import { createFoodEntry } from "../../api/EngineApi";
import { calculateFoodNutrients } from "../FoodDiary/FoodDiary";
import Table from "../Table/Table";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Snackbar,
} from "@mui/material";
import dayjs from "dayjs";
import DateSelector from "../DateSelector/DateSelector";
import { AuthContext } from "../../context/AuthContext";

export default function NutritionDisplay({ selectedFood, onAddToDiary }) {
  const columns = [
    { label: "Nutrient Name", field: "id" },
    { label: "Amount", field: "amount" },
    { label: "%Daily Value", field: "dailyAmt" },
  ];

  const { decodedToken, isLogin } = useContext(AuthContext);
  const keycloakId = decodedToken?.sub ?? null;
  const age = decodedToken?.age ?? null;

  const { nutritionUnits, recommendedDefault, recommendedByAgeGroup } =
    nutrition;
  const recommendedNutrients = isLogin
    ? recommendedByAgeGroup[age]
    : recommendedDefault;

  const [rows, setRows] = useState([]);
  const [nutrients, setNutrients] = useState();

  const fdcId = selectedFood.id;
  const foodName = selectedFood.description;
  const [foodDate, setFoodDate] = useState(dayjs());
  const [foodMeal, setFoodMeal] = useState("Breakfast");
  const [foodServingQty, setFoodServingQty] = useState(1);
  const [servingSizeOptions, setServingSizeOptions] = useState([]);
  const [selectedServingSize, setSelectedServingSize] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  // ------------ helper functions
  // get the numerical value "123" from the full display "123mg"
  function convertAmount(amountStr) {
    // Remove the unit (e.g., "mg") using regex or string manipulation
    const numericStr = amountStr.replace(/[^\d.-]/g, ""); // Removes everything except digits, decimal points, and negative sign
    // Convert the cleaned string to a number
    const amountValue = parseFloat(numericStr); // Use parseFloat to handle decimal numbers
    return amountValue; // This will be a number (e.g., 4447.52)
  }

  function calculateDailyAmtValues(foodNutrients) {
    const dailyAmtValues = foodNutrients.map((nutrient) => {
      // recommended based on user age group

      const matchedNutrient = recommendedNutrients.find(
        (recommended) => nutrient.name === recommended.name
      );
      let dailyAmt = "";
      if (matchedNutrient) {
        // Calculate nutrient's daily amount (percentage)
        dailyAmt = Number(
          convertAmount(nutrient.amount) / matchedNutrient.recommendedAmt
        ).toLocaleString(undefined, {
          style: "percent",
          minimumFractionDigits: 1,
        });
      }

      return {
        name: nutrient.name,
        dailyAmt: dailyAmt,
      };
    });
    return dailyAmtValues;
  }

  function setRowsUtility(foodNutrients, dailyAmtValues) {
    // Update rows with new nutrient values and daily amounts
    setRows((prevRows) =>
      prevRows.map((row) => {
        const updatedNutrient = foodNutrients.find(
          (foodNutrient) => foodNutrient.name === row.id
        )?.amount;
        const updatedDailyAmt = dailyAmtValues.find(
          (dailyAmt) => dailyAmt.name === row.id
        )?.dailyAmt;

        return {
          ...row,
          amount: updatedNutrient ? updatedNutrient : "",
          dailyAmt: updatedDailyAmt ? updatedDailyAmt : "",
        };
      })
    );
  }

  // ------------ Main Function called during first load
  const searchNutrients = async () => {
    try {
      // get nutrient objects with the base nutrient values
      const nutrients = await fetchNutrients(fdcId);
      setNutrients(nutrients);

      // Fetch serving size options
      const servingSizeOptions = (await fetchServingSizeOptions(fdcId)).map(
        (item, index) => ({
          ...item,
          selected: index === 0, // Set first item as selected by default
        })
      );
      setServingSizeOptions(servingSizeOptions);

      // Set the default value for the selected
      setSelectedServingSize(servingSizeOptions[0].value);

      // Calculate nutrients with initial serving size
      const foodNutrients = calculateFoodNutrients(
        nutrients,
        servingSizeOptions[0].foodServingSizeGramValue,
        foodServingQty
      );
      // calculate daily amount values
      const dailyAmtValues = calculateDailyAmtValues(foodNutrients);

      // update rows display
      setRows(
        nutrients.map((nutrient) => ({
          id:
            nutrient.name +
            ", " +
            nutritionUnits.find(
              (nutritionUnit) => nutritionUnit.name === nutrient.name
            )?.unit,
          amount:
            foodNutrients.find(
              (foodNutrient) => foodNutrient.name === nutrient.name
            )?.amount || "",
          dailyAmt: dailyAmtValues.find(
            (dailyAmt) => dailyAmt.name === nutrient.name
          )?.dailyAmt,
        }))
      );
    } catch (error) {
      console.error("error retrieving nutrients:", error);
    }
  };

  // ------------ Function called to update the nutrition value when serving qty or servingsizedisplay changes
  const updateNutritionDisplay = () => {
    // get current serving size related values
    const selectedFoodServingSizeGramValue = servingSizeOptions.find(
      (option) => option.selected
    ).foodServingSizeGramValue;

    // get updated food nutrients values
    const foodNutrients = calculateFoodNutrients(
      nutrients,
      selectedFoodServingSizeGramValue,
      foodServingQty
    );

    // get updated daily Amt
    const dailyAmtValues = calculateDailyAmtValues(foodNutrients);

    // update display
    setRowsUtility(foodNutrients, dailyAmtValues);
  };

  // ------------ handlers for user input change
  const handleTextChange = async (event) => {
    setFoodServingQty(event.target.value);
  };

  const handleSelectChange = (event) => {
    const newValue = event.target.value;
    setSelectedServingSize(newValue);
    setServingSizeOptions((prevOptions) =>
      prevOptions.map((option) => ({
        ...option,
        selected: option.value === newValue, // Set selected to true if match, false otherwise
      }))
    );
  };

  const handleSelectFoodMealChange = (event) => {
    setFoodMeal(event.target.value);
  };

  const handleDateChange = (date) => {
    setFoodDate(date);
  };

  // ------------ Modal and snackbar handlers
  const handleAddToDiaryClick = () => {
    setIsModalOpen(true); // Open the modal
  };

  const handleAddToDiary = async () => {
    try {
      await createFoodEntry({
        keycloakId,
        fdcId: fdcId,
        foodDate: foodDate,
        foodMeal: foodMeal,
        foodName: foodName,
        foodServingQty: foodServingQty,
        foodServingSizeUnitValue: servingSizeOptions?.find(
          (option) => option.selected
        )?.foodServingSizeUnitValue,
        foodServingSizeUnit: servingSizeOptions?.find(
          (option) => option.selected
        )?.foodServingSizeUnit,
        foodServingSizeGramValue: servingSizeOptions?.find(
          (option) => option.selected
        )?.foodServingSizeGramValue,
        createdOn: Date.now(),
      });
      onAddToDiary(foodDate);

      setShowSnackbar(true); // Show success notification
    } catch (error) {
      console.error("Error adding to diary:", error);
      throw error;
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false); // Close the snackbar
  };

  // call during first load of selected food
  useEffect(() => {
    if (selectedFood) {
      searchNutrients();
      setFoodServingQty(1);
    }
  }, [selectedFood]);

  // call when qty or servingsize change to update nutrition display
  useEffect(() => {
    if (rows.length !== 0) {
      updateNutritionDisplay();
    }
  }, [foodServingQty, selectedServingSize]);

  return (
    <Box sx={{ padding: 3 }}>
      <h1>{foodName}</h1>
      <>
        <TextField
          value={foodServingQty}
          onChange={handleTextChange}
          label="no. of serving"
          variant="outlined"
        />
        <Select
          value={selectedServingSize}
          label="Serving Size"
          onChange={handleSelectChange}
        >
          {servingSizeOptions.map((option) => (
            <MenuItem key={option.label} value={option.value}>
              {option.value}
            </MenuItem>
          ))}
        </Select>
        {keycloakId !== null && (
          <Button variant="contained" onClick={handleAddToDiaryClick}>
            Add to diary
          </Button>
        )}
      </>
      <Dialog open={isModalOpen} onClose={closeModal}>
        <DialogTitle>Add to Diary</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box>Date</Box>
            </Grid>
            <Grid item xs={6}>
              <Box>
                <DateSelector date={foodDate} onDateChange={handleDateChange} />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box>Meal Type</Box>
            </Grid>
            <Grid item xs={6}>
              <Box>
                <Select
                  value={foodMeal}
                  label="Serving Size"
                  onChange={handleSelectFoodMealChange}
                >
                  <MenuItem value={"Breakfast"}>Breakfast</MenuItem>
                  <MenuItem value={"Lunch"}>Lunch</MenuItem>
                  <MenuItem value={"Dinner"}>Dinner</MenuItem>
                  <MenuItem value={"Snack"}>Snack</MenuItem>
                </Select>
              </Box>
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ marginTop: 4 }}>
            <Grid item xs={12}>
              <Box>Food Name: {foodName}</Box>
            </Grid>
            <Grid item xs={6}>
              <Box>No. of serving</Box>
            </Grid>
            <Grid item xs={6}>
              <Box>
                <TextField
                  value={foodServingQty}
                  onChange={handleTextChange}
                  variant="outlined"
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box>Selected Serving Size</Box>
            </Grid>
            <Grid item xs={6}>
              <Box>
                <Select
                  value={selectedServingSize}
                  label="Serving Size"
                  onChange={handleSelectChange} // Now updates selectedServingSize
                >
                  {servingSizeOptions.map((option) => (
                    <MenuItem key={option.label} value={option.value}>
                      {option.value}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddToDiary} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Successfully added to diary"
      />

      <Table columns={columns} rows={rows} />
    </Box>
  );
}
