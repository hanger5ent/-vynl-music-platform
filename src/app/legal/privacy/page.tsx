import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Vynl',
  description: 'Privacy Policy explaining how Vynl collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Privacy Policy
          </h1>

          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Vynl ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our 
                music streaming platform and related services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">2.1 Personal Information</h3>
                <p className="text-gray-700 mb-4">We may collect the following personal information:</p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Name and email address</li>
                  <li>Username and profile information</li>
                  <li>Payment and billing information</li>
                  <li>Contact information for customer support</li>
                </ul>
                
                <h3 className="text-lg font-medium text-gray-900">2.2 Usage Information</h3>
                <p className="text-gray-700 mb-4">We automatically collect information about how you use our Service:</p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Music listening history and preferences</li>
                  <li>Search queries and interactions</li>
                  <li>Device information and IP address</li>
                  <li>Browser type and operating system</li>
                  <li>Pages visited and time spent on the platform</li>
                </ul>
                
                <h3 className="text-lg font-medium text-gray-900">2.3 Content Information</h3>
                <p className="text-gray-700">
                  For artists and creators, we collect information about uploaded content, including 
                  metadata, artwork, and performance analytics.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use your information to:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Provide and maintain our Service</li>
                <li>Process payments and transactions</li>
                <li>Personalize your music experience</li>
                <li>Communicate with you about your account</li>
                <li>Provide customer support</li>
                <li>Improve our Service and develop new features</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">4.1 Third-Party Service Providers</h3>
                <p className="text-gray-700">
                  We may share your information with trusted third-party service providers who assist 
                  us in operating our platform, including payment processors, analytics providers, 
                  and cloud storage services.
                </p>
                
                <h3 className="text-lg font-medium text-gray-900">4.2 Artists and Content Creators</h3>
                <p className="text-gray-700">
                  We may share anonymized listening data with artists to help them understand their 
                  audience and improve their content.
                </p>
                
                <h3 className="text-lg font-medium text-gray-900">4.3 Legal Requirements</h3>
                <p className="text-gray-700">
                  We may disclose your information if required to do so by law or in response to valid 
                  legal requests by public authorities.
                </p>
                
                <h3 className="text-lg font-medium text-gray-900">4.4 Business Transfers</h3>
                <p className="text-gray-700">
                  In the event of a merger, acquisition, or sale of assets, your information may be 
                  transferred as part of that transaction.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational security measures to protect your 
                personal information against unauthorized access, alteration, disclosure, or destruction. 
                However, no internet transmission is completely secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your personal information for as long as necessary to provide our services 
                and fulfill the purposes outlined in this Privacy Policy, unless a longer retention 
                period is required or permitted by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
              <p className="text-gray-700 mb-4">Depending on your location, you may have the following rights:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of your personal information</li>
                <li>Restriction of processing</li>
                <li>Data portability</li>
                <li>Objection to processing</li>
                <li>Withdrawal of consent</li>
              </ul>
              <p className="text-gray-700">
                To exercise these rights, please contact us at{' '}
                <a href="mailto:privacy@vynl.com" className="text-blue-600 hover:text-blue-700">
                  privacy@vynl.com
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar tracking technologies to enhance your experience on our platform. 
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your information during such transfers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our Service is not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material 
                changes by posting the new Privacy Policy on this page and updating the effective date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="text-gray-700">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:privacy@vynl.com" className="text-blue-600 hover:text-blue-700">
                    privacy@vynl.com
                  </a>
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong><br />
                  Vynl Privacy Officer<br />
                  [Your Address]<br />
                  [City, State, ZIP Code]
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
