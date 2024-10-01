import React, { useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import { FaGithub } from "react-icons/fa";
import "jspdf-autotable";
import ResultData from "./components/ResultData";
import LinkedinData from "./components/LinkedinData";
import { toast } from "react-toastify";

function App() {
  const [rollNumbers, setRollNumbers] = useState("");
  const [results, setResults] = useState([]);
  const [selectedYear, setSelectedYear] = useState("3");
  const [linkedinResults, setLinkedinResults] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [viewLinkedin, setViewLinkedin] = useState(false);
  const [sortConfig, setSortConfig] = useState(null);
  const [linkedinFetched, setLinkedinFetched] = useState(false); // State to track if LinkedIn data has been fetched
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

    // Fetch CVR Results
    try {
      const response = await axios.post("http://localhost:5000/result", {
        rollNumbers: rollNumberArray,
        year: selectedYear,
      });
      setResults(response.data);
      setViewLinkedin(false); // Reset to view CVR results
      setLinkedinFetched(false); // Reset LinkedIn fetched state
      toast.success("Results fetched successfully!!");
    } catch (error) {
      toast.error("error fetching results... try again!!!");
      console.error("Error fetching CVR data:", error);
    }
  };

  // Fetch LinkedIn Profiles on button click
  const fetchLinkedinProfiles = async () => {
    try {
      const linkedinResponse = await axios.post(
        "http://localhost:5000/linkedin",
        {
          students: results,
        }
      );
      setLinkedinResults(linkedinResponse.data);
      setLinkedinFetched(true); // Set the LinkedIn fetched state to true
      setViewLinkedin(true);
      toast.success("Profiles fetched successfully!!");
    } catch (error) {
      toast.error("error fetching profiles... try again!!!");
      console.error("Error fetching LinkedIn data:", error);
    }
  };

  // PDF download function for CVR results
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("CVR Results", 14, 16);
    doc.autoTable({
      startY: 26,
      head: [["Roll Number", "Name", "SGPA", "CGPA"]],
      body: results.map((result) => [
        result.rollNumber,
        result.name,
        result.sgpa,
        result.cgpa,
      ]),
    });
    doc.save("results.pdf");
    toast.success("Results downloaded successfully!!");
  };

  // PDF download function for LinkedIn results
  const downloadLinkedInPDF = () => {
    const doc = new jsPDF();
    doc.text("LinkedIn Profiles", 14, 16);

    const body = [];

    linkedinResults.forEach((student) => {
      const { rollNumber, name, profiles } = student;

      // If there are profiles, create rows for each one
      if (profiles.length > 0) {
        profiles.forEach((profile, index) => {
          if (index === 0) {
            // For the first profile, include roll number and name
            body.push([
              rollNumber,
              name,
              profile.profileName,
              profile.profileLink,
            ]);
          } else {
            // For subsequent profiles, omit roll number and name
            body.push([
              "", // Empty for roll number
              "", // Empty for name
              profile.profileName,
              profile.profileLink,
            ]);
          }
        });
      } else {
        // If no profiles found, include a row with a message
        body.push([rollNumber, name, "No Profiles Found", ""]);
      }
    });

    // Create the PDF table
    doc.autoTable({
      startY: 26,
      head: [["Roll Number", "Name", "Profile Name", "Profile Link"]],
      body,
    });
    doc.save("linkedin_profiles.pdf");
    toast.success("linkedin data downloaded successfully!!");
  };
  const filteredResults = !filterText.trim()
    ? results
    : results.filter((result) =>
        result.name.toLowerCase().includes(filterText.toLowerCase())
      );
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
  return (
    <div className="max-w-100 min-h-[100vh] h-auto mx-auto p-8 bg-gray-900 text-white">
      <div>
        {/* <a
          href="https://github.com/suraj719/linkhunt"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 left-4 text-white hover:text-gray-400 transition duration-200"
        >
          <FaGithub size={30} />
        </a> */}
      </div>
      <h1 className="text-4xl font-bold text-center mb-8">
        🎓 CVR Students Data Scraper 🎓
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

        {/* Year Selection Radio Buttons */}
        <div className="mb-4">
          <label className="mr-4 text-white">
            <input
              type="radio"
              value="2"
              checked={selectedYear === "2"}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="mr-2"
            />
            2nd Year (B23)
          </label>
          <label className="mr-4 text-white">
            <input
              type="radio"
              value="3"
              checked={selectedYear === "3"}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="mr-2"
            />
            3rd Year (B22)
          </label>
          <label className="mr-4 text-white">
            <input
              type="radio"
              value="4"
              checked={selectedYear === "4"}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="mr-2"
            />
            4th Year (B21)
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Submit 🚀
        </button>
      </form>

      {/* Filter input */}
      {filteredResults.length > 0 && (
        <input
          type="text"
          placeholder="🔍 Filter by name"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md mb-4"
        />
      )}

      <div className="mt-4 text-right mb-4">
        {filteredResults.length > 0 && !linkedinFetched && (
          <button
            onClick={fetchLinkedinProfiles}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 mr-2"
          >
            Fetch LinkedIn Profiles
          </button>
        )}
        {filteredResults.length > 0 && (
          <button
            onClick={downloadPDF}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200 mr-2"
          >
            Download Marksheet📜
          </button>
        )}
        {linkedinResults.length > 0 && (
          <button
            onClick={downloadLinkedInPDF}
            className="bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition duration-200 mr-2"
          >
            Download LinkedIn Data👀
          </button>
        )}
        {linkedinResults.length > 0 && (
          <button
            onClick={() => setViewLinkedin(!viewLinkedin)}
            className="bg-cyan-600 text-white py-2 px-4 rounded-md hover:bg-cyan-700 transition duration-200"
          >
            {viewLinkedin ? "Show Results🎯" : "Show LinkedIn Profiles🤩"}
          </button>
        )}
      </div>

      {/* Results Table */}
      {filteredResults.length > 0 ? (
        <>
          {viewLinkedin ? (
            <LinkedinData
              linkedinResults={linkedinResults}
              filterText={filterText}
            />
          ) : (
            <ResultData
              results={filteredResults}
              sortResults={sortResults}
              filterText={filterText}
            />
          )}
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default App;
