import Link from 'next/link';

export default function TermsPage() {
  const sections = [
    { title: '1. Acceptance of Terms', body: 'By creating an account and using TaskEarn Pro, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.' },
    { title: '2. Eligibility', body: 'You must be at least 18 years old to use TaskEarn Pro. By registering, you confirm that you meet this age requirement and have the legal capacity to enter into these terms.' },
    { title: '3. Account Responsibilities', body: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We are not liable for any loss resulting from unauthorized access to your account.' },
    { title: '4. Employer Obligations', body: 'Employers must provide accurate job descriptions and pay all required amounts into escrow before a job goes live. Jobs must be legal, ethical, and comply with our content policies. Employers may not request actions that violate any laws or third-party terms of service.' },
    { title: '5. Worker Obligations', body: 'Workers must complete tasks as described and submit honest, accurate proof of completion. Submitting false or fabricated proof constitutes fraud and will result in immediate account termination and forfeiture of all earnings.' },
    { title: '6. Escrow & Payments', body: 'All employer payments are held in escrow until submissions are reviewed. Platform commission of 10% is deducted from worker earnings. We reserve the right to adjust commission rates with 30 days notice.' },
    { title: '7. Withdrawals', body: 'Workers may withdraw earnings subject to a processing fee. Minimum withdrawal amounts apply. We process withdrawal requests within 3-5 business days. We reserve the right to delay withdrawals pending fraud review.' },
    { title: '8. Prohibited Conduct', body: 'Users may not: create fake accounts, manipulate reviews, use bots or automation, post illegal content, harass other users, attempt to circumvent our platform fees, or engage in any fraudulent activity.' },
    { title: '9. Dispute Resolution', body: 'Disputes between employers and workers should first be submitted through our support ticket system. We will attempt to mediate fairly. Our decisions on disputes are final. We are not liable for amounts that cannot be recovered due to fraud.' },
    { title: '10. Termination', body: 'We reserve the right to suspend or terminate any account at our discretion for violation of these terms. Suspended accounts forfeit pending earnings subject to our fraud review process.' },
    { title: '11. Limitation of Liability', body: 'TaskEarn Pro is a marketplace platform. We are not liable for the quality of work performed, disputes between users, or any indirect, incidental, or consequential damages arising from use of the platform.' },
    { title: '12. Changes to Terms', body: 'We may update these terms at any time. Continued use of the platform after changes constitutes acceptance. We will notify users of material changes via email.' },
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
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-400 mb-10">Last updated: January 2024</p>
        <div className="space-y-8">
          {sections.map(s => (
            <div key={s.title}>
              <h2 className="text-lg font-semibold text-white mb-2">{s.title}</h2>
              <p className="text-gray-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 p-5 bg-gray-900 border border-gray-800 rounded-xl">
          <p className="text-gray-400 text-sm">Questions about these terms? <Link href="/support" className="text-blue-400 hover:underline">Contact our support team</Link>.</p>
        </div>
      </div>
    </div>
  );
}
