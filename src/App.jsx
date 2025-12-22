import React, { useEffect, useRef, useState } from 'react';
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

import heartCursor from './assets/heart.cur';

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
  const settingsSnapshotRef = useRef(null);
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem('desktopSettings');
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.wallpaper && typeof saved.wallpaper === 'string') {
        setWallpaper(saved.wallpaper);
      }
      if (saved?.textSize && typeof saved.textSize === 'string') {
        setTextSize(saved.textSize);
      }
      if (saved?.cursor && typeof saved.cursor === 'string') {
        setCursor(saved.cursor);
      }
    } catch {
      // ignore invalid localStorage
    }
  }, []);

  useEffect(() => {
    const fontSize =
      textSize === 'text-sm'
        ? '14px'
        : textSize === 'text-lg'
        ? '18px'
        : '16px';
    document.documentElement.style.fontSize = fontSize;
  }, [textSize]);

  useEffect(() => {
    const cursorValueByClass = {
      'cursor-default': `url("${heartCursor}") 0 0, default`,
      'cursor-pointer': 'pointer',
      'cursor-crosshair': 'crosshair',
      'cursor-wait': 'wait',
    };

    const styleId = 'global-cursor-style';
    const cursorCss = [
      'body, body * { cursor: var(--app-cursor, auto) !important; }',
      'a, a *, button, button *, [role="button"], [role="button"] *, [role="link"], [role="link"] *, .cursor-pointer, .cursor-pointer * { cursor: pointer !important; }',
      // Keep text cursor for inputs.
      'input, textarea, select { cursor: text !important; }',
    ].join('\n');

    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    
    style.textContent = cursorCss;

    const cssCursor = cursorValueByClass[cursor] || 'auto';
    document.documentElement.style.setProperty('--app-cursor', cssCursor);
  }, [cursor]);

  const handleSaveSettings = ({ wallpaper, textSize, cursor }) => {
    setWallpaper(wallpaper);
    setTextSize(textSize);
    setCursor(cursor);
    try {
      localStorage.setItem(
        'desktopSettings',
        JSON.stringify({ wallpaper, textSize, cursor })
      );
    } catch {
      // ignore quota / disabled storage
    }
    settingsSnapshotRef.current = null;
    setShowSettings(false);
  };

  const openSettings = () => {
    settingsSnapshotRef.current = { wallpaper, textSize, cursor };
    setShowSettings(true);
  };

  const handlePreviewSettings = ({ wallpaper, textSize, cursor }) => {
    setWallpaper(wallpaper);
    setTextSize(textSize);
    setCursor(cursor);
  };

  const handleCloseSettings = () => {
    const snapshot = settingsSnapshotRef.current;
    if (snapshot) {
      setWallpaper(snapshot.wallpaper);
      setTextSize(snapshot.textSize);
      setCursor(snapshot.cursor);
    }
    settingsSnapshotRef.current = null;
    setShowSettings(false);
  };

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
      onClick: openSettings,
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
      onClick: openSettings,
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
            onOpenSettings={openSettings}
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
              wallpaper={wallpaper}
              textSize={textSize}
              cursor={cursor}
              onSave={handleSaveSettings}
              onPreview={handlePreviewSettings}
              onClose={handleCloseSettings}
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
