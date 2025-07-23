#!/usr/bin/env node

/**
 * Quick Resend Setup for Music Platform
 * 
 * This script helps you configure Resend email service quickly.
 * Run with: node scripts/setup-resend.js
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupResend() {
  console.log(`
🎵 Music Platform - Resend Email Setup
=====================================

Welcome! Let's set up email services for your platform.

You'll need:
1. A Resend account (sign up at resend.com)
2. Your API key from the Resend dashboard
3. Optionally, a verified domain for custom email addresses

`);

  try {
    // Get API key
    const apiKey = await question('Enter your Resend API key (starts with re_): ');
    
    if (!apiKey || !apiKey.startsWith('re_')) {
      console.log('❌ Invalid API key format. It should start with "re_"');
      process.exit(1);
    }

    // Get email from address
    const emailFrom = await question('Enter your "from" email address (or press Enter for default): ') || 'onboarding@resend.dev';

    // Update .env.local file
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';
    
    try {
      envContent = fs.readFileSync(envPath, 'utf8');
    } catch (error) {
      console.log('📄 Creating new .env.local file...');
    }

    // Update or add Resend configuration
    if (envContent.includes('RESEND_API_KEY=')) {
      envContent = envContent.replace(/RESEND_API_KEY=.*/, `RESEND_API_KEY=${apiKey}`);
    } else {
      envContent += `\n# Resend Email Configuration\nRESEND_API_KEY=${apiKey}\n`;
    }

    if (envContent.includes('EMAIL_FROM=')) {
      envContent = envContent.replace(/EMAIL_FROM=.*/, `EMAIL_FROM=${emailFrom}`);
    } else {
      envContent += `EMAIL_FROM=${emailFrom}\n`;
    }

    fs.writeFileSync(envPath, envContent);

    console.log('✅ Configuration updated successfully!');
    console.log(`
📧 Your Email Setup:
- API Key: ${apiKey.substring(0, 8)}...
- From Address: ${emailFrom}
- Configuration saved to .env.local

🚀 Next Steps:
1. Restart your development server (npm run dev)
2. Test email sending at: http://localhost:3003/stripe-test
3. Check the "Test Email" section to send a test message

Your platform can now send:
- Welcome emails to new users
- Payment confirmation emails  
- Subscription notifications
- Creator invitations
- Newsletter updates

Happy streaming! 🎵
`);

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupResend();
}

module.exports = { setupResend };
