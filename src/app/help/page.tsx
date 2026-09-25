import Link from 'next/link'
import { HelpCircle, Mail, MessageCircle } from 'lucide-react'

const FAQS = [
  {
    question: 'How do I become a creator on VYNL?',
    answer: 'Apply for creator access from your account dashboard, or use an invite code from an existing creator or admin. Applications are reviewed and you\'ll get an email once a decision is made.',
  },
  {
    question: 'How do subscriptions work?',
    answer: 'Creators offer up to three subscription tiers with their own pricing and perks. Subscribing is a recurring monthly payment processed securely through Stripe, and you can cancel anytime from your account.',
  },
  {
    question: 'How do creators get paid?',
    answer: 'Creators connect a Stripe account to receive payouts from track sales, subscriptions, and merchandise directly.',
  },
  {
    question: 'Can I get a refund?',
    answer: 'Refunds for individual purchases are handled case by case — reach out through the Contact page below and we\'ll help.',
  },
  {
    question: 'How do I cancel a subscription?',
    answer: 'Go to your Purchases or Following page, find the subscription, and cancel it there. Access continues until the end of the current billing period.',
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <HelpCircle className="h-10 w-10 text-purple-600 mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
          <p className="text-gray-600">Answers to common questions about VYNL.</p>
        </div>

        <div className="space-y-4 mb-10">
          {FAQS.map((faq) => (
            <div key={faq.question} className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-2">{faq.question}</h2>
              <p className="text-gray-600 text-sm">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-gray-600 mb-4">Still need help?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Contact Us
            </Link>
            <Link
              href="/feedback"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Share Feedback
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
