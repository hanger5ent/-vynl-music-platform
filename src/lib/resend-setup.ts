import { Resend } from 'resend';

/**
 * Resend Email Service Setup
 * 
 * This script helps you set up and manage your Resend API keys for the music platform.
 * Make sure to run this in a secure environment and never commit API keys to version control.
 */

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY || 'your-api-key-here');

/**
 * Create a new API key for production use
 */
export async function createProductionApiKey() {
  try {
    console.log('🔑 Creating production API key...');
    
    const apiKey = await resend.apiKeys.create({ 
      name: 'Music Platform Production' 
    });
    
    console.log('✅ Production API key created successfully!');
    console.log('Key ID:', apiKey.data?.id);
    console.log('Remember to save this key securely - it won\'t be shown again.');
    
    return apiKey;
  } catch (error) {
    console.error('❌ Failed to create API key:', error);
    throw error;
  }
}

/**
 * List all existing API keys
 */
export async function listApiKeys() {
  try {
    console.log('📋 Listing all API keys...');
    
    const keys = await resend.apiKeys.list();
    
    console.log('📊 Your API Keys:');
    keys.data?.forEach(key => {
      console.log(`- ${key.name} (ID: ${key.id}) - Created: ${key.created_at}`);
    });
    
    return keys;
  } catch (error) {
    console.error('❌ Failed to list API keys:', error);
    throw error;
  }
}

/**
 * Test email sending functionality
 */
export async function testEmailSending(testEmail: string) {
  try {
    console.log(`📧 Testing email sending to ${testEmail}...`);
    
    const email = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: testEmail,
      subject: 'Music Platform - Email Test ✅',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #8b5cf6;">🎵 Email Test Successful!</h1>
          <p>Congratulations! Your Resend email integration is working perfectly.</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>✅ What's Working:</h3>
            <ul>
              <li>Resend API connection</li>
              <li>Email template rendering</li>
              <li>HTML formatting</li>
              <li>Delivery to your inbox</li>
            </ul>
          </div>
          
          <p>Your music streaming platform is ready for:</p>
          <ul>
            <li>📧 Welcome emails for new users</li>
            <li>💰 Payment confirmation emails</li>
            <li>📊 Subscription notifications</li>
            <li>🎤 Creator invite emails</li>
            <li>📬 Newsletter management</li>
          </ul>
          
          <p style="margin-top: 30px;">
            <strong>Next steps:</strong><br>
            Update your .env.local file with your production Resend API key and start sending beautiful emails!
          </p>
          
          <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This email was sent from your Music Streaming Platform<br>
            Powered by Resend Email API
          </p>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Email ID:', email.data?.id);
    console.log('Check your inbox at:', testEmail);
    
    return email;
  } catch (error) {
    console.error('❌ Failed to send test email:', error);
    throw error;
  }
}

/**
 * Validate domain setup for custom email addresses
 */
export async function validateDomain(domain: string) {
  try {
    console.log(`🔍 Validating domain: ${domain}`);
    
    const domains = await resend.domains.list();
    
    // Check if any domains match the requested domain
    if (domains.data && Array.isArray(domains.data)) {
      const domainExists = (domains.data as Array<{ name: string; id: string; status: string }>).find((d) => d.name === domain);
      
      if (domainExists) {
        console.log(`✅ Domain ${domain} is verified and ready`);
        console.log('Status:', domainExists.status);
        return domainExists;
      }
    }
    
    console.log(`⚠️ Domain ${domain} not found in your Resend account`);
    console.log('You can send from onboarding@resend.dev for testing');
    return null;
  } catch (error) {
    console.error('❌ Failed to validate domain:', error);
    throw error;
  }
}

/**
 * Send email campaign to creator's subscribers
 */
