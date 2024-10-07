import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from './supabaseClient';
import EditTaskModal from './EditTaskModal'; // Modal for editing the task

const Task = ({ taskId, onEdit, onDelete }) => {
  const [task, setTask] = useState(null); // State for the task details
  const [isEditModalVisible, setEditModalVisible] = useState(false); // Modal visibility state

  // Fetch task details from Supabase
  const fetchTask = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks_table')
        .select('*')
        .eq('id', taskId)
        .single(); // Use .single() if you're fetching one record

      if (error) throw error;

      setTask(data);
    } catch (err) {
      console.error('Error fetching task:', err);
      Alert.alert('Error fetching task:', err.message);
    }
  };

  // Fetch task details when the component mounts
  useEffect(() => {
    fetchTask();
  }, [taskId]);

  // Update task handler
  const handleUpdate = async (updatedTask) => {
    try {
      const { error } = await supabase
        .from('tasks_table')
        .update(updatedTask)
        .eq('id', task.id);

      if (error) {
        console.error('Error updating task:', error);
        Alert.alert('Error updating task:', error.message);
      } else {
        Alert.alert('Task updated successfully');
        setTask(updatedTask);
        setEditModalVisible(false); // Close the edit modal
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // Delete task handler
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('tasks_table')
        .delete()
        .eq('id', task.id);

      if (error) {
        console.error('Error deleting task:', error);
        Alert.alert('Error deleting task:', error.message);
      } else {
        Alert.alert('Task deleted successfully');
        onDelete(task.id); // Notify parent to remove task from list
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // Ensure task is loaded before rendering
  if (!task) return <Text>Loading task...</Text>;

  return (
    <View style={styles.taskContainer}>
      <Text style={styles.taskName}>{task.task_name}</Text>
      <Text>{task.description}</Text>
      <Text>Time to take: {task.time_to_take}</Text>
      <Text>Due date: {new Date(task.due_date).toLocaleDateString()}</Text>
      <Text>Repeating: {task.repeating}</Text>
      <Text>Completed: {task.is_completed ? 'Yes' : 'No'}</Text>

      {/* Buttons */}
      <Button title="Edit Task" onPress={() => setEditModalVisible(true)} />
      <Button title="Delete Task" onPress={handleDelete} color="red" />

      {/* Edit Task Modal */}
      <EditTaskModal
        visible={isEditModalVisible}
        task={task}
        onClose={() => setEditModalVisible(false)}
        onSave={handleUpdate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  taskContainer: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  taskName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Task;