import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import DraggableWindow from '../Dragable/dragable';
import {
  X,
  Mail,
  Phone,
  User,
  MapPin,
  Github,
  Linkedin,
  Copy,
} from 'lucide-react';

export default function Contact({ onClose }) {
  const contactInfo = {
    name: 'Rishika Gupta',
    email: 'rishikagupta915@gmail.com',
    phone: '+91 8918681988',
    location: 'Darjeeling, WB, India',
    github: 'https://github.com/RishikaGupta915',
    linkedin: '',
  };

  const [nameText, setNameText] = useState('');
  const [rolesText, setRolesText] = useState('');
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);

  const nameToDisplay = 'Hey! This is Rishika Gupta';
  const roles = [
    'Student',
    'Full Stack Developer',
    'Computer vision enthusiast',
  ];

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < nameToDisplay.length) {
        setNameText(nameToDisplay.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (nameText.length === nameToDisplay.length) {
      let roleIndex = 0;
      let charIndex = 0;

      const typeRole = () => {
        const currentRole = roles[roleIndex];

        const timer = setInterval(() => {
          if (charIndex < currentRole.length) {
            setRolesText(currentRole.slice(0, charIndex + 1));
            charIndex++;
          } else {
            clearInterval(timer);

            setTimeout(() => {
              roleIndex = (roleIndex + 1) % roles.length;
              charIndex = 0;
              setCurrentRoleIndex(roleIndex);

              setRolesText('');
              setTimeout(typeRole, 200);
            }, 2000);
          }
        }, 100);
      };

      setTimeout(typeRole, 500);
    }
  }, [nameText]);

  const handleEmailClick = () => {
    const link = document.createElement('a');
    link.href = `mailto:${contactInfo.email}`;
    link.click();
  };

  const handlePhoneClick = () => {
    window.location.href = `tel:${contactInfo.phone}`;
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log(`${type} copied to clipboard`);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 pb-20"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <DraggableWindow>
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 sm:p-8 w-full max-w-xl sm:max-w-2xl lg:max-w-4xl max-h-[calc(100vh-7rem)] sm:max-h-[calc(100vh-8rem)] shadow-2xl overflow-y-auto custom-scrollbar scroll-smooth"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            data-drag-handle
            className="flex justify-between items-center select-none cursor-move"
          >
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Contact Me
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Profile Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>

            {/* Name */}
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 min-h-[28px]">
              {nameText}
              {nameText.length < nameToDisplay.length && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-0.5 h-5 bg-white ml-1"
                />
              )}
            </h3>

            {/* Roles */}
            <div className="text-white/70 text-xs sm:text-sm min-h-[20px]">
              {rolesText}
              {nameText.length === nameToDisplay.length && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-0.5 h-4 bg-white/70 ml-1"
                />
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Email */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-3 p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group"
              onClick={handleEmailClick}
            >
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white/60 text-xs">Email</p>
                <p className="text-white font-medium text-sm break-all">
                  {contactInfo.email}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(contactInfo.email, 'Email');
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Copy className="w-4 h-4 text-white/60 " />
              </button>
            </motion.div>

            {/* Phone */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-3 p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group"
              onClick={handlePhoneClick}
            >
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Phone className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white/60 text-xs">Phone</p>
                <p className="text-white font-medium text-sm">
                  {contactInfo.phone}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(contactInfo.phone, 'Phone');
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Copy className="w-4 h-4 text-white/60" />
              </button>
            </motion.div>

            {/* Location */}
            <div className="flex items-center space-x-3 p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 md:col-span-2">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <MapPin className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-white/60 text-xs">Location</p>
                <p className="text-white font-medium">{contactInfo.location}</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 sm:gap-6 pt-3 sm:pt-4">
              <motion.a
                href={contactInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 flex items-center justify-center space-x-2 p-3 bg-gray-600/20 rounded-xl border border-white/10 hover:bg-gray-600/30 transition-all"
              >
                <Github className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">GitHub</span>
              </motion.a>

              <motion.a
                href={contactInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 flex items-center justify-center space-x-2 p-3 bg-blue-600/20 rounded-xl border border-white/10 hover:bg-blue-600/30 transition-all"
              >
                <Linkedin className="w-5 h-5 text-blue-400" />
                <span className="text-white text-sm font-medium">LinkedIn</span>
              </motion.a>
            </div>
          </div>

          {/* Footer Message */}
          <div className="mt-6 sm:mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-white/10">
            <p className="text-white/80 text-xs sm:text-sm text-center">
              Let's connect and discuss opportunities!
            </p>
          </div>
        </motion.div>
      </DraggableWindow>
    </motion.div>
  );
}
