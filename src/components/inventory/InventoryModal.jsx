import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../lib/inventoryService';
import { clientService } from '../../lib/clientService';

export default function InventoryModal({ item, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    unit: '',
    current_stock: 0,
    minimum_stock: 0,
    reorder_point: 0,
    unit_price: 0,
    supplier_id: ''
  });
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSuppliers();
    if (item) {
      setFormData({
        name: item.name || '',
        sku: item.sku || '',
        description: item.description || '',
        category: item.category || '',
        unit: item.unit || '',
        current_stock: item.current_stock || 0,
        minimum_stock: item.minimum_stock || 0,
        reorder_point: item.reorder_point || 0,
        unit_price: item.unit_price || 0,
        supplier_id: item.supplier_id || ''
      });
    }
  }, [item]);

  const fetchSuppliers = async () => {
    try {
      const data = await clientService.getClients();
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (item) {
        await inventoryService.updateInventoryItem(item.id, formData);
      } else {
        await inventoryService.createInventoryItem(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving inventory item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="cosmic-card w-full max-w-2xl p-6 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {item ? 'Modifier l\'article' : 'Nouvel article'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nom de l'article
              </label>
              <input
                type="text"
                required
                className="cosmic-input w-full px-3 py-2 rounded-lg"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                SKU
              </label>
              <input
                type="text"
                required
                className="cosmic-input w-full px-3 py-2 rounded-lg"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              className="cosmic-input w-full px-3 py-2 rounded-lg"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Catégorie
              </label>
              <input
                type="text"
                className="cosmic-input w-full px-3 py-2 rounded-lg"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Unité
              </label>
              <input
                type="text"
                required
                className="cosmic-input w-full px-3 py-2 rounded-lg"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Stock actuel
              </label>
              <input
                type="number"
                required
                className="cosmic-input w-full px-3 py-2 rounded-lg"
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Stock minimum
              </label>
              <input
                type="number"
                required
                className="cosmic-input w-full px-3 py-2 rounded-lg"
                value={formData.minimum_stock}
                onChange={(e) => setFormData({ ...formData, minimum_stock: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Point de commande
              </label>
              <input
                type="number"
                required
                className="cosmic-input w-full px-3 py-2 rounded-lg"
                value={formData.reorder_point}
                onChange={(e) => setFormData({ ...formData, reorder_point: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Prix unitaire
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="cosmic-input w-full px-3 py-2 rounded-lg"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Fournisseur
              </label>
              <select
                className="cosmic-input w-full px-3 py-2 rounded-lg"
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
              >
                <option value="">Sélectionner un fournisseur</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.company_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="cosmic-button px-4 py-2 rounded-lg"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
