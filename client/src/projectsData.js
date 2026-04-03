const projectsData = [
  {
    id: 'kwikihost',
    title: 'KwikiHost',
    subtitle: 'SaaS Web Hosting Reseller Platform',
    image: '/kwikihost.webp',
    link: 'https://kwikihost.top',
    github: null,
    stack: ['Laravel', 'PHP', 'PostgreSQL', 'M-Pesa'],
    type: 'desktop',
    problem: 'Buying hosting leads to manual setup delays and friction in payment processing for local users.',
    solution: 'Built a fully automated reseller system that triggers server provisioning instantly upon M-Pesa STK push confirmation.',
    features: [
      'Real-time M-Pesa API integration for instant billing',
      'Automated server setup via reseller API',
      'Custom client dashboard for management',
      'Scalable PostgreSQL backend'
    ]
  },
  {
    id: 'jeramoyie',
    title: 'Jeramoyie Financial System',
    subtitle: 'Microfinance Ledger & Auditing Platform',
    image: '/jeramoyie.webp',
    link: 'https://jeramy1.top',
    github: null,
    stack: ['React', 'Node.js', 'PostgreSQL', 'Express'],
    type: 'desktop',
    problem: 'Complex financial tracking often leads to auditing errors and lacks transparent real-time reporting.',
    solution: 'Designed a high-integrity ledger system with immutable audit logs and automated reconciliation workflows.',
    features: [
      'Automated double-entry bookkeeping logic',
      'Real-time audit trail for every transaction',
      'Comprehensive reporting engine for stakeholders',
      'Role-based access control for security'
    ]
  },
  {
    id: 'mpesa-toolkit',
    title: 'M-Pesa Daraja Toolkit',
    subtitle: 'Production PHP Fintech Integration',
    image: '/daraja-thumb.webp',
    link: 'https://github.com/Sammy-77A/MPESA-INTERGRATIONS-PHP',
    github: 'https://github.com/Sammy-77A/MPESA-INTERGRATIONS-PHP',
    stack: ['PHP', 'M-Pesa', 'API'],
    type: 'desktop',
    problem: 'Safaricom Daraja API can be complex to implement with proper error handling and callback security.',
    solution: 'Created a modular, robust PHP toolkit that covers C2B, B2C, and STK Push with focus on reliability.',
    features: [
      'Secure callback handling with validation',
      'Easy-to-use STK Push wrapper',
      'C2B and B2C integration scripts included',
      'Comprehensive error management'
    ]
  },
  {
    id: 'mindmate',
    title: 'MindMate',
    subtitle: 'AI-Powered Wellness Android App',
    image: '/mindmate.webp',
    link: 'https://github.com/Sammy-77A/MindMate',
    github: 'https://github.com/Sammy-77A/MindMate',
    stack: ['Java', 'Android', 'Firebase', 'Mobile'],
    type: 'mobile',
    problem: 'Mental health resources are often inaccessible or non-personalized for the user.',
    solution: 'A native Android app providing consistent habit tracking and mood journaling with cloud synchronization.',
    features: [
      'Offline-first architecture with Firebase sync',
      'Real-time mood analytics and tracking',
      'Personalized goal settings and notifications',
      'Material Design 3 interface'
    ]
  }
];

export default projectsData;
