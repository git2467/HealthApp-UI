import React, { useState, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import axios from "axios";

function createData(nutrient, amount, amountDaily) {
  return { nutrient, amount, amountDaily };
}

export default function NutritionDisplay({ selectedFood }) {
  const [rows, setRows] = useState([]);
  const nutrientsName = [
    "Energy",
    "Total Fat",
    "Cholesterol",
    "Sodium",
    "Total Carbohydrate",
    "Protein",
  ];
  const nutrientsId = [1008, 1004, 1253, 1093, 1005, 1003];
  const nutrientsAmount = [0, 0, 0, 0, 0, 0];
  const nutrientsAmountDaily = [0, 0, 0, 0, 0, 0];
  // arbitary close values, to be updated later after more discussion/fact check
  const dailyRecommendedAmount = [2600, 55, 300, 2300, 300, 40];
  const nutrientsUnit = ["kcal", "g", "mg", "mg", "g", "g"];

  const getData = async () => {
    try {
      axios
        .get(
          `https://api.nal.usda.gov/fdc/v1/food/${selectedFood}?api_key=rOo4DaIsn7eVzqvRnLPSrUA4khrQ3v3pydrAFDVg`
        )
        .then((res) => {
          var foodNutrients = res.data.foodNutrients;

          // filter api response for the nutrients, but may not be in the order needed
          const filteredNutrients = foodNutrients.filter((foodNutrient) => {
            return nutrientsId.includes(foodNutrient.nutrient.id);
          });

          // loop through filtered nutrients to populate nutrients amount and nutrients amount as % daily value
          filteredNutrients.map((nutrient) => {
            nutrientsId.map((nutrientToSelect, index) => {
              // compare nutrientids to populate the right nutrient amount and daily value
              if (nutrientToSelect == nutrient.nutrient.id) {
                nutrientsAmount[index] = nutrient.amount;
                nutrientsAmountDaily[index] = Number(
                  nutrient.amount / dailyRecommendedAmount[index]
                ).toLocaleString(undefined, {
                  style: "percent",
                  minimumFractionDigits: 1,
                });
              }
            });
          });

          // create array to store the values to display
          const newRows = nutrientsName.map((nutrientName, index) => {
            return createData(
              nutrientName,
              `${nutrientsAmount[index]}${nutrientsUnit[index]}`,
              `${nutrientsAmountDaily[index]}`
            );
          });
          setRows(newRows);
        });
    } catch (error) {
      console.log("error");
    }
  };
  useEffect(() => {
    if (selectedFood) {
      getData();
    }
  }, [selectedFood]);

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Insert Food name</TableCell>
            <TableCell align="right">Amount&nbsp;</TableCell>
            <TableCell align="right">%Daily Value&nbsp;</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.nutrient}
              </TableCell>
              <TableCell align="right">{row.amount}</TableCell>
              <TableCell align="right">{row.amountDaily}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
