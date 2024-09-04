import React, { useState, useEffect } from "react";
import { fetchNutrients } from "../../api/Api";
import Table from "../Table/Table";
import { Box } from "@mui/material";

const columns = [
  { label: "Nutrient Name", field: "id" },
  { label: "Amount (/100g)", field: "amount" },
  { label: "%Daily Value", field: "dailyAmt" }
];

export default function NutritionDisplay({ selectedFood }) {
  const [rows, setRows] = useState([]);

  const searchNutrients = async () => {
    try {
      const response = await fetchNutrients(selectedFood.id);
      setRows(response.map((nutrient)=>{
        return {
          id: nutrient.name,
          amount: nutrient.amount + nutrient.unit,
          dailyAmt: nutrient.dailyAmt
        }
      }))
    } catch (error){
      console.log("error:", error);
    }
  };

  useEffect(() => {
    if (selectedFood) {
      searchNutrients();
    }
  }, [selectedFood]);

  return (
    <Box sx={{ padding: 3 }}>
      <h1>{selectedFood.description}</h1>
      <Table columns={columns} rows={rows} />
    </Box>
  )
}
