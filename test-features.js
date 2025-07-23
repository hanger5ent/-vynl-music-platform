#!/usr/bin/env node

/**
 * 🧪 VYNL Platform Feature Testing Script
 * 
 * This script helps you quickly test all pages and features
 * Run with: node test-features.js
 */

const readline = require('readline');
const { spawn } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Test URLs to check
const testUrls = [
  { name: 'Homepage', url: 'http://localhost:3001/', features: ['Beta banner', 'Navigation', 'Landing content'] },
  { name: 'Sign In', url: 'http://localhost:3001/auth/signin', features: ['Login form', 'Validation', 'Error handling'] },
  { name: 'Discover', url: 'http://localhost:3001/discover', features: ['Search', 'Tabs', 'Beta AI section'] },
  { name: 'Creator Application', url: 'http://localhost:3001/creator', features: ['Form submission', 'File upload', 'Validation'] },
  { name: 'Creator Shop', url: 'http://localhost:3001/creator/shop', features: ['Product creation', 'Image upload', 'Shop display'] },
  { name: 'Dashboard', url: 'http://localhost:3001/dashboard', features: ['User stats', 'Navigation', 'Profile access'] },
  { name: 'Admin Panel', url: 'http://localhost:3001/admin', features: ['Access control', 'Tabs', 'Beta settings'] },
];

// Test checklist
const testChecklist = {
  authentication: [
    'User can sign in with valid credentials',
    'Invalid credentials show error message',
    'User dropdown appears when logged in',
    'Sign out works correctly',
    'Session persists on page refresh'
  ],
  betaFeatures: [
    'Beta banner displays when NEXT_PUBLIC_BETA_MODE=true',
    'Beta banner can be dismissed',
    'Beta settings accessible to all users',
    'Feature toggles work in real-time',
    'Beta badges show on beta features'
  ],
  navigation: [
    'All navigation links work',
    'Logo redirects to home',
    'Mobile hamburger menu works',
    'Breadcrumbs show correct path',
    'Back button functionality'
  ],
  responsiveness: [
    'Looks good on desktop (1920x1080)',
    'Looks good on tablet (768px)',
    'Looks good on mobile (375px)',
    'Touch-friendly buttons',
    'Text is readable on all screen sizes'
  ],
  performance: [
    'Page loads under 3 seconds',
    'No console errors',
    'Images load properly',
    'Smooth animations',
    'No memory leaks'
  ]
};

function printHeader(title) {
  console.log(`\n${colors.blue}${colors.bold}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}  ${title}${colors.reset}`);
  console.log(`${colors.blue}${colors.bold}${'='.repeat(50)}${colors.reset}\n`);
}

function printSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function printError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function printWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function printInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${question}${colors.reset} `, resolve);
  });
}

async function openUrlInBrowser(url) {
  return new Promise((resolve) => {
    const command = process.platform === 'win32' ? 'start' : 
                   process.platform === 'darwin' ? 'open' : 'xdg-open';
    
    const child = spawn(command, [url], { shell: true });
    child.on('close', () => resolve());
    
    // Give the browser time to open
    setTimeout(resolve, 2000);
  });
}

async function testPage(pageInfo) {
  printHeader(`Testing: ${pageInfo.name}`);
  
  printInfo(`Opening: ${pageInfo.url}`);
  await openUrlInBrowser(pageInfo.url);
  
  console.log(`\n${colors.bold}Features to test:${colors.reset}`);
  pageInfo.features.forEach(feature => {
    console.log(`  • ${feature}`);
  });
  
  const result = await askQuestion('\nDid this page load correctly and all features work? (y/n/s for skip): ');
  
  if (result.toLowerCase() === 'y') {
    printSuccess(`${pageInfo.name} - All features working!`);
    return { page: pageInfo.name, status: 'passed' };
  } else if (result.toLowerCase() === 's') {
    printWarning(`${pageInfo.name} - Skipped`);
    return { page: pageInfo.name, status: 'skipped' };
  } else {
    const issues = await askQuestion('What issues did you find? (or press Enter to skip): ');
    printError(`${pageInfo.name} - Issues found: ${issues || 'Not specified'}`);
    return { page: pageInfo.name, status: 'failed', issues };
  }
}

async function runManualTests() {
  printHeader('Manual Feature Testing');
  
  for (const category in testChecklist) {
    console.log(`\n${colors.bold}${colors.blue}${category.toUpperCase()}:${colors.reset}`);
    
    for (const test of testChecklist[category]) {
      const result = await askQuestion(`  ${test} - Working? (y/n/s): `);
      
      if (result.toLowerCase() === 'y') {
        printSuccess(`  ${test}`);
      } else if (result.toLowerCase() === 's') {
        printWarning(`  ${test} - Skipped`);
      } else {
        printError(`  ${test} - Needs attention`);
      }
    }
  }
}

async function checkEnvironmentSetup() {
  printHeader('Environment Check');
  
  // Check if .env file exists
  const fs = require('fs');
  const path = require('path');
  
  const envPath = path.join(process.cwd(), '.env');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    printSuccess('.env file found');
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check for important environment variables
    const requiredVars = [
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET', 
      'ADMIN_EMAILS',
      'NEXT_PUBLIC_BETA_MODE'
    ];
    
    for (const varName of requiredVars) {
      if (envContent.includes(varName)) {
        printSuccess(`${varName} is configured`);
      } else {
        printError(`${varName} is missing from .env`);
      }
    }
  } else {
    printError('.env file not found');
  }
  
  if (fs.existsSync(envLocalPath)) {
    printSuccess('.env.local file found');
  } else {
    printWarning('.env.local file not found (optional)');
  }
}

async function main() {
  console.log(`${colors.bold}${colors.blue}🧪 VYNL Platform Testing Suite${colors.reset}\n`);
  
  // Check if development server is running
  printInfo('Make sure your development server is running on http://localhost:3001');
  const serverRunning = await askQuestion('Is the development server running? (y/n): ');
  
  if (serverRunning.toLowerCase() !== 'y') {
    printError('Please start the development server with: npm run dev');
    process.exit(1);
  }
  
  // Environment check
  await checkEnvironmentSetup();
  
  // Ask what type of testing to do
  console.log(`\n${colors.bold}What would you like to test?${colors.reset}`);
  console.log('1. Page-by-page testing (opens each page in browser)');
  console.log('2. Manual feature checklist');
  console.log('3. Both (recommended)');
  
  const choice = await askQuestion('Choose option (1/2/3): ');
  
  const results = [];
  
  if (choice === '1' || choice === '3') {
    printHeader('Page Testing Phase');
    
    for (const pageInfo of testUrls) {
      const result = await testPage(pageInfo);
      results.push(result);
      
      if (result.status === 'failed') {
        const continueTest = await askQuestion('Continue testing other pages? (y/n): ');
        if (continueTest.toLowerCase() !== 'y') {
          break;
        }
      }
    }
  }
  
  if (choice === '2' || choice === '3') {
    await runManualTests();
  }
  
  // Show results summary
  if (results.length > 0) {
    printHeader('Testing Results Summary');
    
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    
    console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
    console.log(`${colors.yellow}⏭️  Skipped: ${skipped}${colors.reset}`);
    
    if (failed > 0) {
      console.log(`\n${colors.bold}Pages with issues:${colors.reset}`);
      results.filter(r => r.status === 'failed').forEach(result => {
        console.log(`  • ${result.page}: ${result.issues || 'Issues not specified'}`);
      });
    }
  }
  
  printInfo('\n🎉 Testing complete! Check TESTING_GUIDE.md for detailed testing instructions.');
  
  rl.close();
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Testing interrupted. Goodbye!');
  rl.close();
  process.exit(0);
});

main().catch(console.error);
