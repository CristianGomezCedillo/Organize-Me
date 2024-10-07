import React, { useState } from 'react';
import { Modal, View, TextInput, Button, StyleSheet, Alert, Switch, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import Picker from the correct package
import { supabase } from './supabaseClient';

const CreateTaskModal = ({ isVisible, onClose, onCreate }) => {
  const [newTask, setNewTask] = useState({
    task_name: '',
    description: '',
    time_to_take: '',
    due_date: '', // Expected to be a valid timestamp string
    repeating: 0, // Default to 0 (non-repeating)
    is_completed: false, // Default to false
  });

  // Handle task creation
  const handleCreate = async () => {
    try {
      const { error } = await supabase
        .from('tasks_table')
        .insert([newTask]);

      if (error) {
        console.error('Error creating task:', error);
        Alert.alert('Error creating task:', error.message);
      } else {
        Alert.alert('Task created successfully');
        onClose();
        onCreate(); // Refresh task list
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={styles.modalContainer}>
        {/* Task Name */}
        <TextInput
          style={styles.input}
          placeholder="Task Name"
          value={newTask.task_name}
          onChangeText={(text) => setNewTask({ ...newTask, task_name: text })}
        />
        
        {/* Task Description */}
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={newTask.description}
          onChangeText={(text) => setNewTask({ ...newTask, description: text })}
        />
        
        {/* Time to Take */}
        <TextInput
          style={styles.input}
          placeholder="Time to Take (e.g., 2 hours)"
          value={newTask.time_to_take}
          onChangeText={(text) => setNewTask({ ...newTask, time_to_take: text })}
        />
        
        {/* Due Date */}
        <TextInput
          style={styles.input}
          placeholder="Due Date (YYYY-MM-DD)"
          value={newTask.due_date}
          onChangeText={(text) => setNewTask({ ...newTask, due_date: text })}
        />

        {/* Repeating Picker */}
        <Picker
          selectedValue={newTask.repeating}
          style={styles.input}
          onValueChange={(itemValue) => setNewTask({ ...newTask, repeating: itemValue })}
        >
          <Picker.Item label="Non-repeating" value={0} />
          <Picker.Item label="Daily" value={1} />
          <Picker.Item label="Weekly" value={2} />
          <Picker.Item label="Monthly" value={3} />
        </Picker>

        {/* Completed Switch */}
        <View style={styles.switchContainer}>
          <Switch
            value={newTask.is_completed}
            onValueChange={(value) => setNewTask({ ...newTask, is_completed: value })}
          />
          <Text>{newTask.is_completed ? 'Completed' : 'Not Completed'}</Text>
        </View>

        {/* Create and Cancel Buttons */}
        <Button title="Create Task" onPress={handleCreate} />
        <Button title="Cancel" onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
});

export default CreateTaskModal;