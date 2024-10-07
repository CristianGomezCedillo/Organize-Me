import React, { useState, useEffect } from 'react';
import { View, FlatList, Button, StyleSheet } from 'react-native';
import { supabase } from '../../components/supabaseClient';
import Task from '../../components/Task';
import EditTaskModal from '../../components/EditTaskModal';
import CreateTaskModal from '../../components/CreateTaskModal';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false); // State for create task modal

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks_table').select('*');
    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle task deletion
  const handleDelete = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Open edit modal with selected task
  const handleEdit = (task) => {
    setSelectedTask(task);
    setEditModalVisible(true);
  };

  // Open create task modal
  const handleCreate = () => {
    setCreateModalVisible(true);
  };

  // Close create modal
  const closeCreateModal = () => {
    setCreateModalVisible(false);
  };

  // Render each task as an item
  const renderTaskItem = ({ item }) => (
    <Task
      key={item.id}
      taskId={item.id}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id.toString()}
      />

      {/* Create Task Button */}
      <View style={styles.createButtonContainer}>
        <Button title="Create Task" onPress={handleCreate} />
      </View>

      {/* Render EditTaskModal */}
      {isEditModalVisible && (
        <EditTaskModal
          task={selectedTask}
          isVisible={isEditModalVisible}
          onClose={() => setEditModalVisible(false)}
          onUpdate={fetchTasks} // Refresh task list after updating
        />
      )}

      {/* Render CreateTaskModal */}
      {isCreateModalVisible && (
        <CreateTaskModal
          isVisible={isCreateModalVisible}
          onClose={closeCreateModal}
          onCreate={fetchTasks} // Refresh task list after creating
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  createButtonContainer: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
});

export default TaskList;
