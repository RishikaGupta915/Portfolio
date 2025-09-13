import React, { useState } from 'react';
import BootSequence from './components/BootStrap/BootSequence';
import Desktop from './components/Desktop/Desktop';
import Settings from './components/Desktop/Settings';
import Taskbar from './components/Taskbar/Taskbar';
import SudokuApp from './components/Games/Sudoku/Sudoku';
import TicTacToe from './components/Games/TicTacToe/tictactoe';
import Pong from './components/Games/Pong/pong';
import SnakeGame from './components/Games/Snake/snake';
import PaintApp from './components/Games/paint/paint';
import Certificates from './components/About/certificates';
import AIBrowser from './components/AI CHATBOT/chatbot';
import AboutMe from './components/About/about';
import Contact from './components/About/contact';
import aboutMeIcon from './assets/me.png';
import aiChatbotIcon from './assets/cat.png';
import certificatesIcon from './assets/certificate.png';
import settingsIcon from './assets/settings.png';
import sudokuIcon from './assets/sudoku.png';
import ticTacToeIcon from './assets/tictactoe.png';
import pongIcon from './assets/pong.png';
import snakeIcon from './assets/snake.png';
import paintIcon from './assets/paint.png';
import contactIcon from './assets/contact.png';

import defaultWallpaper from './assets/default.gif';
import wallpaper1 from './assets/wall1.jpg';
import wallpaper2 from './assets/wall2.jpg';
import wallpaper3 from './assets/wall3.jpg';
import wallpaper4 from './assets/wall4.jpg';

function App() {
  const [booting, setBooting] = useState(true);
  const [wallpaper, setWallpaper] = useState(defaultWallpaper);
  const [textSize, setTextSize] = useState('text-base');
  const [cursor, setCursor] = useState('cursor-default');
  const [showSettings, setShowSettings] = useState(false);
  const [showSudoku, setShowSudoku] = useState(false);
  const [showTicTacToe, setShowTicTacToe] = useState(false);
  const [showPong, setShowPong] = useState(false);
  const [showSnake, setShowSnake] = useState(false);
  const [showPaint, setShowPaint] = useState(false);
  const [showCertificates, setShowCertificates] = useState(false);
  const [showAIChatbot, setShowAIChatbot] = useState(false);
  const [showAboutMe, setShowAboutMe] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const wallpapers = [
    defaultWallpaper,
    wallpaper1,
    wallpaper2,
    wallpaper3,
    wallpaper4,
  ];

  const allApps = [
    {
      id: 'about-me',
      name: 'About Me',
      icon: aboutMeIcon,
      onClick: () => setShowAboutMe(true),
      category: 'personal',
    },
    {
      id: 'chatbot',
      name: 'AI Chatbot',
      icon: aiChatbotIcon,
      onClick: () => setShowAIChatbot(true),
      category: 'ai',
    },
    {
      id: 'certificates',
      name: 'Certificates',
      icon: certificatesIcon,
      onClick: () => setShowCertificates(true),
      category: 'personal',
    },
    {
      id: 'contact',
      name: 'Contact',
      icon: contactIcon,
      onClick: () => setShowContact(true),
      category: 'personal',
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: settingsIcon,
      onClick: () => setShowSettings(true),
      category: 'system',
    },
    {
      id: 'sudoku',
      name: 'Sudoku',
      icon: sudokuIcon,
      onClick: () => setShowSudoku(true),
      category: 'games',
    },
    {
      id: 'tictactoe',
      name: 'Tic Tac Toe',
      icon: ticTacToeIcon,
      onClick: () => setShowTicTacToe(true),
      category: 'games',
    },
    {
      id: 'pong',
      name: 'Pong',
      icon: pongIcon,
      onClick: () => setShowPong(true),
      category: 'games',
    },
    {
      id: 'snake',
      name: 'Snake',
      icon: snakeIcon,
      onClick: () => setShowSnake(true),
      category: 'games',
    },
    {
      id: 'paint',
      name: 'Paint',
      icon: paintIcon,
      onClick: () => setShowPaint(true),
      category: 'creative',
    },
  ];

  const taskbarApps = [
    {
      id: 'about-me',
      name: 'About Me',
      icon: aboutMeIcon,
      onClick: () => setShowAboutMe(true),
    },
    {
      id: 'chatbot',
      name: 'AI Chatbot',
      icon: aiChatbotIcon,
      onClick: () => setShowAIChatbot(true),
    },
    {
      id: 'certificates',
      name: 'Certificates',
      icon: certificatesIcon,
      onClick: () => setShowCertificates(true),
    },
    {
      id: 'contact',
      name: 'Contact',
      icon: contactIcon,
      onClick: () => setShowContact(true),
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: settingsIcon,
      onClick: () => setShowSettings(true),
    },
  ];

  return (
    <div className={`fixed inset-0 ${textSize} ${cursor}`}>
      {booting ? (
        <BootSequence onComplete={() => setBooting(false)} />
      ) : (
        <>
          <Desktop
            wallpaper={wallpaper}
            onOpenSettings={() => setShowSettings(true)}
            onOpenSudoku={() => setShowSudoku(true)}
            onOpenTicTacToe={() => setShowTicTacToe(true)}
            onOpenPong={() => setShowPong(true)}
            onOpenSnake={() => setShowSnake(true)}
            onOpenPaint={() => setShowPaint(true)}
            onOpenCertificates={() => setShowCertificates(true)}
            onOpenAIChatbot={() => setShowAIChatbot(true)}
            onOpenAboutMe={() => setShowAboutMe(true)}
            onOpenContact={() => setShowContact(true)}
          />
          {showSettings && (
            <Settings
              wallpapers={wallpapers}
              setWallpaper={setWallpaper}
              setTextSize={setTextSize}
              setCursor={setCursor}
              onClose={() => setShowSettings(false)}
            />
          )}
          {showSudoku && <SudokuApp onClose={() => setShowSudoku(false)} />}
          {showTicTacToe && (
            <TicTacToe onClose={() => setShowTicTacToe(false)} />
          )}
          {showPong && <Pong onClose={() => setShowPong(false)} />}
          {showSnake && <SnakeGame onClose={() => setShowSnake(false)} />}
          {showPaint && <PaintApp onClose={() => setShowPaint(false)} />}
          {showCertificates && (
            <Certificates onClose={() => setShowCertificates(false)} />
          )}
          {showAIChatbot && (
            <AIBrowser onClose={() => setShowAIChatbot(false)} />
          )}
          {showAboutMe && <AboutMe onClose={() => setShowAboutMe(false)} />}
          {showContact && <Contact onClose={() => setShowContact(false)} />}
          <Taskbar apps={taskbarApps} allApps={allApps} />
        </>
      )}
    </div>
  );
}

export default App;
