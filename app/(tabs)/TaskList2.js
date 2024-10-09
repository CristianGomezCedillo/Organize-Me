/*  TODO

ADD SEARCH function back
add filters back
fix complete button when creating a task
add user authentication
create task button as a plus symbol -- done.
remove delete button in favor of a slide to delete function.

*/ //  TODO


import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { supabase } from '../../components/supabaseClient';
import Task from '../../components/Task';
import EditTaskModal from '../../components/EditTaskModal';
import CreateTaskModal from '../../components/CreateTaskModal';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);

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
      <TouchableOpacity style={styles.fabButton} onPress={handleCreate}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>



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
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default TaskList;