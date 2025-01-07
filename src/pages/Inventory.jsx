import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Card } from '../components/ui/Card';
import InventoryModal from '../components/inventory/InventoryModal';
import MovementModal from '../components/inventory/MovementModal';
import AlertsPanel from '../components/inventory/AlertsPanel';
import { inventoryService } from '../lib/inventoryService';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchInventory();
    fetchAlerts();
  }, []);

  const fetchInventory = async () => {
    try {
      const data = await inventoryService.getInventoryItems();
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const data = await inventoryService.getAlerts();
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        await inventoryService.deleteInventoryItem(itemId);
        fetchInventory();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  return (
    <DashboardLayout title="Inventaire">
      <div className="space-y-6">
        {/* Header with alerts summary */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white">Gestion de l'inventaire</h2>
            <p className="text-gray-400 mt-1">
              {items.length} articles en stock
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setSelectedItem(null);
                setShowItemModal(true);
              }}
              className="cosmic-button px-4 py-2 rounded-lg"
            >
              + Nouvel article
            </button>
          </div>
        </div>

        {/* Alerts Panel */}
        {alerts.length > 0 && (
          <AlertsPanel 
            alerts={alerts} 
            onResolve={fetchAlerts}
          />
        )}

        {/* Inventory List */}
        <Card>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="cosmic-spinner" />
            </div>
          ) : items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Article
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Stock actuel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Stock minimum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Prix unitaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {item.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{item.sku}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          item.current_stock <= item.minimum_stock
                            ? 'text-red-400'
                            : item.current_stock <= item.reorder_point
                            ? 'text-yellow-400'
                            : 'text-green-400'
                        }`}>
                          {item.current_stock} {item.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {item.minimum_stock} {item.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                          }).format(item.unit_price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowMovementModal(true);
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Mouvement
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowItemModal(true);
                            }}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            Éditer
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">Aucun article en stock</p>
              <button
                onClick={() => setShowItemModal(true)}
                className="mt-4 cosmic-button px-4 py-2 rounded-lg"
              >
                Ajouter votre premier article
              </button>
            </div>
          )}
        </Card>
      </div>

      {showItemModal && (
        <InventoryModal
          item={selectedItem}
          onClose={() => {
            setShowItemModal(false);
            setSelectedItem(null);
          }}
          onSave={() => {
            fetchInventory();
            fetchAlerts();
          }}
        />
      )}

      {showMovementModal && selectedItem && (
        <MovementModal
          item={selectedItem}
          onClose={() => {
            setShowMovementModal(false);
            setSelectedItem(null);
          }}
          onSave={() => {
            fetchInventory();
            fetchAlerts();
          }}
        />
      )}
    </DashboardLayout>
  );
}
