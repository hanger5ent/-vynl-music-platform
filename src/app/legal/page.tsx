import { Metadata } from 'next'
import Link from 'next/link'
import { FileText, Shield, Eye } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Legal - Vynl',
  description: 'Legal information and policies for the Vynl music streaming platform.',
}

export default function LegalPage() {
  const legalPages = [
    {
      title: 'Terms of Service',
      description: 'Our terms and conditions for using the Vynl platform.',
      href: '/legal/terms',
      icon: FileText,
    },
    {
      title: 'Privacy Policy',
      description: 'How we collect, use, and protect your personal information.',
      href: '/legal/privacy',
      icon: Eye,
    },
    {
      title: 'DMCA Policy',
      description: 'Digital Millennium Copyright Act policy and procedures.',
      href: '/legal/dmca',
      icon: Shield,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Legal Information
          </h1>
          <p className="text-lg text-gray-600">
            Important legal documents and policies for the Vynl platform
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {legalPages.map((page) => {
            const Icon = page.icon
            return (
              <Link
                key={page.href}
                href={page.href}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {page.title}
                  </h2>
                </div>
                <p className="text-gray-600">
                  {page.description}
                </p>
                <div className="mt-4 text-indigo-600 font-medium">
                  Read more →
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Questions?
          </h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about our legal policies or need clarification 
            on any terms, please don't hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:legal@vynl.com"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Contact Legal Team
            </a>
            <a
              href="mailto:support@vynl.com"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              General Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
