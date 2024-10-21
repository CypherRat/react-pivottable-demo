import { useState, useEffect } from "react";
import PivotTableUI from "react-pivottable/PivotTableUI";
import "react-pivottable/pivottable.css";
import createPlotlyRenderers from "react-pivottable/PlotlyRenderers";
import Plot from "react-plotly.js";
import Papa from "papaparse";

const mockLargeDataSet = [
  [
    "Cable Type",
    "Length (m)",
    "Color",
    "Price (USD)",
    "Manufacturer",
    "Location",
  ],
  ["Coaxial", 10, "Black", 15, "CablePro", "USA"],
  ["Fiber Optic", 50, "White", 120, "FiberMax", "Germany"],
  ["Ethernet", 20, "Blue", 10, "NetConnect", "China"],
  ...Array.from({ length: 100 }, (_, i) => [
    `Cable Type ${i + 1}`,
    Math.floor(Math.random() * 100),
    ["Black", "White", "Blue", "Red"][i % 4],
    (Math.random() * 100).toFixed(2),
    `Manufacturer ${i + 1}`,
    ["USA", "Germany", "China", "Japan"][i % 4],
  ]),
];

const mockData = true;

const API_URL = "https://api.example.com/cabledata";

function App() {
  const [pivotState, setPivotState] = useState({
    data: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      if (mockData) {
        setPivotState((prevState) => ({
          ...prevState,
          data: mockLargeDataSet,
        }));
      } else {
        try {
          const response = await fetch(API_URL);
          const json = await response.json();

          const transformedData = transformDataForPivot(json);
          setPivotState((prevState) => ({
            ...prevState,
            data: transformedData,
          }));
        } catch (error) {
          console.error("Failed to fetch data from API:", error);
        }
      }
    };

    fetchData();
  }, []);

  const transformDataForPivot = (data) => {
    if (data.length === 0) return [];

    const headers = Object.keys(data[0]);
    const rows = data.map((item) => Object.values(item));
    return [headers, ...rows];
  };

  const exportDataToCSV = () => {
    const csv = Papa.unparse(pivotState.data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "cable_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="flex justify-between items-center py-4 px-6 bg-blue-600 text-white">
        <h1 className="text-3xl font-bold">Cable Data Analysis</h1>
        <button
          onClick={exportDataToCSV}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Export Data to CSV
        </button>
      </header>
      <main className="flex-grow overflow-hidden p-4">
        <div className="bg-white shadow-md rounded-lg p-6 h-full flex flex-col">
          <div className="flex-grow overflow-auto">
            <PivotTableUI
              data={pivotState.data}
              onChange={(s) => setPivotState(s)}
              renderers={Object.assign({}, createPlotlyRenderers(Plot))}
              {...pivotState}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
