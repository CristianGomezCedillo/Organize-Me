import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { commonStyles } from './styles';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Ionicons } from '@expo/vector-icons';

const genres = [
  "Self-Care & Hygiene",
  "Household & Chores",
  "Finances & Bills",
  "School & Learning",
  "Work & Career",
  "Physical Health & Fitness",
  "Social & Relationships",
  "Hobbies & Recreation",
  "Errands & Miscellaneous",
  "Planning & Organization"
];

const EditTaskModal = ({ visible, task, onClose, onSave }) => {
  const [taskName, setTaskName] = useState(task.task_name);
  const [description, setDescription] = useState(task.description);
  const [timeToTake, setTimeToTake] = useState(task.time_to_take);
  const [dueDate, setDueDate] = useState(task.due_date);
  const [repeating, setRepeating] = useState(task.repeating);
  const [isCompleted, setIsCompleted] = useState(task.is_completed);
  const [genre, setGenre] = useState(task.genre);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const handleSave = () => {
    const updatedTask = {
      ...task,
      task_name: taskName,
      description,
      time_to_take: timeToTake,
      due_date: dueDate,
      repeating,
      is_completed: isCompleted,
      genre,
    };
    onSave(updatedTask);
  };

  const handleConfirm = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setDueDate(formattedDate);
    setDatePickerVisibility(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
    >
      <View style={commonStyles.modalOverlay}>
        <View style={commonStyles.modalView}>
          <Text style={commonStyles.modalTitle}>Edit Task</Text>

          <TextInput
            placeholder="Task Name"
            value={taskName}
            onChangeText={setTaskName}
            style={commonStyles.input}
          />

          <TextInput
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            style={[commonStyles.input, styles.textArea]}
            multiline
            numberOfLines={3}
          />

          <TextInput
            placeholder="Time to Take (optional)"
            value={timeToTake}
            onChangeText={setTimeToTake}
            style={commonStyles.input}
          />

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={genre}
              onValueChange={(itemValue) => setGenre(itemValue)}
              style={styles.picker}
            >
              {genres.map((genreItem) => (
                <Picker.Item key={genreItem} label={genreItem} value={genreItem} />
              ))}
            </Picker>
          </View>

          <View style={styles.datePickerContainer}>
            {Platform.OS === 'web' ? (
              <ReactDatePicker
                selected={dueDate ? new Date(dueDate) : null}
                onChange={(date) => {
                  const formattedDate = date.toISOString().split('T')[0];
                  setDueDate(formattedDate);
                }}
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
                customInput={(
                  <TouchableOpacity style={styles.webDatePickerInput}>
                    <Text style={styles.inputText}>{dueDate || "Select Date"}</Text>
                    <Ionicons name="calendar-outline" size={24} color="#007AFF" />
                  </TouchableOpacity>
                )}
              />
            ) : (
              <>
                <TextInput
                  placeholder="Due Date (YYYY-MM-DD)"
                  value={dueDate}
                  editable={false}
                  style={commonStyles.input}
                />
                <TouchableOpacity onPress={() => setDatePickerVisibility(true)}>
                  <Ionicons name="calendar-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="date"
                  onConfirm={handleConfirm}
                  onCancel={() => setDatePickerVisibility(false)}
                  date={new Date(dueDate)}
                  minimumDate={new Date()}
                />
              </>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.completedButton, isCompleted && styles.completedButtonActive]}
            onPress={() => setIsCompleted(!isCompleted)}
          >
            <Text style={styles.completedButtonText}>
              {isCompleted ? '✓ Completed' : 'Mark as Completed'}
            </Text>
          </TouchableOpacity>

          <View style={commonStyles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={commonStyles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={commonStyles.submitButton} onPress={handleSave}>
              <Text style={commonStyles.buttonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  textArea: {
    height: 80,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    width: '100%',
    height: 50,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    marginBottom: 16,
  },
  webDatePickerContainer: {
    position: 'relative',
  },
  webDatePickerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
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
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
});

export default EditTaskModal;
