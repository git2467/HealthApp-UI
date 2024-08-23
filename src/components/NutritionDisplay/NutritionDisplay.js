import * as React from "react";
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

const nutrientDataMap = {
  energy: [86, "KJ"],
  totalFat: [204, "G"],
  cholesterol: [601, "MG"],
  sodium: [307, "MG"],
  carbohydrate: [205, "G"],
  protein: [203, "G"],
};

const rows = [
  createData("Energy", 159, 6.0),
  createData("Total Fat", 159, 6.0),
  createData("Cholesterol", 237, 9.0),
  createData("Sodium", 262, 16.0),
  createData("Total Carbohydrate", 305, 3.7),
  createData("Protein", 356, 16.0),
];

export default function NutritionDisplay({ selectedFood }) {
  console.log(nutrientDataMap.totalFat[0]);
  console.log(selectedFood);

  try {
    var data = {
      query: "Cheddar cheese",
      dataType: ["Foundation", "SR Legacy"],
      pageSize: 25,
      pageNumber: 2,
      sortBy: "dataType.keyword",
      sortOrder: "asc",
    };
    axios
      // https://fdc.nal.usda.gov/portal-data/external/173858
      .post(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=rOo4DaIsn7eVzqvRnLPSrUA4khrQ3v3pydrAFDVg`,
        data
      )
      .then((res) => {
        // console.log(res);
        // console.log(res.data);
        // console.log(res.data.foods);
      });
  } catch (error) {
    console.log("error");
  }

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
