import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Generate certificates data from PDF files in assets/COURSES folder
const generateCertificatesData = () => {
  const pdfFiles = [
    'Advanced Networking, Virtualization, and IT.pdf',
    'Advanced React.pdf',
    'Asset Security.pdf',
    'Back-End Development.pdf',
    'C programming.pdf',
    'C, Go and C++.pdf',
    'C-Structured Programming.pdf',
    'CISSP.pdf',
    'Cloud Computing.pdf',
    'Coding Interview Preparation.pdf',
    'Communication and Network Security.pdf',
    'CompTIA A+ Certification.pdf',
    'Cybersecurity Attack and.pdf',
    'Digital Forensics Essentials (DFE).pdf',
    'Ethical Hacking Essentials (EHE).pdf',
    'Front-End Development.pdf',
    'Generative AI Introduction and Applications.pdf',
    'Generative AI Prompt Engineering Basics.pdf',
    'Go Programming II.pdf',
    'Go Programming.pdf',
    'HTML and CSS in depth.pdf',
    'Identity and Access Management (IAM).pdf',
    'Introduction to Blockchain Technologies.pdf',
    'Introduction to Databases for Back-End.pdf',
    'IT Fundamentals and Hardware Essentials.pdf',
    'Network Defense Essentials (NDE).pdf',
    'Networking, Peripherals, and Wireless.pdf',
    'Programming in Python.pdf',
    'Programming with JavaScript.pdf',
    'Python Basics.pdf',
    'Python Functions, Files, and Dictionaries.pdf',
    'Python Project.pdf',
    'Python.pdf',
    'React Basics.pdf',
    'Secure Software Development.pdf',
    'Security and Risk Management.pdf',
    'Security Architecture and Engineering.pdf',
    'Security Assessment and Testing.pdf',
    'Security Operations.pdf',
    'Software Engineering.pdf',
    'Transacting on the Blockchain.pdf',
    'Version Control.pdf',
  ];

  // Certificate categorization based on actual course content
  const getCertificateCategory = (filename) => {
    const name = filename.toLowerCase();

    if (name.includes('python')) return 'Python';
    if (name.includes('react')) return 'React';
    if (
      name.includes('javascript') ||
      name.includes('html') ||
      name.includes('css')
    )
      return 'Html Css and Javascript';
    if (name.includes('go programming') || name.includes('go and c++'))
      return 'Go Programming';
    if (
      name.includes('c programming') ||
      name.includes('c-structured') ||
      name.includes('c,')
    )
      return 'C Programming';
    if (
      name.includes('front-end') ||
      name.includes('back-end') ||
      name.includes('databases')
    )
      return 'Frontend and Backend';
    if (
      name.includes('network') ||
      name.includes('it fundamentals') ||
      name.includes('comptia')
    )
      return 'Network and Security';
    if (
      name.includes('security') ||
      name.includes('cissp') ||
      name.includes('cybersecurity') ||
      name.includes('ethical hacking') ||
      name.includes('forensics') ||
      name.includes('iam')
    )
      return 'Cybersecurity';
    if (name.includes('blockchain') || name.includes('transacting'))
      return 'Blockchain';
    if (name.includes('generative ai') || name.includes('ai introduction'))
      return 'Gen Ai';
    if (
      name.includes('software engineering') ||
      name.includes('coding interview') ||
      name.includes('version control')
    )
      return 'Software';
    if (name.includes('cloud computing')) return 'Developments';

    return 'Software'; // Default category
  };

  const getCertificateSkills = (filename) => {
    const name = filename.toLowerCase();

    // Return relevant skills based on filename
    if (name.includes('python')) {
      if (name.includes('basics'))
        return ['Python', 'Programming', 'Fundamentals', 'Syntax'];
      if (name.includes('functions'))
        return ['Python', 'Functions', 'File Handling', 'Data Structures'];
      if (name.includes('project'))
        return [
          'Python',
          'Project Development',
          'Application Building',
          'Problem Solving',
        ];
      return ['Python', 'Programming', 'Development', 'Scripting'];
    }

    if (name.includes('react')) {
      if (name.includes('advanced'))
        return [
          'React',
          'Advanced Concepts',
          'State Management',
          'Performance',
        ];
      return ['React', 'Components', 'JSX', 'Frontend'];
    }

    if (name.includes('javascript'))
      return ['JavaScript', 'Programming', 'Web Development', 'ES6+'];
    if (name.includes('html') || name.includes('css'))
      return ['HTML', 'CSS', 'Web Design', 'Responsive Design'];

    if (name.includes('go programming'))
      return ['Go', 'Programming', 'Concurrency', 'Backend'];
    if (
      name.includes('c programming') ||
      name.includes('c,') ||
      name.includes('c-structured')
    )
      return [
        'C Programming',
        'System Programming',
        'Low-level Programming',
        'Algorithms',
      ];

    if (name.includes('front-end'))
      return [
        'Frontend',
        'UI Development',
        'User Experience',
        'Web Technologies',
      ];
    if (name.includes('back-end'))
      return ['Backend', 'Server-side', 'API Development', 'Database'];

    if (name.includes('networking') || name.includes('network'))
      return ['Networking', 'Network Security', 'Infrastructure', 'Protocols'];
    if (name.includes('it fundamentals'))
      return [
        'IT Fundamentals',
        'Hardware',
        'System Administration',
        'Technical Support',
      ];
    if (name.includes('comptia'))
      return ['CompTIA', 'IT Certification', 'Hardware', 'Troubleshooting'];

    if (name.includes('cybersecurity') || name.includes('security'))
      return [
        'Cybersecurity',
        'Information Security',
        'Risk Management',
        'Compliance',
      ];
    if (name.includes('cissp'))
      return [
        'CISSP',
        'Security Management',
        'Risk Assessment',
        'Security Architecture',
      ];
    if (name.includes('ethical hacking'))
      return [
        'Ethical Hacking',
        'Penetration Testing',
        'Security Assessment',
        'Vulnerability Analysis',
      ];
    if (name.includes('forensics'))
      return [
        'Digital Forensics',
        'Incident Response',
        'Evidence Analysis',
        'Investigation',
      ];

    if (name.includes('blockchain'))
      return [
        'Blockchain',
        'Cryptocurrency',
        'Distributed Systems',
        'Smart Contracts',
      ];
    if (name.includes('generative ai'))
      return [
        'Generative AI',
        'Machine Learning',
        'AI Applications',
        'Prompt Engineering',
      ];

    if (name.includes('software engineering'))
      return [
        'Software Engineering',
        'Development Practices',
        'Software Architecture',
        'Best Practices',
      ];
    if (name.includes('coding interview'))
      return [
        'Interview Preparation',
        'Problem Solving',
        'Algorithms',
        'Data Structures',
      ];
    if (name.includes('version control'))
      return ['Version Control', 'Git', 'Collaboration', 'Code Management'];
    if (name.includes('cloud computing'))
      return [
        'Cloud Computing',
        'Cloud Services',
        'Infrastructure',
        'Scalability',
      ];

    return [
      'Professional Development',
      'Certification',
      'Industry Skills',
      'Technical Knowledge',
    ];
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Python: '🐍',
      'Network and Security': '🔐',
      'Frontend and Backend': '🌐',
      'Go Programming': '🚀',
      'Html Css and Javascript': '💻',
      Cybersecurity: '🛡️',
      Blockchain: '⛓️',
      'C Programming': '⚙️',
      React: '⚛️',
      'Gen Ai': '🤖',
      Software: '📱',
      Developments: '🔧',
    };
    return icons[category] || '📜';
  };

  const getCategoryColor = (category) => {
    const colors = {
      Python: 'from-yellow-500/20 to-blue-600/20',
      'Network and Security': 'from-red-500/20 to-orange-600/20',
      'Frontend and Backend': 'from-green-500/20 to-blue-600/20',
      'Go Programming': 'from-cyan-500/20 to-teal-600/20',
      'Html Css and Javascript': 'from-orange-500/20 to-yellow-600/20',
      Cybersecurity: 'from-gray-500/20 to-red-600/20',
      Blockchain: 'from-purple-500/20 to-indigo-600/20',
      'C Programming': 'from-blue-500/20 to-gray-600/20',
      React: 'from-blue-500/20 to-cyan-600/20',
      'Gen Ai': 'from-purple-500/20 to-pink-600/20',
      Software: 'from-indigo-500/20 to-purple-600/20',
      Developments: 'from-emerald-500/20 to-green-600/20',
    };
    return colors[category] || 'from-slate-500/20 to-slate-600/20';
  };

  return pdfFiles.map((file, index) => {
    const title = file.replace('.pdf', '');
    const category = getCertificateCategory(file);
    const skills = getCertificateSkills(file);

    return {
      id: index + 1,
      title: title,
      issuer: 'Coursera',
      date: '2023-2024',
      category: category,
      pdfUrl: new URL(`../../assets/COURSES/${file}`, import.meta.url).href,
      skills: skills,
      certId: title.substring(0, 10), // Use first 10 chars as ID
      icon: getCategoryIcon(category),
      colorGradient: getCategoryColor(category),
    };
  });
};

