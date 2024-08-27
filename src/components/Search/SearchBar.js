import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Pagination,
  CircularProgress,
  Box,
} from '@mui/material';

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const searchData = async (query = searchTerm, pageNumber = currentPage) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=rOo4DaIsn7eVzqvRnLPSrUA4khrQ3v3pydrAFDVg`,
        {
          query,
          dataType: ['SR Legacy'],
          sortBy: 'dataType.keyword',
          sortOrder: 'asc',
          pageNumber,
        }
      );

      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
      setSearchResults(response.data.foods);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchData(searchTerm, currentPage);
  }, [searchTerm, currentPage]);

  return (
    <Box sx={{ padding: 3 }}>
      <h1>Food Nutrient</h1>
      <TextField
        label="Search for food..."
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ marginBottom: 2 }}
      />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
          <CircularProgress />
        </Box>
      ) : ( searchTerm && (
        <>
          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Food Name</TableCell>
                  <TableCell>FDC ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchResults.map((searchResult) => (
                  <TableRow key={searchResult.fdcId}>
                    <TableCell>{searchResult.description}</TableCell>
                    <TableCell>{searchResult.fdcId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            sx={{ marginTop: 2, display: 'flex', justifyContent: 'center' }}
          />
        </>
      )
    )}
  </Box>
);
;}
