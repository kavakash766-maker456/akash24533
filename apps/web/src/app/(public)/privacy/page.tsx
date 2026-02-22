import Link from 'next/link';

export default function PrivacyPage() {
  const sections = [
    { title: 'Information We Collect', body: 'We collect information you provide (name, email, payment details), information from your use of our services (IP address, device info, activity logs), and information from third parties (Google OAuth profile data when you log in with Google).' },
    { title: 'How We Use Your Information', body: 'We use your information to: operate and improve the platform, process payments and withdrawals, send transactional emails (verification, receipts, notifications), detect and prevent fraud, comply with legal obligations, and communicate platform updates.' },
    { title: 'Information Sharing', body: 'We do not sell your personal information. We share data only with: service providers (Stripe for payments, Cloudinary for images, SMTP provider for email), law enforcement when legally required, and other users only as necessary (e.g., employers see worker usernames on submissions).' },
    { title: 'Data Security', body: 'We implement industry-standard security measures including encrypted passwords (bcrypt), HTTPS encryption, JWT token authentication, rate limiting, and regular security audits. No system is 100% secure — please use a strong password and enable 2FA.' },
    { title: 'Cookies & Tracking', body: 'We use essential cookies for authentication (JWT tokens stored in localStorage). We do not use third-party advertising cookies or tracking pixels. You may clear cookies at any time through your browser settings.' },
    { title: 'Data Retention', body: 'We retain your account data for the duration of your account plus 90 days after deletion. Transaction records are retained for 7 years for legal compliance. You may request deletion of personal data at any time.' },
    { title: 'Your Rights (GDPR)', body: 'If you are in the EU/EEA, you have the right to: access your personal data, correct inaccurate data, request deletion, restrict processing, data portability, and object to processing. Contact support to exercise these rights.' },
    { title: 'Children\'s Privacy', body: 'TaskEarn Pro is not intended for users under 18. We do not knowingly collect data from minors. If you believe a minor has created an account, please contact us immediately.' },
    { title: 'Contact Us', body: 'For privacy-related questions or to exercise your rights, contact us at: privacy@taskearnpro.com. We will respond within 30 days.' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-400">TaskEarn Pro</Link>
          <Link href="/login" className="text-gray-300 hover:text-white">Login</Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-400 mb-10">Last updated: January 2024</p>
        <div className="space-y-8">
          {sections.map(s => (
            <div key={s.title}>
              <h2 className="text-lg font-semibold text-white mb-2">{s.title}</h2>
              <p className="text-gray-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