export async function sendCreatorCampaign(
  creatorEmail: string,
  creatorName: string,
  subscribers: Array<{ email: string; name?: string; tier?: string }>,
  campaign: {
    subject: string;
    content: string;
    fromName?: string;
  }
) {
  try {
    console.log(`📧 Sending campaign to ${subscribers.length} subscribers...`);
    
    const fromEmail = process.env.EMAIL_FROM || 'noreply@yourdomain.com';
    const fromName = campaign.fromName || creatorName;
    
    // Send individual emails to each subscriber
    const emailPromises = subscribers.map(async (subscriber) => {
      const personalizedContent = campaign.content
        .replace(/\{subscriber\.name\}/g, subscriber.name || 'Fan')
        .replace(/\{subscriber\.tier\}/g, subscriber.tier || 'subscriber')
        .replace(/\{creator\.name\}/g, creatorName);

      return resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: subscriber.email,
        subject: campaign.subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            ${personalizedContent}
            
            <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
            <div style="color: #6b7280; font-size: 14px; text-align: center;">
              <p>This email was sent to you because you're subscribed to ${creatorName}'s updates.</p>
              <p>
                <a href="${process.env.NEXTAUTH_URL}/unsubscribe?email=${encodeURIComponent(subscriber.email)}&creator=${encodeURIComponent(creatorEmail)}" 
                   style="color: #8b5cf6;">Unsubscribe</a> | 
                <a href="${process.env.NEXTAUTH_URL}/creator/${creatorName.toLowerCase().replace(/\s+/g, '-')}" 
                   style="color: #8b5cf6;">View Profile</a>
              </p>
            </div>
          </div>
        `,
        replyTo: creatorEmail, // Allow subscribers to reply directly to creator
      });
    });

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ Campaign sent! ${successful} successful, ${failed} failed`);
    
    return {
      success: true,
      sent: successful,
      failed: failed,
      total: subscribers.length,
      results: results.map((result, index) => ({
        email: subscribers[index].email,
        success: result.status === 'fulfilled',
        error: result.status === 'rejected' ? result.reason?.message : undefined,
        messageId: result.status === 'fulfilled' ? result.value.data?.id : undefined,
      }))
    };
  } catch (error) {
    console.error('❌ Failed to send campaign:', error);
    throw error;
  }
}

/**
 * Send creator invitation email
 */
export async function sendCreatorInvite(
  inviteeEmail: string,
  inviterName: string,
  inviterEmail: string,
  message?: string,
  inviteCode?: string
) {
  try {
    console.log(`📧 Sending creator invitation to ${inviteeEmail}...`);
    
    const email = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: inviteeEmail,
      subject: `You're Invited to Join Our Music Platform! 🎵`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #8b5cf6;">🎵 You're Invited to Be a Creator!</h1>
          <p>Hi there!</p>
          <p><strong>${inviterName}</strong> ${inviterEmail ? `(${inviterEmail})` : ''} has invited you to join our music streaming platform as a creator.</p>
          
          ${message ? `
            <div style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); padding: 20px; border-radius: 12px; margin: 20px 0;">
              <h3 style="color: white; margin: 0 0 10px 0;">💌 Personal Message:</h3>
              <p style="color: white; font-style: italic; margin: 0;">"${message}"</p>
            </div>
          ` : ''}
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e293b; margin-top: 0;">🚀 Why Join Our Platform?</h2>
            <ul style="color: #475569; margin: 0;">
              <li>💰 <strong>Monetize your music</strong> - Set up subscription tiers for fans</li>
              <li>🎵 <strong>Direct fan relationships</strong> - Build a loyal community</li>
              <li>🏪 <strong>Sell merchandise</strong> - Integrated shop for your products</li>
              <li>📊 <strong>Detailed analytics</strong> - Track your growth and earnings</li>
              <li>📧 <strong>Email marketing tools</strong> - Connect directly with subscribers</li>
              <li>🎤 <strong>No upfront costs</strong> - You keep the majority of earnings</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/auth/signin?callbackUrl=/creator" 
               style="background: linear-gradient(45deg, #8b5cf6, #3b82f6); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: bold;
                      font-size: 18px;
                      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);">
              🎵 Join as a Creator
            </a>
          </div>
          
          ${inviteCode ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <p style="color: #92400e; margin: 0 0 5px 0; font-weight: bold;">Your Invite Code:</p>
              <code style="background: #fffbeb; color: #b45309; padding: 8px 16px; border-radius: 6px; font-size: 18px; font-weight: bold; letter-spacing: 2px;">${inviteCode}</code>
              <p style="color: #92400e; margin: 5px 0 0 0; font-size: 14px;">Use this code during signup for special creator perks!</p>
            </div>
          ` : ''}
          
          <div style="background: linear-gradient(135deg, #1e293b, #334155); padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <h3 style="color: white; margin: 0 0 10px 0;">🎯 Ready to Start?</h3>
            <p style="color: #cbd5e1; margin: 0 0 15px 0;">Join thousands of creators already earning from their music!</p>
            <a href="${process.env.NEXTAUTH_URL}" 
               style="color: #8b5cf6; text-decoration: none; font-weight: bold;">
              Visit Our Platform →
            </a>
          </div>
          
          <p style="color: #64748b;">
            We're excited to have you join our creative community! If you have any questions, 
            feel free to reply to this email or contact our support team.
          </p>
          
          <hr style="margin: 30px 0; border: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 14px; text-align: center;">
            This invitation was sent by ${inviterName} via our Music Streaming Platform<br>
            <a href="${process.env.NEXTAUTH_URL}" style="color: #8b5cf6;">Visit Platform</a> | 
            <a href="${process.env.NEXTAUTH_URL}/support" style="color: #8b5cf6;">Support</a>
          </p>
        </div>
      `,
      replyTo: inviterEmail || undefined, // Allow invitee to reply directly to inviter
    });
    
    console.log('✅ Creator invitation sent successfully!');
    console.log('Email ID:', email.data?.id);
    
    return email;
  } catch (error) {
    console.error('❌ Failed to send creator invitation:', error);
    throw error;
  }
}

