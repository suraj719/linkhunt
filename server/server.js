const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// result scraping route
app.post("/scrape", async (req, res) => {
  const rollNumbers = req.body.rollNumbers;
  const results = [];

  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint:
        "ws://127.0.0.1:9222/devtools/browser/606639a6-fc7c-4734-8382-9441f54d93b2",
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });
    await page.goto("https://results.cvr.ac.in/cvrresults1/resulthome.php");
    console.log("Please solve the CAPTCHA manually.");
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await page.waitForSelector(
      'a[href="/cvrresults1/result.php?resid=bt12e46x060523NF"]'
    );
    await page.click(
      'a[href="/cvrresults1/result.php?resid=bt12e46x060523NF"]'
    );
    console.log("Navigated to the form page!");

    for (const rollNumber of rollNumbers) {
      console.log(`Searching for roll number: ${rollNumber}`);

      await page.waitForSelector('input[name="srno"]');
      await page.type('input[name="srno"]', rollNumber);
      await page.click('button[type="submit"]');
      console.log("Submitted the roll number!");

      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for results to load

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

    res.json(results);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while scraping data." });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
