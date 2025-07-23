import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY && !process.env.SMTP_HOST) {
  console.warn('No email service configured. Email notifications will be logged only.')
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
}

export interface NewsletterSubscription {
  email: string
  name?: string
  preferences?: {
    artistUpdates?: boolean
    platformNews?: boolean
    promotions?: boolean
  }
  metadata?: Record<string, unknown>
}

export interface CreatorInvite {
  email: string
  inviterName: string
  inviterEmail: string
  message?: string
  inviteCode?: string
}

class EmailService {
  private defaultFrom: string

  constructor() {
    this.defaultFrom = process.env.EMAIL_FROM || 'noreply@musicplatform.com'
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Use Resend if available
      if (resend) {
        const emailData: {
          from: string;
          to: string[];
          subject: string;
          html?: string;
          text?: string;
          attachments?: Array<{
            filename: string;
            content: string | Buffer;
            contentType?: string;
          }>;
        } = {
          from: options.from || this.defaultFrom,
          to: Array.isArray(options.to) ? options.to : [options.to],
          subject: options.subject,
        }
        
        if (options.html) {
          emailData.html = options.html
        } else if (options.text) {
          emailData.text = options.text
        } else {
          emailData.text = options.subject // Fallback
        }
        
        // Ensure at least html or text is present
        if (!emailData.html && !emailData.text) {
          emailData.text = options.subject
        }
        
        const result = await resend.emails.send(emailData as Parameters<typeof resend.emails.send>[0])
        
        return { success: true, messageId: result.data?.id }
      }

      // Fallback to console logging in development
      console.log('📧 EMAIL (Development Mode):')
      console.log(`From: ${options.from || this.defaultFrom}`)
      console.log(`To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`)
      console.log(`Subject: ${options.subject}`)
      console.log('Content:', options.html || options.text)
      console.log('---')

      return { success: true, messageId: `dev-${Date.now()}` }

    } catch (error) {
      console.error('Email sending failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string, userType: 'fan' | 'creator'): Promise<boolean> {
    const subject = `Welcome to our Music Platform! 🎵`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8b5cf6;">Welcome ${userName}!</h1>
        <p>Thank you for joining our music streaming platform as a ${userType}.</p>
        
        ${userType === 'creator' ? `
          <h2>Getting Started as a Creator:</h2>
          <ul>
            <li>Set up your artist profile</li>
            <li>Upload your music and content</li>
            <li>Create subscription tiers for your fans</li>
            <li>Set up your merchandise store</li>
          </ul>
        ` : `
          <h2>Getting Started as a Fan:</h2>
          <ul>
            <li>Discover amazing artists</li>
            <li>Subscribe to support your favorites</li>
            <li>Get exclusive content and early releases</li>
            <li>Connect with artists and other fans</li>
          </ul>
        `}
        
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Happy music streaming! 🎵</p>
      </div>
    `

    const result = await this.sendEmail({
      to: userEmail,
      subject,
      html,
    })

    return result.success
  }

  async sendSubscriptionConfirmation(
    fanEmail: string, 
    fanName: string, 
    artistName: string, 
    tierName: string
  ): Promise<boolean> {
    const subject = `Subscription Confirmed: Supporting ${artistName} 🎵`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8b5cf6;">Subscription Confirmed!</h1>
        <p>Hi ${fanName},</p>
        <p>Thank you for subscribing to support <strong>${artistName}</strong>!</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Subscription Details:</h3>
          <p style="margin: 5px 0;"><strong>Artist:</strong> ${artistName}</p>
          <p style="margin: 5px 0;"><strong>Tier:</strong> ${tierName}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> Active</p>
        </div>
        
        <p>You now have access to exclusive content, early releases, and direct communication with ${artistName}.</p>
        <p>Thank you for supporting independent artists!</p>
      </div>
    `

    const result = await this.sendEmail({
      to: fanEmail,
      subject,
      html,
    })

    return result.success
  }

  async sendCreatorInvite(invite: CreatorInvite): Promise<boolean> {
    const subject = `You're Invited to Join Our Music Platform! 🎵`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8b5cf6;">You're Invited!</h1>
        <p>Hi there!</p>
        <p><strong>${invite.inviterName}</strong> (${invite.inviterEmail}) has invited you to join our music streaming platform as a creator.</p>
        
        ${invite.message ? `
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">Personal Message:</h3>
            <p style="font-style: italic;">"${invite.message}"</p>
          </div>
        ` : ''}
        
        <h2>Why Join Our Platform?</h2>
        <ul>
          <li>Build direct relationships with your fans</li>
          <li>Monetize your music through subscriptions</li>
          <li>Sell merchandise and digital products</li>
          <li>Access detailed analytics and insights</li>
          <li>No upfront costs - you keep the majority of earnings</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/auth/signin" 
             style="background: linear-gradient(45deg, #8b5cf6, #3b82f6); 
                    color: white; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    display: inline-block;
                    font-weight: bold;">
            Join as a Creator
          </a>
        </div>
        
        ${invite.inviteCode ? `
          <p><strong>Invite Code:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${invite.inviteCode}</code></p>
        ` : ''}
        
        <p>Looking forward to having you on board!</p>
      </div>
    `

    const result = await this.sendEmail({
      to: invite.email,
      subject,
      html,
    })

    return result.success
  }

  async subscribeToNewsletter(subscription: NewsletterSubscription): Promise<boolean> {
    // Send confirmation email
    const subject = `Newsletter Subscription Confirmed! 📬`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8b5cf6;">Welcome to Our Newsletter!</h1>
        <p>Hi ${subscription.name || 'there'},</p>
        <p>Thank you for subscribing to our newsletter!</p>
        
        <h3>You'll receive updates about:</h3>
        <ul>
          ${subscription.preferences?.artistUpdates !== false ? '<li>New artist features and releases</li>' : ''}
          ${subscription.preferences?.platformNews !== false ? '<li>Platform updates and new features</li>' : ''}
          ${subscription.preferences?.promotions !== false ? '<li>Special offers and promotions</li>' : ''}
        </ul>
        
        <p>You can update your preferences or unsubscribe at any time.</p>
        <p>Stay tuned for the latest music platform news! 🎵</p>
      </div>
    `

    const result = await this.sendEmail({
      to: subscription.email,
      subject,
      html,
    })

    return result.success
  }

  async sendPaymentConfirmation(
    userEmail: string,
    userName: string,
    amount: number,
    currency: string,
    description: string
  ): Promise<boolean> {
    const subject = `Payment Confirmation - $${(amount / 100).toFixed(2)}`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8b5cf6;">Payment Confirmed!</h1>
        <p>Hi ${userName},</p>
        <p>Your payment has been processed successfully.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Payment Details:</h3>
          <p style="margin: 5px 0;"><strong>Amount:</strong> $${(amount / 100).toFixed(2)} ${currency.toUpperCase()}</p>
          <p style="margin: 5px 0;"><strong>Description:</strong> ${description}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <p>Thank you for your purchase!</p>
      </div>
    `

    const result = await this.sendEmail({
      to: userEmail,
      subject,
      html,
    })

    return result.success
  }
}

export const emailService = new EmailService()
