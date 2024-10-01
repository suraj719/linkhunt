import React, { useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { FaSort, FaDownload } from "react-icons/fa";

function App() {
  const [rollNumbers, setRollNumbers] = useState("");
  const [results, setResults] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [sortConfig, setSortConfig] = useState(null);

  // Handle form submit and scrape data
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rollNumbers.trim()) {
      alert(
        "Roll numbers should be entered separated by commas \n(ex: 22B81A0501,22B81A0502,22B81A0503 )"
      );
      return;
    }
    const rollNumberArray = rollNumbers.split(",").map((num) => num.trim());

    try {
      const response = await axios.post("http://localhost:5000/scrape", {
        rollNumbers: rollNumberArray,
      });
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Sorting logic
  const sortResults = (key) => {
    let sortedResults = [...filteredResults];
    if (sortConfig && sortConfig.key === key && !sortConfig.ascending) {
      sortedResults.reverse();
    } else {
      sortedResults.sort((a, b) => (a[key] < b[key] ? 1 : -1));
    }
    setResults(sortedResults);
    setSortConfig({
      key,
      ascending: !sortConfig || sortConfig.key !== key || !sortConfig.ascending,
    });
  };

  // Filter results based on search input
  const filteredResults = results.filter((result) =>
    result.name.toLowerCase().includes(filterText.toLowerCase())
  );

  // PDF download function
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("📄 CVR Results", 14, 16);
    doc.autoTable({
      startY: 26,
      head: [["Roll Number", "Name", "SGPA", "CGPA"]],
      body: filteredResults.map((result) => [
        result.rollNumber,
        result.name,
        result.sgpa,
        result.cgpa,
      ]),
    });
    doc.save("results.pdf");
  };

  return (
    <div className="max-w-100 min-h-[100vh] h-auto mx-auto p-8 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold text-center mb-8">
        🎓 CVR Students Data Scraper 📊
      </h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={rollNumbers}
          onChange={(e) => setRollNumbers(e.target.value)}
          placeholder="Enter roll numbers, separated by commas"
          rows={3}
          className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md mb-4"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Submit 🚀
        </button>
      </form>

      {/* Filter input */}
      <input
        type="text"
        placeholder="🔍 Filter by name"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md mb-4"
      />

      {/* Download PDF Button */}
      {filteredResults.length > 0 && (
        <div className="mt-4 text-right mb-4">
          <button
            onClick={downloadPDF}
            className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200 flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download as PDF
          </button>
        </div>
      )}

      {/* Results Table */}
      {filteredResults.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 border border-gray-700">
            <thead>
              <tr className="bg-gray-700">
                <th className="py-2 px-4 text-left">Roll Number</th>
                <th className="py-2 px-4 text-left">Name</th>
                <th
                  className="py-2 px-4 text-left cursor-pointer"
                  onClick={() => sortResults("sgpa")}
                >
                  SGPA <FaSort className="inline-block" />
                </th>
                <th
                  className="py-2 px-4 text-left cursor-pointer"
                  onClick={() => sortResults("cgpa")}
                >
                  CGPA <FaSort className="inline-block" />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array(1)
                .fill(filteredResults)
                .flat()
                .map((result, index) => (
                  <tr key={index} className="border-t border-gray-700">
                    <td className="py-2 px-4">{result.rollNumber}</td>
                    <td className="py-2 px-4">{result.name}</td>
                    <td className="py-2 px-4">{result.sgpa}</td>
                    <td className="py-2 px-4">{result.cgpa}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <p className="text-center">No data found ⟳</p>
        </>
      )}
    </div>
  );
}

export default App;
