import { useState, useEffect } from "react";
import PivotTableUI from "react-pivottable/PivotTableUI";
import "react-pivottable/pivottable.css";
import createPlotlyRenderers from "react-pivottable/PlotlyRenderers";
import TableRenderers from "react-pivottable/TableRenderers";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import "./App.css";

// Utility function to generate random mock data
// eslint-disable-next-line no-unused-vars
const generateMockData = (numEntries) => {
  const mockData = [];
  const randomAddressIds = Array.from(
    { length: numEntries },
    (_, i) => `Z24950${i + 74}`
  );
  for (let i = 0; i < numEntries; i++) {
    mockData.push({
      address_id:
        randomAddressIds[Math.floor(Math.random() * randomAddressIds.length)],
      hub_id: `H${4000 + Math.floor(Math.random() * 100)}`,
      terminal_id_code: `FT-H${4000 + Math.floor(Math.random() * 100)}${i}`,
      terminal_exc_code: `A8F${String.fromCharCode(
        65 + Math.floor(Math.random() * 26)
      )}P`,
      f2_port: 1 + i,
      f2_port_status: "V",
    });
  }
  return mockData;
};
const generateNewMockData = (numEntries) => {
  if (numEntries <= 0) return [];

  const mockData = [];
  const baseEntries = [];

  for (let i = 0; i < numEntries; i++) {
    const addressId = `Z770000${1 + i}`;
    const hubId = `H${1000 + Math.floor(Math.random() * 10)}`;
    const terminalIdCode = `FT-H${10000 + Math.floor(Math.random() * 10)}`;
    const terminalExcCode = `ABCD${1 + Math.floor(Math.random() * 9)}`;

    baseEntries.push({
      addressId,
      hubId,
      terminalIdCode,
      terminalExcCode,
    });
  }

  baseEntries.forEach(
    ({ addressId, hubId, terminalIdCode, terminalExcCode }) => {
      for (let i = 5; i <= 10; i++) {
        const f2PortStatus = Math.random() < 0.5 ? "V" : "D";
        mockData.push({
          addressId,
          hubId,
          terminalIdCode,
          terminalExcCode,
          f2Port: i,
          f2PortStatus,
        });
      }
    }
  );

  return mockData;
};

const mockApiResponse = {
  data: {
    getAvailableF2PortsByTerminalId: {
      list: generateNewMockData(50),
      status: true,
      msg: "F2 Ports List",
    },
  },
};

const mockData = true;

const API_URL = "https://api.example.com/data";

function App() {
  const [pivotState, setPivotState] = useState({
    data: [],
  });
  const [apiStatus, setApiStatus] = useState("");
  const [apiMessage, setApiMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (mockData) {
        const response = mockApiResponse;
        const transformedData = transformDataForPivot(
          response.data.getAvailableF2PortsByTerminalId.list
        );

        setPivotState((prevState) => ({
          ...prevState,
          data: transformedData,
        }));
        setApiStatus(
          response.data.getAvailableF2PortsByTerminalId.status
            ? "Success"
            : "Failed"
        );
        setApiMessage(response.data.getAvailableF2PortsByTerminalId.msg);
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
          setApiStatus(
            json.data.getAvailableF2PortsByTerminalId.status
              ? "Success"
              : "Failed"
          );
          setApiMessage(json.data.getAvailableF2PortsByTerminalId.msg);
        } catch (error) {
          console.error("Failed to fetch data from API:", error);
        }
      }
    };

    fetchData();
  }, []);

  const transformDataForPivot = (data) => {
    if (data.length === 0) return [];

    const headers = Object.keys(data[0]).map((header) =>
      header
        .replace(/([A-Z])/g, " $1")
        .trim()
        .replace(/^./, (str) => str.toUpperCase())
    );

    const rows = data.map((item) => Object.values(item));
    return [headers, ...rows];
  };

  const exportDataToCSV = () => {
    const csv = Papa.unparse(pivotState.data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "lookup_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="wrapper bg-gray-100">
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
          <div className="mb-4">
            <p
              className={`font-semibold ${
                apiStatus === "Success" ? "text-green-500" : "text-red-500"
              }`}
            >
              Status: {apiStatus}
            </p>
            <p className="text-gray-700">Message: {apiMessage}</p>
          </div>
          <div className="flex-grow overflow-auto">
            <PivotTableUI
              data={pivotState.data}
              onChange={(s) => setPivotState(s)}
              renderers={Object.assign(
                {},
                TableRenderers,
                createPlotlyRenderers(Plot)
              )}
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
