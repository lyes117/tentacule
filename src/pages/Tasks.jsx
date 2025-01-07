import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Card } from '../components/ui/Card';
import TaskModal from '../components/tasks/TaskModal';
import { taskService } from '../lib/taskService';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const statusColumns = {
  pending: { title: 'En attente', color: 'yellow' },
  'in-progress': { title: 'En cours', color: 'blue' },
  completed: { title: 'Terminées', color: 'green' }
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await taskService.getTasks();
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId !== destination.droppableId) {
      try {
        await taskService.updateTaskStatus(draggableId, destination.droppableId);
        fetchTasks();
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <DashboardLayout title="Tâches">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Gestion des tâches</h2>
          <button
            onClick={() => {
              setSelectedTask(null);
              setShowModal(true);
            }}
            className="cosmic-button px-4 py-2 rounded-lg"
          >
            + Nouvelle tâche
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="cosmic-spinner" />
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(statusColumns).map(([status, { title, color }]) => (
                <div key={status} className="space-y-4">
                  <h3 className={`text-lg font-medium text-${color}-400`}>
                    {title} ({getTasksByStatus(status).length})
                  </h3>
                  
                  <Droppable droppableId={status}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-4"
                      >
                        {getTasksByStatus(status).map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="hover:border-purple-500/30 transition-colors"
                              >
                                <div className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-white font-medium">
                                      {task.title}
                                    </h4>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => {
                                          setSelectedTask(task);
                                          setShowModal(true);
                                        }}
                                        className="p-1 text-purple-400 hover:text-purple-300"
                                      >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={async () => {
                                          if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
                                            await taskService.deleteTask(task.id);
                                            fetchTasks();
                                          }
                                        }}
                                        className="p-1 text-red-400 hover:text-red-300"
                                      >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-gray-400 text-sm mb-3">
                                    {task.description}
                                  </p>
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                      {task.assignee && (
                                        <div className="flex items-center">
                                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                                            <span className="text-white text-xs">
                                              {task.assignee.first_name[0]}
                                              {task.assignee.last_name[0]}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        task.priority === 'high'
                                          ? 'bg-red-500/10 text-red-400'
                                          : task.priority === 'medium'
                                          ? 'bg-yellow-500/10 text-yellow-400'
                                          : 'bg-green-500/10 text-green-400'
                                      }`}>
                                        {task.priority}
                                      </span>
                                    </div>
                                    {task.due_date && (
                                      <span className="text-gray-400">
                                        {new Date(task.due_date).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>

      {showModal && (
        <TaskModal
          task={selectedTask}
          onClose={() => {
            setShowModal(false);
            setSelectedTask(null);
          }}
          onSave={fetchTasks}
        />
      )}
    </DashboardLayout>
  );
}
