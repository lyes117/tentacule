import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import GalaxyBackground from '../components/GalaxyBackground';
import FeatureCard from '../components/FeatureCard';

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

const features = [
  {
    icon: (
      <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Gestion RH Avancée",
    description: "Gérez votre équipe avec des outils RH de pointe et un suivi en temps réel."
  },
  {
    icon: (
      <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    title: "Gestion des Tâches",
    description: "Organisez et suivez vos projets avec une interface intuitive et puissante."
  },
  {
    icon: (
      <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Facturation Intelligente",
    description: "Créez et gérez vos factures avec un système automatisé et conforme."
  },
  {
    icon: (
      <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Analyses & Rapports",
    description: "Visualisez vos données avec des tableaux de bord interactifs et personnalisables."
  }
];

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [konamiSequence, setKonamiSequence] = useState([]);
  const [showMatrixEffect, setShowMatrixEffect] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [showSecretMessage, setShowSecretMessage] = useState(false);
  const [jellyfishPosition, setJellyfishPosition] = useState({ x: 0, y: 0 });
  const [bubbles, setBubbles] = useState([]);

  const handleMouseMove = useCallback((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    setJellyfishPosition({
      x: (e.clientX / window.innerWidth) * 40 - 20,
      y: (e.clientY / window.innerHeight) * 40 - 20
    });
  }, []);

  const handleKeyDown = useCallback((e) => {
    const newSequence = [...konamiSequence, e.key];
    if (newSequence.length > KONAMI_CODE.length) {
      newSequence.shift();
    }
    setKonamiSequence(newSequence);

    if (newSequence.join(',') === KONAMI_CODE.join(',')) {
      setShowMatrixEffect(true);
      setTimeout(() => setShowMatrixEffect(false), 5000);
    }
  }, [konamiSequence]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    const initialBubbles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 20 + 10,
      speed: Math.random() * 2 + 1
    }));
    setBubbles(initialBubbles);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleMouseMove, handleKeyDown]);

  const handleLogoClick = () => {
    setLogoClicks(prev => {
      const newCount = prev + 1;
      if (newCount === 7) {
        setShowSecretMessage(true);
        setTimeout(() => setShowSecretMessage(false), 3000);
        return 0;
      }
      return newCount;
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden space-bg">
      <GalaxyBackground />

      {/* Parallax Stars */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
        }}
      >
        <div className="stars-layer-1" />
      </div>
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          transform: `translate(${mousePosition.x * 0.04}px, ${mousePosition.y * 0.04}px)`
        }}
      >
        <div className="stars-layer-2" />
      </div>

      {/* Floating Bubbles */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {bubbles.map(bubble => (
          <div
            key={bubble.id}
            className="bubble absolute"
            style={{
              left: `${bubble.x}vw`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animationDuration: `${bubble.speed * 10}s`
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <header className="fixed w-full z-50">
        <nav className="glass-effect">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex-shrink-0 flex items-center">
                <Logo 
                  size="md" 
                  className="mr-3 hover:animate-spin cursor-pointer" 
                  onClick={handleLogoClick}
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Tentacule
                </span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                  Fonctionnalités
                </a>
                <Link
                  to="/login"
                  className="cosmic-button px-4 py-2 rounded-lg text-white hover:scale-105 transform transition-all"
                >
                  Connexion
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8 relative group">
              <Logo 
                size="2xl" 
                className="animate-float group-hover:animate-spin cursor-pointer" 
              />
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 cosmic-pulse hover:scale-105 transition-transform cursor-default">
                Plongez dans l'avenir
              </span>
              <span className="block mt-2 text-white hover:scale-105 transition-transform cursor-default">
                de la gestion d'entreprise
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300 hover:text-white transition-colors">
              Une solution ERP complète et intuitive qui s'adapte aux profondeurs de vos besoins.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                to="/register"
                className="cosmic-button px-8 py-3 text-lg rounded-lg text-white shadow-lg hover:shadow-purple-500/20 hover:scale-110 transition-all duration-300"
              >
                Démarrer gratuitement
              </Link>
              <a
                href="#features"
                className="px-8 py-3 text-lg rounded-lg text-white border border-purple-500/30 hover:border-purple-500/50 hover:scale-110 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              >
                Découvrir
              </a>
            </div>
          </div>
        </div>

        {/* Interactive Jellyfish */}
        <div 
          className="jellyfish"
          style={{
            transform: `translate(${jellyfishPosition.x}px, ${jellyfishPosition.y}px)`
          }}
        >
          <div className="jellyfish-body" />
          <div className="jellyfish-tentacles" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Explorez nos fonctionnalités
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Des outils puissants pour une gestion sans limites
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-2">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="cosmic-card p-12 rounded-3xl text-center transform hover:scale-105 transition-all duration-300">
            <h2 className="text-3xl font-bold text-white mb-6">
              Prêt à explorer de nouveaux horizons ?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Rejoignez les entreprises qui ont déjà fait le grand saut vers l'innovation.
            </p>
            <Link
              to="/register"
              className="cosmic-button px-8 py-4 text-lg rounded-lg inline-block text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Commencer l'aventure
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Logo size="sm" className="mr-3" />
              <span className="text-white font-medium">Tentacule</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 Tentacule. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>

      {/* Easter Eggs and Effects */}
      {showMatrixEffect && (
        <div className="fixed inset-0 z-50 matrix-rain" />
      )}

      {showSecretMessage && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-2xl text-purple-400 animate-bounce">
          🐙 Les tentacules sont partout! 🐙
        </div>
      )}

      <div className="hidden-message">Vous avez trouvé un message secret!</div>
    </div>
  );
}