const categories = [
  'All',
  'Python',
  'Network and Security',
  'Frontend and Backend',
  'Go Programming',
  'Html Css and Javascript',
  'Cybersecurity',
  'Blockchain',
  'C Programming',
  'React',
  'Gen Ai',
  'Software',
  'Developments',
];

const certificates = generateCertificatesData();

export default function Certificates({ onClose }) {
  const [selectedCert, setSelectedCert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Simulate loading time for smooth animation entrance
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Memoize filtered certificates to prevent unnecessary recalculations
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const matchesCategory =
        selectedCategory === 'All' || cert.category === selectedCategory;
      return matchesCategory;
    });
  }, [selectedCategory]);

  const openCertificate = useCallback((cert) => {
    setSelectedCert(cert);
    setIsModalOpen(true);
  }, []);

  const closeCertificate = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedCert(null), 300);
  }, []);

  const downloadCertificate = useCallback((cert) => {
    const link = document.createElement('a');
    link.href = cert.pdfUrl;
    link.download = `${cert.title.replace(/\s+/g, '_')}_Certificate.pdf`;
    link.click();
  }, []);

  // Throttle scroll handler for better performance
  const handleScroll = useCallback(
    (() => {
      let timeoutId;
      return (e) => {
        if (timeoutId) return;
        timeoutId = setTimeout(() => {
          const scrollTop = e.target.scrollTop;
          const scrollHeight = e.target.scrollHeight;
          const clientHeight = e.target.clientHeight;

          setShowScrollTop(scrollTop > 300);

          // Calculate scroll progress
          const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
          setScrollProgress(Math.min(progress, 100));
          timeoutId = null;
        }, 16); // ~60fps
      };
    })(),
    []
  );

  const scrollToTop = useCallback(() => {
    const scrollContainer = document.querySelector(
      '.certificates-scroll-container'
    );
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{ bottom: '60px' }}
    >
      <div className="relative min-h-[85vh] max-h-[85vh] w-full max-w-6xl bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-purple-500/20">
        {/* Window Header */}
        <div className="flex items-center justify-between bg-gray-800/90 px-6 py-3 border-b border-gray-700/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">📜</div>
            <h1 className="text-xl font-bold text-white">My Certificates</h1>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700/50"
          >
            ✕
          </button>
        </div>

        {/* Scroll Progress Bar */}
        <div className="w-full h-1 bg-gray-700/50 relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500"
            style={{ width: `${scrollProgress}%` }}
            initial={{ width: '0%' }}
            animate={{ width: `${scrollProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Scrollable Content */}
        <div
          className="relative flex-1 overflow-hidden"
          style={{ height: 'calc(85vh - 64px)' }}
        >
          <div
            className="h-full overflow-y-auto p-6 custom-scrollbar scroll-smooth certificates-scroll-container"
            onScroll={handleScroll}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#a855f7 #374151',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch', // For smooth momentum scrolling on iOS
            }}
          >
            {/* Loading Screen */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 z-40 flex items-center justify-center rounded-2xl"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        rotate: {
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        },
                      }}
                      className="text-6xl mb-4"
                    >
                      📜
                    </motion.div>
                    <motion.h2
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl font-bold text-white mb-2"
                    >
                      Loading Certificates
                    </motion.h2>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex justify-center space-x-1"
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: 'easeInOut',
                          }}
                          className="w-2 h-2 bg-purple-400 rounded-full"
                        />
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                A collection of my professional certifications and course
                completions
              </p>
            </motion.div>{' '}
            {/* Search and Filter Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 max-w-4xl mx-auto"
            >
              {/* Category Filter Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap justify-center gap-3"
              >
                {categories.map((category, index) => (
                  <motion.button
                    key={category}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-600/50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {category !== 'All' && (
                        <span className="text-lg">
                          {category === 'Python' && '🐍'}
                          {category === 'Network and Security' && '🔐'}
                          {category === 'Frontend and Backend' && '🌐'}
                          {category === 'Go Programming' && '🚀'}
                          {category === 'Html Css and Javascript' && '💻'}
                          {category === 'Cybersecurity' && '🛡️'}
                          {category === 'Blockchain' && '⛓️'}
                          {category === 'C Programming' && '⚙️'}
                          {category === 'React' && '⚛️'}
                          {category === 'Gen Ai' && '🤖'}
                          {category === 'Software' && '📱'}
                          {category === 'Developments' && '🔧'}
                        </span>
                      )}
                      {category}
                    </span>
                  </motion.button>
                ))}
              </motion.div>

              {/* Active Filter Indicator */}
              <AnimatePresence>
                {selectedCategory !== 'All' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 text-center"
                  >
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-200 text-sm">
                      <motion.span
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          repeatDelay: 2,
                        }}
                      >
                        🎯
                      </motion.span>
                      Showing {selectedCategory} certificates (
                      {filteredCertificates.length})
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            {/* Certificates Grid */}
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20"
            >
              <AnimatePresence mode="popLayout">
                {filteredCertificates.map((cert, index) => (
                  <motion.div
                    key={cert.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      duration: 0.3,
                      delay: Math.min(index * 0.02, 0.2),
                      layout: { duration: 0.2 },
                    }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-purple-500/20 rounded-xl overflow-hidden shadow-xl hover:shadow-purple-500/25 transition-all duration-200 cursor-pointer group"
                    onClick={() => openCertificate(cert)}
                  >
                    {/* Certificate Thumbnail */}
                    <div
                      className={`relative h-40 bg-gradient-to-br ${cert.colorGradient} flex items-center justify-center`}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">{cert.icon}</div>
                        <p className="text-sm text-gray-200 font-medium">
                          {cert.category}
                        </p>
                        <p className="text-xs text-gray-300 opacity-80">
                          #{cert.certId}
                        </p>
                      </div>

                      {/* Simple Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl mb-1">👁️</div>
                          <p className="text-white text-sm font-medium">
                            View Certificate
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Certificate Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                          {cert.title}
                        </h3>
                        <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded ml-2 flex-shrink-0">
                          {cert.date}
                        </span>
                      </div>

                      <p className="text-purple-300 font-medium mb-3 text-sm">
                        {cert.issuer}
                      </p>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {cert.skills.slice(0, 2).map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="text-xs bg-purple-500/20 text-purple-200 px-2 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {cert.skills.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{cert.skills.length - 2} more
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openCertificate(cert);
                          }}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadCertificate(cert);
                          }}
                          className="bg-gray-700 text-white py-2 px-3 rounded-lg hover:bg-gray-600 transition-all text-sm"
                        >
                          📥
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            {/* No Results Message */}
            {filteredCertificates.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              ></motion.div>
            )}
          </div>
          {filteredCertificates.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            ></motion.div>
          )}
          {/* Certificate Modal */}
          <AnimatePresence>
            {isModalOpen && selectedCert && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={closeCertificate}
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="bg-gray-900 rounded-2xl overflow-hidden max-w-6xl w-full max-h-[95vh] shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {selectedCert.title}
                      </h2>
                      <p className="text-purple-300">
                        {selectedCert.issuer} • {selectedCert.date}
                      </p>
                    </div>
                    <button
                      onClick={closeCertificate}
                      className="text-gray-400 hover:text-white transition-colors text-2xl"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6">
                    {/* Certificate Details */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Skills Covered:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCert.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-purple-500/20 text-purple-200 px-3 py-1 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* PDF Viewer */}
                    <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
                      <div className="flex items-center justify-between bg-gray-700 px-4 py-2 border-b border-gray-600">
                        <h4 className="text-lg font-semibold text-white">
                          Certificate Preview
                        </h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              window.open(selectedCert.pdfUrl, '_blank')
                            }
                            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition-all"
                            title="Open in new tab"
                          >
                            🔗 Open
                          </button>
                          <button
                            onClick={() => downloadCertificate(selectedCert)}
                            className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm transition-all"
                            title="Download PDF"
                          >
                            📥 Download
                          </button>
                        </div>
                      </div>

                      {/* PDF Viewer with Loading State */}
                      <div className="relative">
                        {/* Loading overlay */}
                        <div
                          className="absolute inset-0 bg-gray-700 flex items-center justify-center"
                          id={`loading-${selectedCert.id}`}
                        >
                          <div className="text-center">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                              className="text-4xl mb-2"
                            >
                              📄
                            </motion.div>
                            <p className="text-white">Loading PDF...</p>
                          </div>
                        </div>

                        <iframe
                          src={`${selectedCert.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
                          className="w-full h-[500px] border-0"
                          title={`${selectedCert.title} Certificate`}
                          onLoad={(e) => {
                            // Hide loading overlay when PDF loads
                            const loading = document.getElementById(
                              `loading-${selectedCert.id}`
                            );
                            if (loading) loading.style.display = 'none';
                          }}
                          onError={(e) => {
                            console.error('PDF failed to load:', e);
                            e.target.style.display = 'none';
                            const loading = document.getElementById(
                              `loading-${selectedCert.id}`
                            );
                            if (loading) loading.style.display = 'none';
                            const fallback = e.target.nextElementSibling;
                            if (fallback) {
                              fallback.style.display = 'flex';
                              fallback.style.flexDirection = 'column';
                              fallback.style.alignItems = 'center';
                              fallback.style.justifyContent = 'center';
                            }
                          }}
                        />

                        {/* Fallback for PDF load errors */}
                        <div
                          className="w-full h-[500px] items-center justify-center bg-gray-700 text-center"
                          style={{ display: 'none' }}
                        >
                          <div className="flex flex-col items-center">
                            <div className="text-6xl mb-4">📄</div>
                            <h4 className="text-xl text-white mb-2">
                              Unable to preview PDF
                            </h4>
                            <p className="text-gray-400 mb-4">
                              The PDF couldn't be displayed in the browser.
                              Please download or open in a new tab.
                            </p>
                            <div className="flex gap-4 justify-center">
                              <button
                                onClick={() =>
                                  window.open(selectedCert.pdfUrl, '_blank')
                                }
                                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium"
                              >
                                🔗 Open PDF
                              </button>
                              <button
                                onClick={() =>
                                  downloadCertificate(selectedCert)
                                }
                                className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all font-medium"
                              >
                                📥 Download
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scroll to Top Button */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={scrollToTop}
                className="fixed bottom-32 right-8 bg-purple-500/90 hover:bg-purple-600/90 text-white p-3 rounded-full shadow-lg backdrop-blur-sm z-40 transition-all duration-200"
                title="Scroll to top"
              >
                <motion.div
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  ⬆️
                </motion.div>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Floating Stats */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 200 }}
                className="text-2xl font-bold text-white"
              >
                {filteredCertificates.length}
              </motion.div>
              <div className="text-sm text-purple-100">
                {selectedCategory === 'All' ? 'Total' : selectedCategory}{' '}
                Certificates
              </div>
              <div className="text-xs text-purple-200 mt-1">From Coursera</div>
              {selectedCategory !== 'All' && (
                <div className="text-lg mt-1">
                  {selectedCategory === 'Python' && '🐍'}
                  {selectedCategory === 'Network and Security' && '🔐'}
                  {selectedCategory === 'Frontend and Backend' && '🌐'}
                  {selectedCategory === 'Go Programming' && '🚀'}
                  {selectedCategory === 'Html Css and Javascript' && '💻'}
                  {selectedCategory === 'Cybersecurity' && '🛡️'}
                  {selectedCategory === 'Blockchain' && '⛓️'}
                  {selectedCategory === 'C Programming' && '⚙️'}
                  {selectedCategory === 'React' && '⚛️'}
                  {selectedCategory === 'Gen Ai' && '🤖'}
                  {selectedCategory === 'Software' && '📱'}
                  {selectedCategory === 'Developments' && '🔧'}
                </div>
              )}
            </div>
          </motion.div>
          {/* Animated Background Elements */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-purple-400/10 rounded-full"
                animate={{
                  x: [0, Math.random() * 200],
                  y: [0, Math.random() * 200],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  delay: i * 2,
                  ease: 'linear',
                }}
                style={{
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
