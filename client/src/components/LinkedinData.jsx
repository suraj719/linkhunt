import React from "react";

const LinkedInData = ({ linkedinResults, filterText }) => {
  // Filter the results based on the entered name
  const filteredResults = linkedinResults.filter((student) =>
    student.name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="overflow-x-auto">
      {filteredResults.length > 0 ? (
        <table className="min-w-full bg-gray-800 border border-gray-700">
          <thead>
            <tr className="bg-gray-700">
              <th className="py-2 px-4 text-left">Roll Number & Name</th>
              <th className="py-2 px-4 text-left">Profile Name</th>
              <th className="py-2 px-4 text-left">Profile Link</th>
              <th className="py-2 px-4 text-left">Image</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((student, studentIndex) => {
              const { rollNumber, name, profiles } = student;

              // If profiles array is empty, show a row with a message
              if (profiles.length === 0) {
                return (
                  <tr key={studentIndex} className="border-t border-gray-700">
                    <td className="py-2 px-4" colSpan="4">
                      {rollNumber} - {name} - No Profiles Found
                    </td>
                  </tr>
                );
              }

              // For the first profile, show the roll number and name in a single cell
              return profiles.map((profile, profileIndex) => (
                <tr
                  key={`${studentIndex}-${profileIndex}`}
                  className="border-t border-gray-700"
                >
                  {profileIndex === 0 && (
                    <td rowSpan={profiles.length} className="py-2 px-4">
                      {rollNumber} - {name}
                    </td>
                  )}
                  <td className="py-2 px-4">{profile.profileName}</td>
                  <td className="py-2 px-4">
                    <a
                      href={profile.profileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      View Profile
                    </a>
                  </td>
                  <td className="py-2 px-4">
                    <img
                      src={profile.imageUrl||"../blank.webp"}
                      alt={profile.profileName}
                      className="w-12 h-12 object-cover"
                    />
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      ) : (
        <p className="text-center">No LinkedIn profiles found ⟳</p>
      )}
    </div>
  );
};

export default LinkedInData;
