import React, { useState, useEffect } from "react";
import { fetchFoods } from "../../api/FDCApi";
import Table from "../Table/Table";
import "../TextField/TextField.scss";

import { TextField, CircularProgress, Box } from "@mui/material";

export default function Search({ onRowSelected }) {
  const columns = [
    { label: "Food Name", field: "description" },
    { label: "FDC ID", field: "id" },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState();
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);

  const searchFoods = async () => {
    setLoading(true);
    try {
      const response = await fetchFoods(searchTerm, page);
      setCount(response.data.totalPages);
      setPage(response.data.currentPage);
      setRows(
        response.data.foods.map((food) => {
          return {
            id: food.fdcId,
            description: food.description,
          };
        })
      );
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm != "") {
      searchFoods(searchTerm, page);
    }
  }, [searchTerm, page]);

  return (
    <div className="searchContainer">
      <Box sx={{ padding: 3 }}>
        <h1>Search Food</h1>
        <TextField
          className="primary-textfield"
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ marginBottom: 2 }}
          fullWidth
        />
        {loading ? (
          <Box
            sx={{ display: "flex", justifyContent: "center", marginTop: 40 }}
          >
            <CircularProgress />
          </Box>
        ) : (
          searchTerm && (
            <Table
              columns={columns}
              rows={rows}
              count={count}
              page={page}
              onPageChange={setPage}
              onRowSelected={onRowSelected}
              isHover={true}
            />
          )
        )}
      </Box>
    </div>
  );
}
