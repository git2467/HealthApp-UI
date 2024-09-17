import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Search from "../components/Search/Search";
import NutritionDisplay from "../components/NutritionDisplay/NutritionDisplay";
import { fetchFoods, fetchNutrients } from "../api/Api";
import userEvent from "@testing-library/user-event";

jest.mock("../api/Api", () => ({
  fetchFoods: jest.fn(),
  fetchNutrients: jest.fn(),
}));

describe("Search Component", () => {
  const success = () => {
    fetchFoods.mockResolvedValueOnce({
      data: {
        totalPages: 2,
        currentPage: 1,
        foods: [
          { fdcId: 1, description: "Apple" },
          { fdcId: 2, description: "Banana" },
        ],
      },
    });

    render(<Search onRowSelected={jest.fn()} />);

    const searchInput = screen.getByLabelText(/Search/i);
    fireEvent.change(searchInput, { target: { value: "fruit" } });
  };

  it("renders Search component", () => {
    success();
    expect(screen.getByText(/Search food/i)).toBeInTheDocument();
  });

  it("displays data in Search component", async () => {
    success();
    await waitFor(() => {
      expect(screen.getByText(/Apple/i)).toBeInTheDocument();
      expect(screen.getByText(/Banana/i)).toBeInTheDocument();
    });
  });

  it("updates data upon page change in Search component", async () => {
    success();
    // Wait for the data to load for page 1
    await waitFor(() => {
      expect(screen.getByText(/Apple/i)).toBeInTheDocument();
      expect(screen.getByText(/Banana/i)).toBeInTheDocument();
    });

    // Mock API call for page 2
    fetchFoods.mockResolvedValueOnce({
      data: {
        totalPages: 2,
        currentPage: 2,
        foods: [
          { fdcId: 3, description: "Cherry" },
          { fdcId: 4, description: "Date" },
        ],
      },
    });

    // Simulate page change to page 2
    const nextPageButton = screen.getByLabelText("Go to page 2"); // Assuming the pagination component shows page numbers
    fireEvent.click(nextPageButton);

    // Wait for the data to load for page 2
    await waitFor(() => {
      expect(screen.getByText(/Cherry/i)).toBeInTheDocument();
      expect(screen.getByText(/Date/i)).toBeInTheDocument();
    });

    // Verify the old data from page 1 is no longer in the document
    expect(screen.queryByText(/Apple/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Banana/i)).not.toBeInTheDocument();
  });

  it("handles API error gracefully", async () => {
    // Mock API error
    fetchFoods.mockRejectedValueOnce(new Error("API error"));

    render(<Search onRowSelected={jest.fn()} />);

    // Simulate search input change
    const searchInput = screen.getByLabelText(/Search/i);
    fireEvent.change(searchInput, { target: { value: "fruit" } });

    await waitFor(() => {
      // Check that no table data is shown due to API error
      expect(screen.queryByText(/Apple/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Banana/i)).not.toBeInTheDocument();
    });
  });
});

describe("Nutrition Display Component", () => {
  const success = () => {
    // Mock API response
    fetchNutrients.mockResolvedValueOnce([
      {
        id: 1008,
        name: "Energy",
        amount: 158,
        dailyAmt: "6.1%",
        unit: "kcal",
      },
      {
        id: 1003,
        name: "Protein",
        amount: 18.01,
        dailyAmt: "45.0%",
        unit: "g",
      },
    ]);

    render(<NutritionDisplay selectedFood={jest.fn()} />);
  };

  it("displays data in Nutrition Display component", async () => {
    success();

    await waitFor(() => {
      expect(screen.getByText(/Energy/i)).toBeInTheDocument();
      expect(screen.getByText(/158kcal/i)).toBeInTheDocument();
      expect(screen.getByText(/6.1%/i)).toBeInTheDocument();
      expect(screen.getByText(/Protein/i)).toBeInTheDocument();
      expect(screen.getByText(/18.01g/i)).toBeInTheDocument();
      expect(screen.getByText(/45.0%/i)).toBeInTheDocument();
    });
  });

  it("handles API error gracefully", async () => {
    fetchNutrients.mockRejectedValueOnce(new Error("API error"));

    render(<NutritionDisplay selectedFood={jest.fn()} />);

    await waitFor(() => {
      expect(screen.queryByText(/Energy/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Protein/i)).not.toBeInTheDocument();
    });
  });
});
