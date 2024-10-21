import { useState, useEffect } from "react";
import PivotTableUI from "react-pivottable/PivotTableUI";
import "react-pivottable/pivottable.css";
import createPlotlyRenderers from "react-pivottable/PlotlyRenderers";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import "./App.css";

const mockApiResponse = {
  data: {
    getAvailableF2PortsByTerminalId: {
      list: [
        {
          address_id: "Z2495074",
          hub_id: "H4015",
          terminal_id_code: "FT-H4015308",
          terminal_exc_code: "A8FTP",
          f2_port: 85,
          f2_port_status: "V",
        },
        {
          address_id: "Z2495074",
          hub_id: "H4015",
          terminal_id_code: "FT-H4015308",
          terminal_exc_code: "A8FTP",
          f2_port: 86,
          f2_port_status: "V",
        },
      ],
      status: true,
      msg: "F2 Ports List",
    },
  },
};

const mockData = true;

const API_URL = "https://api.example.com/cabledata";
function App() {
  const [pivotState, setPivotState] = useState({
    data: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      if (mockData) {
        const transformedData = transformDataForPivot(
          mockApiResponse.data.getAvailableF2PortsByTerminalId.list
        );
        setPivotState((prevState) => ({
          ...prevState,
          data: transformedData,
        }));
      } else {
        try {
          const response = await fetch(API_URL);
          const json = await response.json();
          const transformedData = transformDataForPivot(
            json.data.getAvailableF2PortsByTerminalId.list
          );
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
    link.setAttribute("download", "f2_ports_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen min-w-full bg-gray-100">
      <header className="flex justify-between items-center py-4 px-6 bg-blue-600 text-white">
        <h1 className="text-3xl font-bold">Data Lookup</h1>
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
              className="full-width"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
