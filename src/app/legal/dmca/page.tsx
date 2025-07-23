import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DMCA Policy - Vynl',
  description: 'Digital Millennium Copyright Act policy and procedures for copyright infringement claims.',
}

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Digital Millennium Copyright Act (DMCA) Policy
          </h1>

          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-700 mb-4">
                Vynl respects the intellectual property rights of others and expects our users to do the same. 
                In accordance with the Digital Millennium Copyright Act (DMCA), we have adopted a policy of 
                terminating, in appropriate circumstances, users who are deemed to be repeat infringers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">DMCA Notice Procedure</h2>
              <p className="text-gray-700 mb-4">
                If you believe that your copyrighted work has been copied in a way that constitutes copyright 
                infringement and is accessible through our service, please notify our copyright agent as set 
                forth in the DMCA. For your complaint to be valid under the DMCA, you must provide the following 
                information in writing:
              </p>
              
              <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2">
                <li>An electronic or physical signature of a person authorized to act on behalf of the copyright owner;</li>
                <li>Identification of the copyrighted work that you claim has been infringed;</li>
                <li>Identification of the material that is claimed to be infringing and where it is located on the service;</li>
                <li>Information reasonably sufficient to permit us to contact you, such as your address, telephone number, and email address;</li>
                <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or law; and</li>
                <li>A statement, made under penalty of perjury, that the above information is accurate, and that you are the copyright owner or are authorized to act on behalf of the owner.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Designated Copyright Agent</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Copyright Agent:</strong> Legal Department
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> dmca@vynl.com
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Address:</strong><br />
                  Vynl Legal Department<br />
                  DMCA Notice<br />
                  [Your Address]<br />
                  [City, State, ZIP Code]
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Counter-Notice Procedure</h2>
              <p className="text-gray-700 mb-4">
                If you believe that your content was removed or disabled by mistake or misidentification, 
                you may file a counter-notification with us by providing the following information to our 
                copyright agent:
              </p>
              
              <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2">
                <li>Your physical or electronic signature;</li>
                <li>Identification of the content that has been removed or to which access has been disabled and the location at which the content appeared before it was removed or disabled;</li>
                <li>A statement under penalty of perjury that you have a good faith belief that the content was removed or disabled as a result of mistake or misidentification;</li>
                <li>Your name, address, and telephone number, and a statement that you consent to the jurisdiction of the federal district court for the judicial district in which the address is located, or if your address is outside of the United States, for any judicial district in which we may be found, and that you will accept service of process from the person who provided notification under subsection (c)(1)(C) or an agent of such person.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Repeat Infringer Policy</h2>
              <p className="text-gray-700 mb-4">
                In accordance with the DMCA and other applicable law, we have adopted a policy of terminating, 
                in appropriate circumstances and at our sole discretion, users who are deemed to be repeat infringers. 
                We may also at our sole discretion limit access to the service and/or terminate the accounts of any 
                users who infringe any intellectual property rights of others, whether or not there is any repeat infringement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Modifications</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify this DMCA policy at any time. Any changes will be effective 
                immediately upon posting the revised policy on our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about this DMCA policy, please contact us at{' '}
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
