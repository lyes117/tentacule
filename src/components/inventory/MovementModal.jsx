import React, { useState } from 'react';
import { inventoryService } from '../../lib/inventoryService';

export default function MovementModal({ item, onClose, onSave }) {
  const [formData, setFormData] = useState({
    movement_type: 'in',
    quantity: 0,
    notes: '',
    reference_type: '',
    reference_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate quantity
      if (formData.movement_type === 'out' && Math.abs(formData.quantity) > item.current_stock) {
        throw new Error('La quantité de sortie ne peut pas dépasser le stock actuel');
      }

      await inventoryService.recordMovement({
        item_id: item.id,
        ...formData,
        quantity: formData.movement_type === 'out' ? -Math.abs(formData.quantity) : Math.abs(formData.quantity)
      });
      onSave();
      onClose();
    } catch (error) {
      console.error('Error recording movement:', error);
      setError(error.message || 'Une erreur est survenue lors de l\'enregistrement du mouvement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="cosmic-card w-full max-w-lg p-6 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">
              Mouvement de stock
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {item.name} - Stock actuel: {item.current_stock} {item.unit}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Type de mouvement
              </label>
              <select
                className="cosmic-input w-full px-3 py-2 rounded-lg"
                value={formData.movement_type}
                onChange={(e) => setFormData({ ...formData, movement_type: e.target.value })}
                required
              >
                <option value="in">Entrée</option>
                <option value="out">Sortie</option>
                <option value="adjustment">Ajustement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Quantité
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="cosmic-input w-full px-3 py-2 rounded-lg"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                />
                <span className="absolute right-3 top-2 text-gray-400">
                  {item.unit}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Type de référence
              </label>
              <select
                className="cosmic-input w-full px-3 py-2 rounded-lg"
                value={formData.reference_type}
                onChange={(e) => setFormData({ ...formData, reference_type: e.target.value })}
              >
                <option value="">Sélectionner un type</option>
                <option value="purchase">Bon de commande</option>
                <option value="sale">Bon de livraison</option>
                <option value="transfer">Transfert</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                N° de référence
              </label>
              <input
                type="text"
                className="cosmic-input w-full px-3 py-2 rounded-lg"
                value={formData.reference_id}
                onChange={(e) => setFormData({ ...formData, reference_id: e.target.value })}
                placeholder="Ex: BC-2024-001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              className="cosmic-input w-full px-3 py-2 rounded-lg"
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ajoutez des détails sur ce mouvement..."
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="cosmic-button px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <span>Enregistrer</span>
              )}
            </button>
          </div>
        </form>

        {/* Stock movement preview */}
        <div className="mt-6 p-4 rounded-lg bg-gray-800/50 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Aperçu du mouvement
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Stock actuel:</span>
              <span className="ml-2 text-white">{item.current_stock} {item.unit}</span>
            </div>
            <div>
              <span className="text-gray-400">Nouveau stock:</span>
              <span className="ml-2 text-white">
                {formData.movement_type === 'out'
                  ? item.current_stock - Math.abs(formData.quantity)
                  : item.current_stock + Math.abs(formData.quantity)
                } {item.unit}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
