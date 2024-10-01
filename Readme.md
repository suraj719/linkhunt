# LinkHunt

## Introduction

The **LinkHunt** is a full-stack application designed to automate the retrieval of student results and LinkedIn profile data. This project uses **React** for the frontend, **Node.js** for the backend, and **Puppeteer** for web scraping, styled using **Tailwind CSS** for a modern and responsive UI. The tool simplifies fetching academic records from CVR college's result portal and optionally scraping LinkedIn profiles for further analysis.

## Demo Video

For a complete demonstration of how to install, set up, and use LinkHunt, please watch the following YouTube video:
<iframe width="560" height="315" src="https://www.youtube.com/embed/XElrZLUn5OA?si=GHVe2OGr8l1rO26h" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Stack:

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express.js, Puppeteer
- **PDF Generation**: jsPDF
- **Web Scraping**: Puppeteer

## Features

- Fetch and display CVR students' results using roll numbers.
- Scrape LinkedIn profiles for the students if needed.
- Option to download results and LinkedIn data as PDFs.
- Toggle between displaying academic results and LinkedIn data.
- Fully responsive design with a modern UI.

## Installation and Setup

### Prerequisites

- **Node.js** installed
- **Google Chrome** with debugging enabled

### Frontend Setup

1. Clone the repository:

```bash
git clone https://github.com/suraj719/linkhunt.git
cd linkhunt
```

2. Install dependencies:

```bash
cd client
npm install
```

3. Start the frontend:

```bash
npm start
```

The frontend should now be running at `http://localhost:5173`.

### Backend Setup

1. Navigate to the `server` directory:

```bash
cd server
```

2. Install backend dependencies:

```bash
npm install
```

3. **Enable Chrome with Remote Debugging**: 

Start Chrome with remote debugging enabled by running:

```bash
chrome.exe --remote-debugging-port=9222
```
or follow the instructions from `https://support.google.com/chrome/a/answer/6271282?hl=en`
4. Once Chrome is running with debugging enabled, visit:

```bash
http://127.0.0.1:9222/json/version
```

5. Copy the `webSocketDebuggerUrl` from the JSON response and paste it into the `server.js` file in the following format:

```js
const debugURL = "ws://127.0.0.1:9222/devtools/browser/<your-websocket-debugger-url>";
```

6. Start the backend server:

```bash
npm start
```

The backend will now run at `http://localhost:5000`.

### Important Notes

1. **Captcha Handling**: 
   - If the results page prompts for a captcha, manually open a new tab in your browser, solve the captcha, and then resend the request through the app.

2. **Handling Scraping Interruptions**:
   - If the scraping process is interrupted or stops unexpectedly, refresh the scraping page in the browser and try again.

### Backend API Endpoints:

- **POST /result**: Fetch CVR results by providing roll numbers.
- **POST /linkedin**: Scrape LinkedIn profiles based on roll numbers.

---

With this setup, you can now efficiently scrape student results and LinkedIn profiles, download them in PDF format, and easily switch between academic and LinkedIn data views!

