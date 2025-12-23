import React from 'react';
import { motion } from 'motion/react';
import sudokuIcon from '../../assets/sudoku.png';
import ticTacToeIcon from '../../assets/tictactoe.png';
import pongIcon from '../../assets/pong.png';
import snakeIcon from '../../assets/snake.png';
import settingsIcon from '../../assets/settings.png';
import paintIcon from '../../assets/paint.png';
import musicIcon from '../../assets/music.png';
import certificatesIcon from '../../assets/certificate.png';
import aiChatbotIcon from '../../assets/cat.png';
import aboutMeIcon from '../../assets/me.png';
import contactIcon from '../../assets/contact.png'; // Using settings icon temporarily for contact

export default function Desktop({
  wallpaper,
  onOpenSettings,
  onOpenSudoku,
  onOpenTicTacToe,
  onOpenPong,
  onOpenSnake,
  onOpenPaint,
  onOpenMusic,
  onOpenCertificates,
  onOpenAIChatbot,
  onOpenAboutMe,
  onOpenContact,
}) {
  return (
    <div
      className="relative h-full w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      {/* Desktop Icons */}
      <div className="absolute top-4 left-4 flex flex-col space-y-4">
        {/* Sudoku Game Icon */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSudoku}
          className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <img
            src={sudokuIcon}
            alt="Sudoku"
            className="w-12 h-12 mb-1"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
          <span className="text-white text-xs font-medium text-center drop-shadow-lg">
            Sudoku
          </span>
        </motion.div>

        {/* TicTacToe Game Icon */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenTicTacToe}
          className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <img
            src={ticTacToeIcon}
            alt="Tic Tac Toe"
            className="w-12 h-12 mb-1"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
          <span className="text-white text-xs font-medium text-center drop-shadow-lg">
            Tic Tac Toe
          </span>
        </motion.div>

        {/* Pong Game Icon */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenPong}
          className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <img
            src={pongIcon}
            alt="Pong"
            className="w-12 h-12 mb-1"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
          <span className="text-white text-xs font-medium text-center drop-shadow-lg">
            Pong
          </span>
        </motion.div>

        {/* Snake Game Icon */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSnake}
          className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <img
            src={snakeIcon}
            alt="Snake"
            className="w-12 h-12 mb-1"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
          <div className="w-12 h-12 bg-yellow-500 rounded-lg items-center justify-center text-white text-xl font-bold mb-1 hidden" />
          <span className="text-white text-xs font-medium text-center drop-shadow-lg">
            Snake
          </span>
        </motion.div>

        {/* Settings Icon */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSettings}
          className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <img
            src={settingsIcon}
            alt="Settings"
            className="w-12 h-12 mb-1"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
          <span className="text-white text-xs font-medium text-center drop-shadow-lg">
            Settings
          </span>
        </motion.div>

        {/* Paint App Icon */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenPaint}
          className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <img
            src={paintIcon}
            alt="Paint"
            className="w-12 h-12 mb-1"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
          <span className="text-white text-xs font-medium text-center drop-shadow-lg">
            Paint
          </span>
        </motion.div>

        {/* Music App Icon */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenMusic}
          className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <img
            src={musicIcon}
            alt="Music"
            className="w-12 h-12 mb-1"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
          <span className="text-white text-xs font-medium text-center drop-shadow-lg">
            Music
          </span>
        </motion.div>
      </div>

      <div className="absolute top-4 left-28 flex flex-col space-y-4">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenCertificates}
          className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <img
            src={certificatesIcon}
            alt="Certificates"
            className="w-12 h-12 mb-1"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) {
                fallback.style.display = 'flex';
                fallback.style.alignItems = 'center';
                fallback.style.justifyContent = 'center';
              }
            }}
          />
          <span className="text-white text-xs font-medium text-center drop-shadow-lg">
            Certificates
          </span>
        </motion.div>

        {/* AI Chatbot Icon */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenAIChatbot}
          className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <img
            src={aiChatbotIcon}
            alt="Chatbot"
            className="w-12 h-12 mb-1"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) {
                fallback.style.display = 'flex';
                fallback.style.alignItems = 'center';
                fallback.style.justifyContent = 'center';
              }
            }}
          />
          <span className="text-white text-xs font-medium text-center drop-shadow-lg">
            Chatbot
          </span>
        </motion.div>

        {/*About Me Icon*/}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenAboutMe}
          className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <img
            src={aboutMeIcon}
            alt="About Me"
            className="w-12 h-12 mb-1"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) {
                fallback.style.display = 'flex';
                fallback.style.alignItems = 'center';
                fallback.style.justifyContent = 'center';
              }
            }}
          />
          <span className="text-white text-xs font-medium text-center drop-shadow-lg">
            About Me
          </span>
        </motion.div>

        {/*Contact Icon*/}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenContact}
          className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <img
            src={contactIcon}
            alt="Contact"
            className="w-12 h-12 mb-1"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) {
                fallback.style.display = 'flex';
                fallback.style.alignItems = 'center';
                fallback.style.justifyContent = 'center';
              }
            }}
          />
          <span className="text-white text-xs font-medium text-center drop-shadow-lg">
            Contact
          </span>
        </motion.div>
      </div>
    </div>
  );
}
