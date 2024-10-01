const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;
const debugURL =
  "ws://127.0.0.1:9222/devtools/browser/1c42924c-1e75-4ec3-9e7d-0425dfb21407";
app.use(cors());
app.use(bodyParser.json());

// result scraping route
app.post("/result", async (req, res) => {
  const rollNumbers = req.body.rollNumbers;
  const year = req.body.year || "3";
  const results = [];
  const examID =
    (year === "2" && "bt12e46x060498NF") ||
    (year === "3" && "bt12e46x060523NF") ||
    (year === "4" && "bt12e46x060516NF") ||
    "bt12e46x060523NF";
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: debugURL,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });
    await page.goto("https://results.cvr.ac.in/cvrresults1/resulthome.php");
    console.log("Please solve the CAPTCHA manually.");
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await page.waitForSelector(
      `a[href="/cvrresults1/result.php?resid=${examID}"]`
    );
    await page.click(`a[href="/cvrresults1/result.php?resid=${examID}"]`);
    console.log("Navigated to the form page!");

    for (const rollNumber of rollNumbers) {
      console.log(`Searching for roll number: ${rollNumber}`);

      await page.waitForSelector('input[name="srno"]');
      await page.type('input[name="srno"]', rollNumber);
      await page.click('button[type="submit"]');
      console.log("Submitted the roll number!");

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for results to load

      const resultData = await page.evaluate(() => {
        const nametable = document.querySelectorAll(".bttable.blue")[0];
        const markstable = document.querySelectorAll(".bttable.blue")[2];
        let name = "",
          sgpa = "",
          cgpa = "";

        if (nametable) {
          const namebody = nametable.querySelector("tbody");
          const marksbody = markstable.querySelector("tbody");
          if (namebody || marksbody) {
            const nameRow = namebody.querySelectorAll("tr")[1];
            const nameCell = nameRow.querySelectorAll("td")[1];
            name = nameCell ? nameCell.innerText : "Name not found";
            const sgpaRow = marksbody.querySelectorAll("tr")[0];
            sgpa = sgpaRow ? sgpaRow.querySelectorAll("td")[1].innerText : "0";

            const cgpaRow = marksbody.querySelectorAll("tr")[1];
            cgpa = cgpaRow ? cgpaRow.querySelectorAll("td")[1].innerText : "0";
          }
        }

        return {
          name,
          sgpa: parseFloat(sgpa) || 0,
          cgpa: parseFloat(cgpa) || 0,
        };
      });

      console.log("Extracted Data:", resultData);
      results.push({ rollNumber, ...resultData });
    }
    page.close();
    res.json(results);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while scraping data." });
  }
});

// LinkedIn scraping route
app.post("/linkedin", async (req, res) => {
  const students = req.body.students; // [{ rollNumber, name }, ...]
  const results = [];

  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: debugURL,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });

    for (const student of students) {
      const { rollNumber, name } = student;
      console.log(`Searching for ${name} (${rollNumber})`);

      await page.goto(
        `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
          name
        ).toLowerCase()}&origin=GLOBAL_SEARCH_HEADER&schoolFilter=%5B%221557917%22%5D`,
        { waitUntil: "networkidle2", timeout: 0 }
      );

      try {
        // Adjust the timeout and handle no profile found gracefully
        await page.waitForSelector(".reusable-search__entity-result-list", {
          timeout: 1000,
        });

        const profiles = await page.evaluate(() => {
          const profileNodes = document.querySelectorAll(
            ".reusable-search__entity-result-list .reusable-search__result-container"
          );

          const profileData = [];

          profileNodes.forEach((profile) => {
            const imageElement = profile.querySelector(
              '.entity-result__universal-image .ivm-image-view-model .ivm-view-attr__img-wrapper img[id^="ember"]'
            );
            const imageUrl = imageElement ? imageElement.src : "";

            const profileLinkElement = profile.querySelector(
              ".entity-result__title-text a.app-aware-link"
            );
            let profileLink = profileLinkElement
              ? profileLinkElement.href
              : null;

            if (profileLink) {
              const url = new URL(profileLink);
              profileLink = url.origin + url.pathname;
            } else {
              profileLink = "";
            }

            const profileNameElement = profile.querySelector(
              ".entity-result__title-text a.app-aware-link span span:nth-child(1)"
            );
            const profileName = profileNameElement
              ? profileNameElement.innerText
              : "";

            profileData.push({
              profileName: profileName,
              profileLink: profileLink,
              imageUrl: imageUrl,
            });
          });

          return profileData;
        });

        // Check if profiles array is empty and push appropriate message
        if (profiles.length === 0) {
          results.push({
            rollNumber,
            name,
            profiles: [],
          });
        } else {
          results.push({
            rollNumber,
            name,
            profiles: profiles,
          });
        }
      } catch (error) {
        // Handle the timeout error specifically
        if (error.name === "TimeoutError") {
          console.log(`No profiles found for ${name} (${rollNumber}).`);
          results.push({
            rollNumber,
            name,
            profiles: [],
          });
        } else {
          console.error(
            `Error fetching data for ${name} (${rollNumber}):`,
            error
          );
          results.push({
            rollNumber,
            name,
            profiles: [], // still push empty if there's another error
          });
        }
      } finally {
        console.log(`Data for ${rollNumber} has been processed.`);
      }
    }
    page.close();
    res.json(results);
  } catch (error) {
    console.error("Error fetching LinkedIn data:", error);
    res
      .status(500)
      .json({ error: "An error occurred while scraping LinkedIn data." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
