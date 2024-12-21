import React, { useState, useEffect, useContext } from "react";
import nutrition from "../../constants/nutrition.json";
import { fetchNutrients, fetchServingSizeOptions } from "../../api/FDCApi";
import { createFoodEntry } from "../../api/EngineApi";
import { calculateFoodNutrients } from "../FoodDiary/FoodDiary";
import "./NutritionDisplay.scss";
import "../TextField/TextField.scss";
import "../Button/Button.scss";
import "../Dialog/Dialog.scss";
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
  InputLabel,
  FormControl,
} from "@mui/material";
import dayjs from "dayjs";
import DateSelector from "../DateSelector/DateSelector";
import { AuthContext } from "../../context/AuthContext";

export default function NutritionDisplay({ selectedFood, onAddToDiary }) {
  const columns = [
    { label: "Nutrient Name", field: "displayName" },
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
          (foodNutrient) => foodNutrient.name === row.name
        )?.amount;
        const updatedDailyAmt = dailyAmtValues.find(
          (dailyAmt) => dailyAmt.name === row.name
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
          name: nutrient.name,
          displayName:
            nutrient.name +
            " (" +
            nutritionUnits.find(
              (nutritionUnit) => nutritionUnit.name === nutrient.name
            )?.unit +
            ")",
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
  }, [foodServingQty, selectedServingSize, decodedToken]);

  return (
    <Box className="nutrition-display-container" sx={{ padding: 3 }}>
      <h1>{foodName}</h1>
      <div className="nutrition-display-inputs">
        <TextField
          className="primary-textfield nutrition-display-textfield"
          value={foodServingQty}
          onChange={handleTextChange}
          label="Serving"
          variant="outlined"
        />
        <FormControl className="serving-select">
          <InputLabel>Serving Size</InputLabel>
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
        </FormControl>
        {keycloakId !== null && (
          <Button
            className="primary-button add-to-diary-button"
            variant="contained"
            onClick={handleAddToDiaryClick}
          >
            Add to diary
          </Button>
        )}
      </div>
      <div>
        <Dialog
          className="nutrition-display-form"
          open={isModalOpen}
          onClose={closeModal}
        >
          <DialogTitle>Add to Diary</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <DateSelector date={foodDate} onDateChange={handleDateChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  disabled
                  label="Food Name"
                  className="primary-textfield foodName"
                  value={foodName}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl>
                  <InputLabel className="primary-select-label">
                    Meal Type
                  </InputLabel>
                  <Select
                    label="Meal Type"
                    className="primary-select mealType"
                    value={foodMeal}
                    onChange={handleSelectFoodMealChange}
                  >
                    <MenuItem value={"Breakfast"}>Breakfast</MenuItem>
                    <MenuItem value={"Lunch"}>Lunch</MenuItem>
                    <MenuItem value={"Dinner"}>Dinner</MenuItem>
                    <MenuItem value={"Snack"}>Snack</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={2.5}>
                <Box>
                  <TextField
                    label="Serving"
                    className="primary-textfield servingTextField"
                    value={foodServingQty}
                    onChange={handleTextChange}
                    variant="outlined"
                  />
                </Box>
              </Grid>

              <Grid item xs={5.5}>
                <FormControl className="servingSize">
                  <InputLabel className="primary-select-label">
                    Serving Size
                  </InputLabel>
                  <Select
                    label="Serving Size"
                    className="primary-select"
                    value={selectedServingSize}
                    onChange={handleSelectChange}
                  >
                    {servingSizeOptions.map((option) => (
                      <MenuItem key={option.label} value={option.value}>
                        {option.value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              className="cancelButton"
              onClick={closeModal}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              className="primary-button confirm-button"
              onClick={handleAddToDiary}
              variant="contained"
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Successfully added to diary"
      />
      <div className="nutrition-display-table">
        <Table columns={columns} rows={rows} />
      </div>
    </Box>
  );
}
