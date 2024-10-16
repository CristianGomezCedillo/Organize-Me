import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

const EditTaskModal = ({ visible, task, onClose, onSave }) => {
  const [taskName, setTaskName] = useState(task.task_name);
  const [description, setDescription] = useState(task.description);
  const [timeToTake, setTimeToTake] = useState(task.time_to_take);
  const [dueDate, setDueDate] = useState(task.due_date);
  const [repeating, setRepeating] = useState(task.repeating);
  const [isCompleted, setIsCompleted] = useState(task.is_completed);

  const handleSave = () => {
    const updatedTask = {
      ...task,
      task_name: taskName,
      description,
      time_to_take: timeToTake,
      due_date: dueDate,
      repeating,
      is_completed: isCompleted,
    };
    onSave(updatedTask); // Call the update function passed down
  };

  return (
    <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalView}>
        <Text style={styles.modalTitle}>Edit Task</Text>

        <TextInput
          placeholder="Task Name"
          value={taskName}
          onChangeText={setTaskName}
          style={styles.input}
        />

        <TextInput
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={3}
        />

        <TextInput
          placeholder="Time to Take (optional)"
          value={timeToTake}
          onChangeText={setTimeToTake}
          style={styles.input}
        />

        <TextInput
          placeholder="Due Date (YYYY-MM-DD)"
          value={dueDate}
          onChangeText={setDueDate}
          style={styles.input}
        />

        <TextInput
          placeholder="Repeat every X days (optional)"
          value={repeating}
          onChangeText={setRepeating}
          style={styles.input}
          keyboardType="numeric"
        />

        <TouchableOpacity 
          style={[styles.completedButton, isCompleted && styles.completedButtonActive]}
          onPress={() => setIsCompleted(!isCompleted)}
        >
          <Text style={styles.completedButtonText}>
            {isCompleted ? '✓ Completed' : 'Mark as Completed'}
          </Text>
        </TouchableOpacity>

        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  completedButton: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
    marginBottom: 16,
  },
  completedButtonActive: {
    backgroundColor: '#34C759',
  },
  completedButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditTaskModal;