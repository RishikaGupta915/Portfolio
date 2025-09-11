import React, { useState } from 'react';
import BootSequence from './components/BootStrap/BootSequence';
import Desktop from './components/Desktop/desktop';
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

  const wallpapers = [
    defaultWallpaper,
    wallpaper1,
    wallpaper2,
    wallpaper3,
    wallpaper4,
  ];

  // Sample apps for the taskbar
  const apps = [
    { name: 'Browser', icon: '/icons/browser.png' },
    { name: 'Terminal', icon: '/icons/terminal.png' },
    { name: 'VS Code', icon: '/icons/vscode.png' },
    { name: 'Portfolio', icon: '/icons/portfolio.png' },
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
          <Taskbar apps={apps} />
        </>
      )}
    </div>
  );
}

export default App;