/**
 * Send welcome email to new subscriber
 */
export async function sendSubscriberWelcome(
  subscriberEmail: string,
  subscriberName: string,
  creatorName: string,
  tier: string,
  amount: number,
  currency: string
) {
  try {
    console.log(`📧 Sending welcome email to new ${tier} subscriber...`);
    
    const email = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: subscriberEmail,
      subject: `Welcome to ${creatorName}'s ${tier} tier! 🎵`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #8b5cf6;">Welcome ${subscriberName}!</h1>
          <p>Thank you for subscribing to <strong>${creatorName}'s ${tier} tier</strong>!</p>
          
          <div style="background: linear-gradient(45deg, #8b5cf6, #3b82f6); padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
            <h2 style="color: white; margin: 0;">🎵 You're now a ${tier} subscriber!</h2>
            <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">
              ${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)}/${tier === 'BASIC' ? 'month' : 'month'}
            </p>
          </div>
          
          <h2>🎁 What you get as a ${tier} subscriber:</h2>
          <ul>
            ${tier === 'BASIC' ? `
              <li>🎵 Access to exclusive tracks</li>
              <li>💬 Direct messaging with ${creatorName}</li>
              <li>📧 Monthly newsletters and updates</li>
            ` : tier === 'PREMIUM' ? `
              <li>🎵 All Basic tier benefits</li>
              <li>🎧 Early access to new releases</li>
              <li>📱 Behind-the-scenes content</li>
              <li>🎤 Monthly live Q&A sessions</li>
            ` : `
              <li>🎵 All Premium tier benefits</li>
              <li>👑 VIP-only content and experiences</li>
              <li>📞 Personal video calls with ${creatorName}</li>
              <li>🎫 Priority access to concert tickets</li>
              <li>💿 Physical merchandise included</li>
            `}
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/creator/${creatorName.toLowerCase().replace(/\s+/g, '-')}" 
               style="background: linear-gradient(45deg, #8b5cf6, #3b82f6); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: bold;">
              Visit ${creatorName}'s Profile
            </a>
          </div>
          
          <p style="margin-top: 30px;">
            We're excited to have you as part of ${creatorName}'s community! 
            Keep an eye on your inbox for exclusive content and updates.
          </p>
          
          <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Questions? Reply to this email or visit our <a href="${process.env.NEXTAUTH_URL}/support" style="color: #8b5cf6;">support center</a><br>
            <a href="${process.env.NEXTAUTH_URL}/unsubscribe?email=${encodeURIComponent(subscriberEmail)}" style="color: #8b5cf6;">Unsubscribe from emails</a>
          </p>
        </div>
      `
    });
    
    console.log('✅ Subscriber welcome email sent!');
    console.log('Email ID:', email.data?.id);
    
    return email;
  } catch (error) {
    console.error('❌ Failed to send subscriber welcome email:', error);
    throw error;
  }
}

/**
 * Setup wizard for new Resend integration
 */
export async function setupWizard() {
  console.log(`
🎵 Music Platform - Resend Email Setup Wizard
===========================================

This wizard will help you set up email services for your music streaming platform.

📋 Checklist:
□ Resend account created
□ API key generated  
□ Domain verified (optional)
□ .env.local updated
□ Test email sent

Let's get started!
`);

  try {
    // List current API keys
    await listApiKeys();
    
    console.log(`
📧 Email Features Ready:
- Welcome emails for new fans and creators
- Subscription confirmation emails  
- Payment success notifications
- Creator invitation system
- Newsletter management
- Custom HTML email templates

🔧 Configuration:
Add your Resend API key to .env.local:
RESEND_API_KEY=re_your_actual_api_key_here
EMAIL_FROM=noreply@yourdomain.com (or onboarding@resend.dev for testing)
`);

  } catch (error) {
    console.error('Setup wizard failed:', error);
  }
}

// Export the configured Resend instance for use in other parts of the app
export { resend };

// Main execution for testing
if (require.main === module) {
  console.log('🚀 Running Resend setup...');
  setupWizard().catch(console.error);
}
