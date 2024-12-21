import React, { useState } from "react";
import "./Table.scss";
import "../Button/Button.scss";

import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Pagination,
  TextField,
  Select,
  MenuItem,
  Button,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

export default function Table({
  columns,
  rows,
  groupedRows,
  count,
  page,
  onPageChange,
  onRowSelected,
  isHover,
  onDelete,
  onInputChange,
  hideHeader,
  showVertBorders,
}) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const handlePageChange = (page) => {
    onPageChange(page);
  };

  const handleRowClick = (row) => {
    if (onRowSelected != null) {
      onRowSelected(row);
    }
  };

  const handleCloseDeleteModal = () => {
    setRowToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleConfirmDelete = () => {
    onDelete(rowToDelete);
    setRowToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleDeleteClick = (event, rowToDelete) => {
    setRowToDelete(rowToDelete.id);
    setDeleteModalOpen(true);
  };

  const handleTextChange = (event, row, field) => {
    onInputChange(event.target.value, row, field);
  };

  // blur lets parent component know that user has exited the textfield
  const handleTextBlur = (event, row, field) => {
    onInputChange(event.target.value, row, field, "blur");
  };

  const handleSelectChange = (event, row, field) => {
    onInputChange(event.target.value, row, field);
  };

  return (
    <>
      <TableContainer
        className="tableContainer"
        component={Paper}
        sx={{ marginTop: 2 }}
      >
        <MuiTable>
          {!hideHeader && (
            <TableHead className="tableHead">
              <TableRow>
                {columns?.map((column) => (
                  <TableCell
                    className="tableCell"
                    sx={{
                      width: column?.sx?.width || "auto",
                      backgroundColor: `${column?.sx?.headerBackgroundColor} !important`,
                      textAlign: column?.sx?.textAlign,
                      flex: column?.sx?.flex,
                      border: showVertBorders
                        ? groupedRows
                          ? "1px solid white"
                          : "1px solid rgb(242,242,242)"
                        : "none",
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
                {onDelete != null && (
                  <TableCell
                    className="tableCell"
                    sx={{ width: "102px", backgroundColor: "white" }}
                  >
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {/* Unified row rendering logic for both groupedRows and normal rows */}
            {(groupedRows ?? rows)?.map((groupedRow, groupedIndex) => {
              const isGrouped = Array.isArray(groupedRow); // Check if it's groupedRows

              // transform into array if input is not array
              const rowList = isGrouped ? groupedRow : [groupedRow];

              return rowList.map((row, rowIndex) => (
                <TableRow
                  key={isGrouped ? `${groupedIndex}-${rowIndex}` : row.id}
                  className={`tableRow ${isHover ? "hover" : "no-hover"}`}
                  hover={isHover}
                  onClick={() => handleRowClick(row)}
                >
                  {/* Render header for first row in groupedRows */}
                  {isGrouped && rowIndex === 0 ? (
                    <TableCell
                      className="tableGroupedRowHeader"
                      colSpan={columns.length + 1}
                    >
                      {row}
                    </TableCell>
                  ) : (
                    <>
                      {columns.map((column, index) => (
                        <TableCell
                          className={`${isGrouped ? "tableGroupedRow" : ""}`}
                          sx={{
                            width: column?.sx?.width || "auto",
                            flex: column?.sx?.flex,
                            border: showVertBorders
                              ? groupedRows
                                ? "1px solid white !important"
                                : "1px solid #CAEECF"
                              : "none",
                            backgroundColor:
                              index === 0 && hideHeader && "#CAEECF",
                            fontWeight: index === 0 && hideHeader && "bold",
                            textAlign: column?.sx?.textAlign,
                          }}
                          key={column.field}
                        >
                          {/* Render based on column type */}
                          {column.type === "input" ? (
                            <TextField
                              className="primary-textfield"
                              value={row[column.field]}
                              onChange={(event) =>
                                handleTextChange(event, row, column.field)
                              }
                              onBlur={(event) =>
                                handleTextBlur(event, row, column.field)
                              }
                            />
                          ) : column.type === "select" ? (
                            <Select
                              className="primary-select"
                              value={
                                row[column.field]?.find(
                                  (option) => option.selected
                                )?.value
                              }
                              onChange={(event) =>
                                handleSelectChange(event, row, column.field)
                              }
                            >
                              {row[column.field]?.map((option) => (
                                <MenuItem
                                  key={option.label}
                                  value={option.value}
                                >
                                  {option.value}
                                </MenuItem>
                              ))}
                            </Select>
                          ) : (
                            row[column.field] // Default case: Render the cell value as text
                          )}
                        </TableCell>
                      ))}
                      {onDelete != null && (!isGrouped || rowIndex !== 0) && (
                        <TableCell
                          className={`actionContainer ${
                            isGrouped ? "tableGroupedRow" : ""
                          }`}
                        >
                          <Button
                            className="iconButtons tableGroupedRowButton"
                            variant="outlined"
                            onClick={(event) => handleDeleteClick(event, row)}
                          >
                            <DeleteIcon className="deleteIcon" />
                          </Button>
                        </TableCell>
                      )}
                    </>
                  )}
                </TableRow>
              ));
            })}
          </TableBody>
        </MuiTable>
        <Dialog open={deleteModalOpen} onClose={handleCloseDeleteModal}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <p>Are you sure you want to delete this food diary entry? </p>
          </DialogContent>
          <DialogActions>
            <Button
              className="cancelButton"
              onClick={handleCloseDeleteModal}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </TableContainer>
      {onPageChange != null && (
        <Pagination
          count={count}
          page={page}
          onChange={(event, value) => handlePageChange(value)}
          sx={{ marginTop: 2, display: "flex", justifyContent: "center" }}
        />
      )}
    </>
  );
}
