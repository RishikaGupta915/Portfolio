import React, { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

const PDF_FILES = [
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

const CATEGORIES = [
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

const getCertificateCategory = (filename) => {
  const name = filename.toLowerCase();

  if (name.includes('python')) return 'Python';
  if (name.includes('react')) return 'React';
  if (
    name.includes('javascript') ||
    name.includes('html') ||
    name.includes('css')
  ) {
    return 'Html Css and Javascript';
  }
  if (name.includes('go programming') || name.includes('go and c++'))
    return 'Go Programming';
  if (
    name.includes('c programming') ||
    name.includes('c-structured') ||
    name.includes('c,')
  ) {
    return 'C Programming';
  }
  if (
    name.includes('front-end') ||
    name.includes('back-end') ||
    name.includes('databases')
  ) {
    return 'Frontend and Backend';
  }
  if (
    name.includes('network') ||
    name.includes('it fundamentals') ||
    name.includes('comptia')
  ) {
    return 'Network and Security';
  }
  if (
    name.includes('security') ||
    name.includes('cissp') ||
    name.includes('cybersecurity') ||
    name.includes('ethical hacking') ||
    name.includes('forensics') ||
    name.includes('iam')
  ) {
    return 'Cybersecurity';
  }
  if (name.includes('blockchain') || name.includes('transacting'))
    return 'Blockchain';
  if (name.includes('generative ai') || name.includes('ai introduction'))
    return 'Gen Ai';
  if (
    name.includes('software engineering') ||
    name.includes('coding interview') ||
    name.includes('version control')
  ) {
    return 'Software';
  }
  if (name.includes('cloud computing')) return 'Developments';

  return 'Software';
};

const getCertificateSkills = (filename) => {
  const name = filename.toLowerCase();

  if (name.includes('python')) {
    if (name.includes('basics')) return ['Python', 'Fundamentals', 'Syntax'];
    if (name.includes('functions'))
      return ['Python', 'Functions', 'File Handling'];
    if (name.includes('project'))
      return ['Python', 'Project Development', 'Problem Solving'];
    return ['Python', 'Development', 'Scripting'];
  }

  if (name.includes('react')) {
    if (name.includes('advanced'))
      return ['React', 'State Management', 'Performance'];
    return ['React', 'Components', 'JSX'];
  }

  if (name.includes('javascript'))
    return ['JavaScript', 'Web Development', 'ES6+'];
  if (name.includes('html') || name.includes('css'))
    return ['HTML', 'CSS', 'Responsive Design'];

  if (name.includes('go programming')) return ['Go', 'Concurrency', 'Backend'];
  if (
    name.includes('c programming') ||
    name.includes('c,') ||
    name.includes('c-structured')
  ) {
    return ['C Programming', 'Algorithms', 'System Programming'];
  }

  if (name.includes('front-end'))
    return ['Frontend', 'UI Development', 'Web Technologies'];
  if (name.includes('back-end'))
    return ['Backend', 'API Development', 'Database'];

  if (name.includes('networking') || name.includes('network')) {
    return ['Networking', 'Network Security', 'Protocols'];
  }
  if (name.includes('it fundamentals'))
    return ['IT Fundamentals', 'Hardware', 'Technical Support'];
  if (name.includes('comptia'))
    return ['CompTIA', 'Troubleshooting', 'Hardware'];

  if (name.includes('cybersecurity') || name.includes('security')) {
    return ['Cybersecurity', 'Risk Management', 'Compliance'];
  }
  if (name.includes('cissp'))
    return ['CISSP', 'Security Architecture', 'Risk Assessment'];
  if (name.includes('ethical hacking'))
    return ['Ethical Hacking', 'Penetration Testing', 'Vulnerability Analysis'];
  if (name.includes('forensics'))
    return ['Digital Forensics', 'Incident Response', 'Investigation'];

  if (name.includes('blockchain'))
    return ['Blockchain', 'Distributed Systems', 'Smart Contracts'];
  if (name.includes('generative ai'))
    return ['Generative AI', 'AI Applications', 'Prompt Engineering'];

  if (name.includes('software engineering'))
    return ['Software Engineering', 'Best Practices', 'Architecture'];
  if (name.includes('coding interview'))
    return ['Interview Preparation', 'Data Structures', 'Algorithms'];
  if (name.includes('version control'))
    return ['Git', 'Version Control', 'Collaboration'];
  if (name.includes('cloud computing'))
    return ['Cloud Computing', 'Infrastructure', 'Scalability'];

  return ['Certification'];
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

const CERTIFICATES = PDF_FILES.map((file, index) => {
  const title = file.replace('.pdf', '');
  const category = getCertificateCategory(file);

  return {
    id: index + 1,
    title,
    issuer: 'Coursera',
    date: '2023-2024',
    category,
    pdfUrl: new URL(`../../assets/COURSES/${file}`, import.meta.url).href,
    skills: getCertificateSkills(file),
    certId: title.substring(0, 10),
    colorGradient: getCategoryColor(category),
  };
});

export default function Certificates({ onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCert, setSelectedCert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredCertificates = useMemo(() => {
    if (selectedCategory === 'All') return CERTIFICATES;
    return CERTIFICATES.filter((cert) => cert.category === selectedCategory);
  }, [selectedCategory]);

  const openCertificate = useCallback((cert) => {
    setSelectedCert(cert);
    setIsModalOpen(true);
  }, []);

  const closeCertificate = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCert(null);
  }, []);

  const downloadCertificate = useCallback((cert) => {
    const link = document.createElement('a');
    link.href = cert.pdfUrl;
    link.download = `${cert.title.replace(/\s+/g, '_')}_Certificate.pdf`;
    link.click();
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{ bottom: '60px' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="relative min-h-[85vh] max-h-[85vh] w-full max-w-6xl bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-purple-500/20">
        <div className="flex items-center justify-between bg-gray-800/90 px-6 py-3 border-b border-gray-700/50 backdrop-blur-sm">
          <h1 className="text-xl font-bold text-white">My Certificates</h1>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700/50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div
          className="h-full overflow-y-auto p-6 custom-scrollbar"
          style={{ height: 'calc(85vh - 52px)' }}
        >
          <div className="text-center mb-8">
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              A collection of professional certifications and course
              completions.
            </p>
          </div>

          <div className="mb-8 max-w-5xl mx-auto">
            <div className="flex flex-wrap justify-center gap-3">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-600/50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {selectedCategory !== 'All' && (
              <div className="mt-4 text-center">
                <span className="inline-flex items-center px-4 py-2 bg-purple-500/20 rounded-full text-purple-200 text-sm">
                  Showing {selectedCategory} certificates (
                  {filteredCertificates.length})
                </span>
              </div>
            )}
          </div>

          {filteredCertificates.length === 0 ? (
            <div className="text-center py-16 text-gray-300">
              No certificates found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
              {filteredCertificates.map((cert) => (
                <motion.div
                  key={cert.id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-purple-500/20 rounded-xl overflow-hidden shadow-xl hover:shadow-purple-500/25 transition-all duration-200 cursor-pointer"
                  onClick={() => openCertificate(cert)}
                >
                  <div
                    className={`relative h-36 bg-gradient-to-br ${cert.colorGradient} flex items-center justify-center`}
                  >
                    <div className="text-center px-4">
                      <p className="text-sm text-gray-200 font-medium">
                        {cert.category}
                      </p>
                      <p className="text-xs text-gray-300 opacity-80">
                        {cert.certId}
                      </p>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-bold text-white line-clamp-2">
                        {cert.title}
                      </h3>
                      <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded ml-2 flex-shrink-0">
                        {cert.date}
                      </span>
                    </div>

                    <p className="text-purple-300 font-medium mb-3 text-sm">
                      {cert.issuer}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {cert.skills.slice(0, 2).map((skill) => (
                        <span
                          key={skill}
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
                        Download
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.35 }}
              className="bg-gray-900 rounded-2xl overflow-hidden max-w-6xl w-full max-h-[95vh] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
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
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Skills Covered
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCert.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-purple-500/20 text-purple-200 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg overflow-hidden">
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
                      >
                        Open
                      </button>
                      <button
                        onClick={() => downloadCertificate(selectedCert)}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm transition-all"
                      >
                        Download
                      </button>
                    </div>
                  </div>

                  <iframe
                    src={`${selectedCert.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
                    className="w-full h-[500px] border-0"
                    title={`${selectedCert.title} Certificate`}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
