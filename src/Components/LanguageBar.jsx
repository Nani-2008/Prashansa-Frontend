import React, { useRef, useState, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';

const LanguageBar = ({ language, setLanguage }) => {
  const languages = [
    { code: "eng", label: "English", symbol: "E" },
    { code: "tel", label: "Telugu", symbol: "తె" },
    { code: "mal", label: "Malayalam", symbol: "മ" }
  ];

  const langContainerRef = useRef(null);
  const langButtonRefs = useRef({});
  const [langSliderStyle, setLangSliderStyle] = useState({});

  useLayoutEffect(() => {
    const activeButton = langButtonRefs.current[language];
    if (activeButton && langContainerRef.current) {
      const containerRect = langContainerRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      setLangSliderStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [language]);

  return (
    <div className="flex z-10">
      <div
        ref={langContainerRef}
        className="relative flex gap-1 p-1 rounded-full bg-[#f5f5f7]/80 backdrop-blur-md border border-gray-200/50 shadow-sm"
      >
        <motion.div
          animate={langSliderStyle}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="absolute top-1 bottom-1 rounded-full bg-white shadow-[0_2px_8px_rgb(0,0,0,0.08)]"
        />

        {languages.map((langObj) => (
          <button
            key={langObj.code}
            ref={(el) => (langButtonRefs.current[langObj.code] = el)}
            onClick={() => setLanguage(langObj.code)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full uppercase tracking-wider transition-all duration-300
            ${language === langObj.code ? "text-[#1d1d1f]" : "text-[#86868b] hover:text-[#1d1d1f]"}`}
          >
            <span className="text-[14px] font-medium leading-none">{langObj.symbol}</span>
            <span className="hidden sm:inline">{langObj.code}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageBar;
