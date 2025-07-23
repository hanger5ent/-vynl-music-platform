"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';

interface CampaignComposerProps {
  onClose?: () => void;
  onSent?: (campaignId: string) => void;
}

export default function CampaignComposer({ onClose, onSent }: CampaignComposerProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    fromName: session?.user?.name || '',
    targetTiers: [] as string[],
    scheduleFor: 'now' as 'now' | 'later',
    scheduledDate: '',
    scheduledTime: '',
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ 
    success: boolean; 
    message: string; 
    messageId?: string;
    stats?: { sent: number; failed: number; total: number };
  } | null>(null);

  const handleTierToggle = (tier: string) => {
    setFormData(prev => ({
      ...prev,
      targetTiers: prev.targetTiers.includes(tier)
        ? prev.targetTiers.filter(t => t !== tier)
        : [...prev.targetTiers, tier]
    }));
  };

  const insertTemplate = (template: string) => {
    const templates = {
      newRelease: `
<h2>🎵 New Release Alert!</h2>
<p>Hey {subscriber.name},</p>
<p>I'm excited to share my latest track with you! As a {subscriber.tier} subscriber, you get early access before anyone else.</p>
<div style="text-align: center; margin: 20px 0;">
  <a href="#" style="background: linear-gradient(45deg, #8b5cf6, #3b82f6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
    🎧 Listen Now
  </a>
</div>
<p>Let me know what you think in the comments!</p>
<p>Much love,<br>{creator.name}</p>
      `,
      behindScenes: `
<h2>🎬 Behind the Scenes</h2>
<p>Hi {subscriber.name},</p>
<p>Want to see how the magic happens? Here's an exclusive look at my creative process...</p>
<p>As a {subscriber.tier} member, you're getting this exclusive content first!</p>
<p>Thanks for supporting my music,<br>{creator.name}</p>
      `,
      newsletter: `
<h2>📬 Monthly Update</h2>
<p>Hello {subscriber.name},</p>
<p>Here's what's been happening in my musical world this month:</p>
<ul>
  <li>🎵 New songs in progress</li>
  <li>🎤 Upcoming performances</li>
  <li>📸 Recent photos and videos</li>
</ul>
<p>Thank you for being an amazing {subscriber.tier} subscriber!</p>
<p>Best,<br>{creator.name}</p>
      `
    };

    setFormData(prev => ({
      ...prev,
      content: templates[template as keyof typeof templates]
    }));
  };

  const sendCampaign = async () => {
    try {
      setSending(true);
      
      const response = await fetch('/api/creator/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: formData.subject,
          content: formData.content,
          fromName: formData.fromName,
          targetTiers: formData.targetTiers,
          scheduleFor: formData.scheduleFor,
          scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSendResult(result);
        if (onSent) {
          onSent(result.campaignId);
        }
      } else {
        throw new Error(result.error || 'Failed to send campaign');
      }
    } catch (error) {
      console.error('Campaign send failed:', error);
      alert('Failed to send campaign. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getPreviewContent = () => {
    return formData.content
      .replace(/\{subscriber\.name\}/g, 'John Doe')
      .replace(/\{subscriber\.tier\}/g, 'Premium')
      .replace(/\{creator\.name\}/g, formData.fromName || 'Creator');
  };

  if (sendResult) {
    return (
      <Card className="p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-white mb-4">Campaign Sent Successfully!</h2>
        <p className="text-gray-300 mb-6">{sendResult.message}</p>
        
        <div className="bg-green-900/30 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-300">{sendResult.stats?.sent || 0}</div>
              <div className="text-green-200 text-sm">Sent</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-300">{sendResult.stats?.failed || 0}</div>
              <div className="text-yellow-200 text-sm">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-300">{sendResult.stats?.total || 0}</div>
              <div className="text-blue-200 text-sm">Total</div>
            </div>
          </div>
        </div>

        <div className="space-x-4">
          <button
            onClick={() => {
              setSendResult(null);
              setFormData({
                subject: '',
                content: '',
                fromName: session?.user?.name || '',
                targetTiers: [],
                scheduleFor: 'now',
                scheduledDate: '',
                scheduledTime: '',
              });
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Send Another Campaign
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">📧 Create Email Campaign</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                previewMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {previewMode ? '✏️ Edit' : '👀 Preview'}
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {!previewMode ? (
          <div className="space-y-6">
            {/* Campaign Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white mb-2">From Name:</label>
                <input
                  type="text"
                  value={formData.fromName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fromName: e.target.value }))}
                  placeholder="Your artist name"
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">Subject Line:</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Your email subject"
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-white mb-2">Target Subscribers:</label>
              <div className="flex items-center space-x-4">
                {['BASIC', 'PREMIUM', 'VIP'].map(tier => (
                  <label key={tier} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.targetTiers.includes(tier)}
                      onChange={() => handleTierToggle(tier)}
                      className="mr-2"
                    />
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                      tier === 'BASIC' ? 'bg-green-600' : 
                      tier === 'PREMIUM' ? 'bg-purple-600' : 'bg-yellow-600'
                    }`}>
                      {tier}
                    </span>
                  </label>
                ))}
                {formData.targetTiers.length === 0 && (
                  <span className="text-gray-400 text-sm">All subscribers will receive this email</span>
                )}
              </div>
            </div>

            {/* Email Templates */}
            <div>
              <label className="block text-white mb-2">Quick Templates:</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => insertTemplate('newRelease')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  🎵 New Release
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('behindScenes')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  🎬 Behind Scenes
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('newsletter')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  📬 Newsletter
                </button>
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-white mb-2">Email Content:</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your email content here... Use {subscriber.name}, {subscriber.tier}, and {creator.name} for personalization."
                className="w-full h-64 px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-purple-500 focus:outline-none font-mono text-sm resize-none"
              />
              <div className="text-gray-400 text-xs mt-2">
                💡 Pro tip: Use HTML for formatting. Available placeholders: {'{subscriber.name}'}, {'{subscriber.tier}'}, {'{creator.name}'}
              </div>
            </div>

            {/* Scheduling */}
            <div>
              <label className="block text-white mb-2">Send Schedule:</label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="schedule"
                    value="now"
                    checked={formData.scheduleFor === 'now'}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduleFor: 'now' }))}
                    className="mr-2"
                  />
                  <span className="text-white">Send immediately</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="schedule"
                    value="later"
                    checked={formData.scheduleFor === 'later'}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduleFor: 'later' }))}
                    className="mr-2"
                  />
                  <span className="text-white">Schedule for later</span>
                </label>
                
                {formData.scheduleFor === 'later' && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                    />
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className="px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Preview Mode */
          <div>
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <div className="text-sm text-gray-400 mb-2">Preview:</div>
              <div className="text-white font-semibold">Subject: {formData.subject || 'No subject'}</div>
              <div className="text-gray-300 text-sm">From: {formData.fromName || 'Creator'}</div>
              {formData.targetTiers.length > 0 && (
                <div className="text-purple-300 text-sm">
                  To: {formData.targetTiers.join(', ')} subscribers
                </div>
              )}
            </div>
            
            <div 
              className="bg-white p-6 rounded-lg text-black min-h-64"
              dangerouslySetInnerHTML={{ __html: getPreviewContent() || '<p>No content to preview</p>' }}
            />
          </div>
        )}
      </Card>

      {/* Send Button */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-gray-300">
            {formData.targetTiers.length > 0 
              ? `Sending to ${formData.targetTiers.join(', ')} subscribers`
              : 'Sending to all subscribers'
            }
          </div>
          
          <button
            onClick={sendCampaign}
            disabled={!formData.subject || !formData.content || sending}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                📧 {formData.scheduleFor === 'now' ? 'Send Now' : 'Schedule Campaign'}
              </>
            )}
          </button>
        </div>
      </Card>
    </div>
  );
}
