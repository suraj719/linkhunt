import React from "react";
import { FaSort } from "react-icons/fa";

const ResultData = ({ results, filterText }) => {
  const filteredResults = results.filter((result) =>
    result.name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="overflow-x-auto">
      {filteredResults.length > 0 ? (
        <table className="min-w-full bg-gray-800 border border-gray-700">
          <thead>
            <tr className="bg-gray-700">
              <th className="py-2 px-4 text-left">Roll Number</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">
                SGPA <FaSort className="inline-block" />
              </th>
              <th className="py-2 px-4 text-left">
                CGPA <FaSort className="inline-block" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((result, index) => (
              <tr key={index} className="border-t border-gray-700">
                <td className="py-2 px-4">{result.rollNumber}</td>
                <td className="py-2 px-4">{result.name}</td>
                <td className="py-2 px-4">{result.sgpa}</td>
                <td className="py-2 px-4">{result.cgpa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center">No data found ⟳</p>
      )}
    </div>
  );
};

export default ResultData;
