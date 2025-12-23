const { chromium } = require('playwright');
const path = require('path'); 

let context;
let page;

async function initBrowser() {
  if (page) return page;

  context = await chromium.launchPersistentContext(
    path.join(process.env.HOME, 'gemini-profile'),
    {
      headless: false,
      channel: 'chrome',
      args: [
        '--disable-blink-features=AutomationControlled',
      ],
    }
  );

  page = context.pages()[0] || await context.newPage();

  await page.goto('https://gemini.google.com/', {
    waitUntil: 'domcontentloaded',
  });

  console.log('[GEMINI] Browser ready');
  return page;
}

async function runGemini(text, imagePaths = []) {
  const page = await initBrowser();

  console.log('[GEMINI] Sending prompt');

  // ===== WAIT FOR PAGE TO BE FULLY READY =====
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
    console.log('[GEMINI] Network not idle, continuing...');
  });

  // ===== TEXT INPUT - Use contenteditable div =====
  const inputSelector = 'div.ql-editor[contenteditable="true"]';
  
  await page.waitForSelector(inputSelector, { 
    state: 'visible',
    timeout: 15000 
  });
  

  await page.click(inputSelector);
  await page.waitForTimeout(500);
  await page.type(inputSelector, text);

  // ===== IMAGE UPLOAD =====
  if (imagePaths.length) {
    console.log('[GEMINI] Uploading images:', imagePaths.length);

    // Setup file chooser listener BEFORE clicking button
    const fileChooserPromise = page.waitForEvent('filechooser');


    const uploadMenuButton = 'button[aria-label="Open upload file menu"]';
    await page.click(uploadMenuButton);
    console.log('[GEMINI] Opened upload menu');
    await page.waitForTimeout(800);

   
    const uploadFilesButton = 'button[data-test-id="local-images-files-uploader-button"]';
    await page.waitForSelector(uploadFilesButton, { state: 'visible', timeout: 5000 });
    await page.click(uploadFilesButton);
    console.log('[GEMINI] Clicked Upload files button');


    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(imagePaths);
    console.log('[GEMINI] Images uploaded successfully');
    await page.waitForTimeout(2000); 
  }

  // ===== COUNT EXISTING RESPONSES BEFORE SENDING =====
  const initialResponseCount = await page.evaluate(() => {
    return document.querySelectorAll('message-content').length;
  });
  console.log('[GEMINI] Initial response count:', initialResponseCount);

  // ===== SEND =====
  console.log('[GEMINI] Clicking Send button...');
  const sendButton = 'button[aria-label="Send message"]';
  await page.waitForSelector(sendButton, { state: 'visible', timeout: 5000 });
  await page.click(sendButton);
  console.log('[GEMINI] Message sent, waiting for NEW response...');

  // ===== WAIT FOR NEW RESPONSE TO APPEAR =====
  await page.waitForFunction((expectedCount) => {
    const currentCount = document.querySelectorAll('message-content').length;
    return currentCount > expectedCount;
  }, initialResponseCount, { timeout: 60000 });
  
  console.log('[GEMINI] New response detected, waiting for text to stabilize...');
  
  // ===== WAIT FOR RESPONSE TEXT TO STABILIZE (NOT CHANGING) =====
  let lastText = '';
  let stableCount = 0;
  const maxWait = 60; // Max 60 seconds
  
  for (let i = 0; i < maxWait; i++) {
    await page.waitForTimeout(1000);
    
    const currentText = await page.evaluate(() => {
      const msgs = document.querySelectorAll('message-content');
      return msgs[msgs.length - 1]?.innerText || '';
    });
    
    if (currentText === lastText && currentText.length > 0) {
      stableCount++;
      if (stableCount >= 2) { // Text unchanged for 2 seconds
        console.log('[GEMINI] Response text stabilized');
        break;
      }
    } else {
      stableCount = 0;
    }
    
    lastText = currentText;
  }

  // ===== READ LAST ANSWER =====
  const answer = await page.evaluate(() => {
    const messageContents = document.querySelectorAll('message-content');
    if (messageContents.length === 0) return 'No response found';
    
    // Get the last message-content (latest response)
    const lastMessage = messageContents[messageContents.length - 1];
    return lastMessage.innerText || lastMessage.textContent || 'Empty response';
  });

  console.log('[GEMINI] Answer received:', answer.substring(0, 100));
  return answer;
}

module.exports = { runGemini };
