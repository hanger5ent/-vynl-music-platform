import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - Vynl',
  description: 'Terms of Service and user agreement for the Vynl music streaming platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Terms of Service
          </h1>

          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing or using the Vynl music streaming platform ("Service"), you agree to be bound 
                by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use 
                our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                Vynl is a music streaming platform that allows artists to upload, share, and monetize their 
                music content. The Service includes features for music discovery, social interaction, 
                purchasing, and community engagement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">3.1 Registration</h3>
                <p className="text-gray-700">
                  You must register for an account to use certain features of our Service. You agree to 
                  provide accurate, current, and complete information during registration.
                </p>
                
                <h3 className="text-lg font-medium text-gray-900">3.2 Creator Access</h3>
                <p className="text-gray-700">
                  Creator and artist accounts are available by invitation only. You must receive and 
                  validate an invitation code to access creator features.
                </p>
                
                <h3 className="text-lg font-medium text-gray-900">3.3 Account Security</h3>
                <p className="text-gray-700">
                  You are responsible for maintaining the confidentiality of your account credentials 
                  and for all activities that occur under your account.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Content and Intellectual Property</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">4.1 Your Content</h3>
                <p className="text-gray-700">
                  You retain ownership of any content you upload to the Service. By uploading content, 
                  you grant Vynl a non-exclusive, worldwide, royalty-free license to use, reproduce, 
                  distribute, and display your content on the platform.
                </p>
                
                <h3 className="text-lg font-medium text-gray-900">4.2 Content Standards</h3>
                <p className="text-gray-700">
                  You agree not to upload content that is illegal, harmful, threatening, abusive, 
                  defamatory, vulgar, obscene, or otherwise objectionable. You must own or have the 
                  necessary rights to all content you upload.
                </p>
                
                <h3 className="text-lg font-medium text-gray-900">4.3 Copyright Compliance</h3>
                <p className="text-gray-700">
                  You must not upload content that infringes on the intellectual property rights of others. 
                  We comply with the Digital Millennium Copyright Act (DMCA) and will remove infringing 
                  content upon proper notice.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Community Guidelines</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">5.1 Respectful Interaction</h3>
                <p className="text-gray-700">
                  Users must interact respectfully with other community members. Harassment, hate speech, 
                  and discriminatory behavior are not tolerated.
                </p>
                
                <h3 className="text-lg font-medium text-gray-900">5.2 Authentic Engagement</h3>
                <p className="text-gray-700">
                  Users must not engage in artificial manipulation of metrics, including but not limited 
                  to fake streams, likes, or follows.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Commercial Terms</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">6.1 Revenue Sharing</h3>
                <p className="text-gray-700">
                  Artists retain the majority of revenue generated from their content. Specific revenue 
                  sharing terms are outlined in separate artist agreements.
                </p>
                
                <h3 className="text-lg font-medium text-gray-900">6.2 Payments</h3>
                <p className="text-gray-700">
                  Payments are processed through secure third-party payment processors. Users are responsible 
                  for applicable taxes on their transactions.
                </p>
                
                <h3 className="text-lg font-medium text-gray-900">6.3 Marketplace</h3>
                <p className="text-gray-700">
                  Artists may sell merchandise and other products through our integrated marketplace. 
                  All sales are subject to our marketplace terms and conditions.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibent text-gray-900 mb-4">7. Privacy</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and 
                protect your information when you use our Service. By using our Service, you agree to 
                our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">You may not use our Service:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>For any unlawful purpose or to solicit others to take unlawful actions</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account and bar access to the Service immediately, 
                without prior notice or liability, for any reason whatsoever, including without limitation 
                if you breach the Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Disclaimers</h2>
              <p className="text-gray-700 mb-4">
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no representations 
                or warranties of any kind, express or implied, as to the operation of the Service or the 
                information, content, materials, or products included on the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                In no event shall Vynl, nor its directors, employees, partners, agents, suppliers, or 
                affiliates, be liable for any indirect, incidental, special, consequential, or punitive 
                damages, including without limitation, loss of profits, data, use, goodwill, or other 
                intangible losses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These Terms shall be interpreted and governed by the laws of [Your Jurisdiction], without 
                regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                If a revision is material, we will try to provide at least 30 days notice prior to any new 
                terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:legal@vynl.com" className="text-blue-600 hover:text-blue-700">
                  legal@vynl.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
