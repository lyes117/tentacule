import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Card } from '../components/ui/Card';
import EmployeeModal from '../components/employees/EmployeeModal';
import { employeeService } from '../lib/employeeService';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getEmployees();
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Employés">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Liste des employés</h2>
          <button
            onClick={() => setShowModal(true)}
            className="cosmic-button px-4 py-2 rounded-lg"
          >
            + Ajouter un employé
          </button>
        </div>

        <Card>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="cosmic-spinner" />
            </div>
          ) : employees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Poste
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Département
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                            <span className="text-white font-medium">
                              {employee.first_name[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {`${employee.first_name} ${employee.last_name}`}
                            </div>
                            <div className="text-sm text-gray-400">
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{employee.position}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{employee.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="text-purple-400 hover:text-purple-300 mr-3"
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">Aucun employé trouvé</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 cosmic-button px-4 py-2 rounded-lg"
              >
                Ajouter votre premier employé
              </button>
            </div>
          )}
        </Card>
      </div>

      {showModal && (
        <EmployeeModal
          onClose={() => setShowModal(false)}
          onSave={() => {
            fetchEmployees();
            setShowModal(false);
          }}
        />
      )}
    </DashboardLayout>
  );
}
