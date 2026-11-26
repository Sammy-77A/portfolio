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
  },
  {
    id: 'kaazilink',
    title: 'KaaziLink',
    subtitle: 'On-Demand Local Service & Skill Marketplace',
    image: '/kaazilink.webp',
    link: null, // live demo suspended on Render; restore when redeployed
    github: null,
    stack: ['Laravel', 'Livewire', 'PostgreSQL', 'Tailwind CSS', 'M-Pesa', 'Docker', 'Render'],
    type: 'desktop',
    problem: 'Informal service hiring in Kenya lacks identity verification, transparent pricing, and digital proof of skill for local tradesmen.',
    solution: 'Engineered a full-stack digital marketplace featuring a 4-step provider KYC onboarding wizard, protected identity document streaming, MapLibre GL JS location matching, and PayHero M-Pesa STK Push payments.',
    features: [
      '51 service categories organized into 6 core domain verticals',
      '4-step provider onboarding wizard with mandatory KYC document verification',
      'Admin KYC approval dashboard with protected document streaming (/kyc/document/{path})',
      'PayHero M-Pesa STK Push mobile payment processing and callback webhooks',
      'Interactive MapLibre GL JS geographic mapping with Haversine distance filtering'
    ]
  },
  {
    id: 'wantapos-pro',
    title: 'WantaPOS Pro',
    subtitle: 'Commercial Offline-First Desktop POS & Retail System',
    image: '/wantapos.webp',
    link: 'https://wantapro.onrender.com',
    github: null,
    stack: ['Electron', 'React', 'TypeScript', 'Node.js', 'Prisma', 'SQLite', 'PostgreSQL', 'M-Pesa', 'KRA eTIMS'],
    type: 'desktop',
    problem: 'Retail POS systems in emerging markets fail during internet outages, struggle with eTIMS tax compliance, and lack intelligent sales insights.',
    solution: 'Built a hybrid offline-first Electron desktop app using local SQLite that operates seamlessly offline and syncs sales deltas to a PostgreSQL cloud backend with eTIMS fiscalization.',
    features: [
      'Offline-first SQLite engine with HMAC-SHA256 cloud backend synchronization',
      'Real-time Safaricom M-Pesa STK Push payment integration via Daraja & PayHero',
      'Automated KRA eTIMS tax fiscalization with background retry queue worker',
      'Embedded Wanta AI assistant (Google Gemini 2.0 Flash) with DB tool calling',
      'Direct RAW Windows Spooler ESC/POS thermal receipt printing engine'
    ]
  }
];

export default projectsData;
