import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';

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
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text>Edit Task</Text>
        <TextInput
          style={styles.input}
          value={taskName}
          onChangeText={setTaskName}
          placeholder="Task Name"
        />
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
        />
        <TextInput
          style={styles.input}
          value={timeToTake}
          onChangeText={setTimeToTake}
          placeholder="Time to take"
        />
        <TextInput
          style={styles.input}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="Due Date"
        />
        <TextInput
          style={styles.input}
          value={repeating}
          onChangeText={setRepeating}
          placeholder="Repeating"
        />
        <Button title="Completed" onPress={() => setIsCompleted(!isCompleted)} />

        <Button title="Save" onPress={handleSave} />
        <Button title="Cancel" onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
    borderRadius: 5,
  },
});

export default EditTaskModal;
