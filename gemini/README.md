# ORACULUM 🏛️ - Gemini AI Web Automation

Ancient wisdom meets modern intelligence. A powerful web-based interface that connects to Google Gemini through browser automation, supporting both text and image inputs.

![ORACULUM](https://img.shields.io/badge/Status-Active-success)
![Node](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 Features

- ✨ Beautiful ancient-themed UI
- 📝 Text-based queries to Gemini
- 🖼️ Multi-image upload support
- 🔄 Real-time response streaming
- 🌐 RESTful API endpoint
- 🔐 Persistent browser session (no re-login needed)
- 🚀 CORS-enabled for remote access

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Google Chrome** (latest version)
- **Google Account** with Gemini access

Check your Node.js version:
```bash
node --version
npm --version
```

---

## 🚀 Installation

### 1. Clone or Download the Project

```bash
cd /Users/rafaeljosh/Documents/malware/gemini
```

### 2. Install Node.js Dependencies

```bash
npm install express playwright
```

Or create a `package.json` first:

```bash
npm init -y
npm install express playwright
```

### 3. Install Playwright Browsers

This will download Chromium/Chrome binaries needed for automation:

```bash
npx playwright install chrome
```

Or install all browsers:

```bash
npx playwright install
```

---

## 🔐 Setup Persistent Browser Login

**Important:** You need to login to Gemini once, and the session will be saved for future use.

### Step 1: Create Profile Directory

The browser profile is saved at `~/gemini-profile`. This directory will be created automatically when you first run the server.

### Step 2: Initial Login

1. **Start the server:**
   ```bash
   node server.js
   ```

2. **A Chrome window will open automatically** (headless: false)

3. **Login to Gemini:**
   - The browser will navigate to `https://gemini.google.com/`
   - Login with your Google account
   - Accept any terms/conditions if prompted

4. **Keep the browser open** while the server is running

5. **Test a query** from the UI to ensure everything works

### Step 3: Verify Persistent Session

- On subsequent runs, the browser should **automatically be logged in**
- You won't need to re-enter credentials
- The session is stored in `~/gemini-profile`

**Troubleshooting:**
- If login expires, delete the profile: `rm -rf ~/gemini-profile`
- Run the server again and re-login

---

## ⚙️ Configuration

### File Structure

```
gemini/
├── server.js           # Express backend server
├── chatbotui.html      # Frontend UI
├── package.json        # Node dependencies
└── README.md           # This file

playwright/tests/
└── gemini.js           # Gemini automation module
```

### Update Gemini Module Path (if needed)

In [`server.js`](server.js#L46-L48), ensure the path to `gemini.js` is correct:

```javascript
({ runGemini } = require('../../playwright/tests/gemini'));
```

Adjust based on your directory structure.

---

## 🎯 Running the Application

### 1. Start the Backend Server

```bash
cd /Users/rafaeljosh/Documents/malware/gemini
node server.js
```

**Expected output:**
```
[INIT] Starting server...
[INIT] runGemini loaded successfully
✅ Backend running on http://localhost:4000
[GEMINI] Browser ready
```

### 2. Open the Frontend

Open [`chatbotui.html`](chatbotui.html) in any browser:

- **Double-click** the file, or
- Right-click → Open with → Chrome/Firefox, or
- Drag and drop into browser

### 3. Use the Interface

1. Enter your text query in the "Inscribe Your Query" section
2. Optionally upload images (drag & drop or click to browse)
3. Click **"Consult the Oracle"**
4. Wait for Gemini's response (Chrome window will automate the process)

---

## 🌐 API Documentation

### Base URL

```
http://localhost:4000
```

### Endpoint: `/consult`

**Method:** `POST`

**Request Body:**
```json
{
  "text": "What is the meaning of life?",
  "images": [
    {
      "name": "example.png",
      "data": "data:image/png;base64,iVBORw0KGgoAAAANSUh..."
    }
  ]
}
```

**Response (Success):**
```json
{
  "answer": "The meaning of life is a philosophical question..."
}
```

**Response (Error):**
```json
{
  "error": "Error message here"
}
```

**Example using cURL:**
```bash
curl -X POST http://localhost:4000/consult \
  -H "Content-Type: application/json" \
  -d '{
    "text": "What is AI?",
    "images": []
  }'
```

**Example using JavaScript:**
```javascript
const response = await fetch('http://localhost:4000/consult', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Explain quantum physics',
    images: []
  })
});

const result = await response.json();
console.log(result.answer);
```

---

## 🔓 Making API Publicly Accessible

By default, the API only works on your local machine. To make it accessible from the internet:

### Option 1: ngrok (Recommended for Testing)

1. **Install ngrok:**
   ```bash
   brew install ngrok
   # or download from https://ngrok.com/
   ```

2. **Start your server:**
   ```bash
   node server.js
   ```

3. **In a new terminal, expose port 4000:**
   ```bash
   ngrok http 4000
   ```

4. **Copy the public URL:**
   ```
   Forwarding    https://abc123.ngrok-free.app -> http://localhost:4000
   ```

5. **Update your frontend** to use the ngrok URL:
   ```javascript
   // In chatbotui.html, replace:
   fetch('http://localhost:4000/consult', ...)
   
   // With:
   fetch('https://abc123.ngrok-free.app/consult', ...)
   ```

### Option 2: localtunnel (Free Alternative)

```bash
npm install -g localtunnel
lt --port 4000 --subdomain mygemini
```

Your API will be available at: `https://mygemini.loca.lt`

### Option 3: Cloudflare Tunnel (Production)

```bash
brew install cloudflare/cloudflare/cloudflared
cloudflared tunnel --url http://localhost:4000
```

---

## 🛠️ Troubleshooting

### Issue: "Failed to load gemini module"

**Solution:** Check the path in `server.js`:
```bash
# Find where gemini.js is located
find ~ -name "gemini.js" -type f

# Update the require path in server.js
```

### Issue: Browser doesn't open or crashes

**Solution:**
1. Ensure Chrome is installed
2. Reinstall Playwright browsers:
   ```bash
   npx playwright install chrome --force
   ```

### Issue: "No response found"

**Possible causes:**
- Gemini page structure changed (update selectors in `gemini.js`)
- Network timeout
- Gemini is down or rate-limiting

**Solution:**
- Check console logs for errors
- Try manually in the browser to see if Gemini works
- Increase timeout values in `gemini.js`

### Issue: Login expires frequently

**Solution:**
- Use persistent context (already implemented)
- Don't delete `~/gemini-profile` directory
- Keep browser window open during operation

### Issue: CORS errors in browser

**Solution:** The server already has CORS enabled. If issues persist:
1. Check browser console for specific error
2. Ensure server is running on port 4000
3. Try using the same machine/network

### Issue: Images not uploading to Gemini

**Solution:**
- Check image file size (should be < 10MB)
- Ensure images are valid formats (PNG, JPG, WEBP)
- Check console logs for upload errors
- Selectors may have changed (update in `gemini.js`)

---

## 📁 Project Structure Explained

### `server.js`
- Express server running on port 4000
- Handles `/consult` endpoint
- Converts base64 images to files
- Calls `runGemini()` function
- Cleans up temporary files

### `gemini.js`
- Playwright automation script
- Manages persistent browser context
- Automates Gemini web interface
- Handles text input and image uploads
- Waits for and extracts responses

### `chatbotui.html`
- Frontend user interface
- Drag-and-drop image upload
- Text input with character counter
- Loading states and animations
- Ancient-themed design

---

## 🔒 Security Considerations

⚠️ **Important Security Notes:**

1. **No Authentication:** The API has no authentication. Anyone with the URL can use it.
   
2. **Rate Limiting:** No rate limiting implemented. Can be abused.

3. **Public Exposure:** If using ngrok/tunnel, your API is publicly accessible.

4. **Google Account:** Your Google account credentials are stored in the browser profile.

**Recommendations for Production:**
- Add API key authentication
- Implement rate limiting (e.g., express-rate-limit)
- Use environment variables for sensitive data
- Add request validation and sanitization
- Monitor usage and set quotas

---

## 📝 Environment Variables (Optional)

Create a `.env` file for configuration:

```env
PORT=4000
GEMINI_PROFILE_PATH=/Users/yourusername/gemini-profile
BROWSER_HEADLESS=false
```

Update `server.js` to use:
```javascript
require('dotenv').config();
const PORT = process.env.PORT || 4000;
```

---

## 🧪 Testing

Test the API with a simple request:

```bash
# Test health check (add this endpoint if needed)
curl http://localhost:4000/

# Test consult endpoint
curl -X POST http://localhost:4000/consult \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello Gemini!", "images": []}'
```

---

## 📊 Performance Tips

1. **Keep browser open:** Don't close the automated Chrome window
2. **Reuse context:** The browser context is reused across requests
3. **Image optimization:** Compress images before upload
4. **Concurrent requests:** Server handles one request at a time (by design)

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:

- [ ] Add authentication system
- [ ] Implement rate limiting
- [ ] Add response caching
- [ ] Support for other AI models
- [ ] Better error handling
- [ ] Add tests
- [ ] Docker containerization

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🙏 Credits

- **Google Gemini** for the AI capabilities
- **Playwright** for browser automation
- **Express.js** for the backend framework
- Ancient Greek mythology for the thematic inspiration

---

## 💬 Support

If you encounter issues:

1. Check the console logs (`server.js` terminal)
2. Check browser console (Frontend)
3. Review this README's troubleshooting section
4. Ensure all dependencies are installed
5. Verify Gemini website is accessible

---

## 🔄 Version History

- **v1.0.0** - Initial release
  - Text and image support
  - Persistent browser session
  - RESTful API
  - Ancient-themed UI

---

**Built with ⚡ by the Gods of Code**

*"In the age of silicon and circuits, wisdom still flows from ancient springs."*
