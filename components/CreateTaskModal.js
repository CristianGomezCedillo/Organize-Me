import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import { supabase } from './supabaseClient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker'; // Import Picker for dropdown list
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CreateTaskModal = ({ isVisible, onClose, onCreate }) => {
  const [newTask, setNewTask] = useState({
    task_name: '',
    description: '',
    time_to_take: '',
    due_date: '',
    genre: '', // Add genre to newTask state
    repeating: 0,
    is_completed: 0,
    user_id: null,
  });

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

  const [user, setUser] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    const today = new Date();
    setNewTask((prev) => ({ ...prev, due_date: today.toISOString().split('T')[0] }));
  }, []);

  const fetchUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error fetching user session:', error);
    } else {
      setUser(session?.user ?? null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleCreate = async () => {
    try {
      const taskWithUserId = {
        ...newTask,
        user_id: user?.id || null,
      };

      const { error } = await supabase
        .from('tasks_table')
        .insert([taskWithUserId]);

      if (error) {
        console.error('Error creating task:', error);
        Alert.alert('Error creating task:', error.message);
      } else {
        Alert.alert('Task created successfully');
        onClose();
        onCreate();
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleConfirm = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    setNewTask({ ...newTask, due_date: formattedDate });
    setDatePickerVisibility(false);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Create Task</Text>

          <TextInput
            placeholder="Task Name"
            value={newTask.task_name}
            onChangeText={(text) => setNewTask({ ...newTask, task_name: text })}
            style={styles.input}
          />

          <TextInput
            placeholder="Description (optional)"
            value={newTask.description}
            onChangeText={(text) => setNewTask({ ...newTask, description: text })}
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={3}
          />

          <TextInput
            placeholder="Time to Take (optional)"
            value={newTask.time_to_take}
            onChangeText={(text) => setNewTask({ ...newTask, time_to_take: text })}
            style={styles.input}
          />

          {/* Genre Dropdown */}
          <Picker
            selectedValue={newTask.genre}
            onValueChange={(itemValue) => setNewTask({ ...newTask, genre: itemValue })}
            style={styles.picker}
          >
            <Picker.Item label="Select Genre" value="" />
            {genres.map((genre, index) => (
              <Picker.Item key={index} label={genre} value={genre} />
            ))}
          </Picker>

          <View style={styles.datePickerContainer}>
            {Platform.OS === 'web' ? (
              <View style={styles.webDatePickerContainer}>
                <ReactDatePicker
                  selected={newTask.due_date ? new Date(newTask.due_date) : null}
                  onChange={(date) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const formattedDate = `${year}-${month}-${day}`;
                    setNewTask({ ...newTask, due_date: formattedDate });
                  }}
                  dateFormat="yyyy-MM-dd"
                  minDate={new Date()}
                  customInput={(
                    <TouchableOpacity style={styles.webDatePickerInput}>
                      <Text style={styles.inputText}>{newTask.due_date || "Select Date"}</Text>
                      <Ionicons name="calendar-outline" size={24} color="#007AFF" />
                    </TouchableOpacity>
                  )}
                />
              </View>
            ) : (
              <>
                <TextInput
                  placeholder="Due Date (YYYY-MM-DD)"
                  value={newTask.due_date}
                  editable={false}
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setDatePickerVisibility(true)}>
                  <Ionicons name="calendar-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="date"
                  onConfirm={handleConfirm}
                  onCancel={() => setDatePickerVisibility(false)}
                  date={new Date(newTask.due_date)}
                  minimumDate={new Date()}
                  display="default"
                />
              </>
            )}
          </View>

          <TextInput
            placeholder="Repeat every X days (optional)"
            value={newTask.repeating}
            onChangeText={(text) => setNewTask({ ...newTask, repeating: parseInt(text) || 0 })}
            style={styles.input}
            keyboardType="numeric"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleCreate}>
              <Text style={styles.buttonText}>Create</Text>
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
  inputText: {
    flex: 1,
    fontSize: 16,
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
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 16,
    fontSize: 16,
  },
});

export default CreateTaskModal;
