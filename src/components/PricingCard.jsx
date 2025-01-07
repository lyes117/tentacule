import React from 'react';
import { Link } from 'react-router-dom';

export default function PricingCard({ plan, price, features, popular }) {
  return (
    <div className={`cosmic-card p-8 rounded-2xl relative ${popular ? 'border-purple-500/50' : ''}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-1 rounded-full text-sm font-medium text-white">
          Plus populaire
        </div>
      )}
      <h3 className="text-xl font-semibold text-white">{plan}</h3>
      <p className="mt-8">
        <span className="text-4xl font-bold text-white">{price}</span>
        {price !== 'Sur mesure' && <span className="text-gray-300">/mois</span>}
      </p>
      <ul className="mt-8 space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-300">
            <svg className="w-5 h-5 text-purple-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        to="/register"
        className={`mt-8 block w-full py-3 px-4 rounded-lg text-center ${
          popular
            ? 'cosmic-button'
            : 'border border-purple-500/30 hover:border-purple-500/50 text-white'
        }`}
      >
        {price === 'Sur mesure' ? 'Contactez-nous' : 'Commencer'}
      </Link>
    </div>
  );
}
