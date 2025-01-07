import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';
import useStore from '../lib/store';
import GalaxyBackground from '../components/GalaxyBackground';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, loading } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
    } else {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen relative space-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <GalaxyBackground />
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div>
          <Link to="/" className="block text-center">
            <Logo size="lg" className="mx-auto animate-float" />
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Connexion à votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Ou{' '}
            <Link 
              to="/register" 
              className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              créez un compte gratuitement
            </Link>
          </p>
        </div>

        <div className="cosmic-card p-8 rounded-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Adresse email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="cosmic-input w-full px-4 py-2 rounded-lg"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cosmic-input w-full px-4 py-2 rounded-lg"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-purple-400 hover:text-purple-300">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cosmic-button w-full py-3 px-4 rounded-lg text-white relative overflow-hidden group"
            >
              <span className="relative z-10">
                {loading ? 'Connexion...' : 'Se connecter'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </form>
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>
    </div>
  );
}
