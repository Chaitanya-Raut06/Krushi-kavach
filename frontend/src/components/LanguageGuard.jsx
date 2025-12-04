import { useEffect, useState } from 'react';
import LanguageSelection from './LanguageSelection';

const LanguageGuard = ({ children }) => {
  const [hasLanguage, setHasLanguage] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const language = localStorage.getItem('appLanguage');
    setHasLanguage(!!language);
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!hasLanguage) {
    return <LanguageSelection />;
  }

  return children;
};

export default LanguageGuard;

