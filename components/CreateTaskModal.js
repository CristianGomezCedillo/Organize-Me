import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import { supabase } from './supabaseClient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import RecurrencePicker from './RecurrencePicker';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CreateTaskModal = ({ isVisible, onClose, onCreate }) => {
  const [newTask, setNewTask] = useState({
    task_name: '',
    description: '',
    time_to_take: '',
    due_date: '',
    genre: '',
    repeat_type: '',
    repeat_interval: 1,
    weekly_day: '',
    monthly_option: '',
    monthly_day: '',
    monthly_week: '',
    monthly_weekday: '',
    yearly_month: '',
    yearly_week: '',
    yearly_weekday: '',
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
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

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

  const handleConfirmDate = (date) => {
    setSelectedDate(date);
    updateDueDate(date, selectedTime);
  };

  const handleConfirmTime = (time) => {
    setSelectedTime(time);
    updateDueDate(selectedDate, time);
  };

  const updateDueDate = (date, time) => {
    const combinedDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes()
    );
    setNewTask({ ...newTask, due_date: combinedDateTime.toISOString() });
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
  
          {/* Date and Time Picker */}
          {Platform.OS === 'web' ? (
            <View style={styles.webDateTimeContainer}>
              <ReactDatePicker
                selected={selectedDate}
                onChange={handleConfirmDate}
                dateFormat="yyyy-MM-dd"
                customInput={
                  <TouchableOpacity style={styles.webDatePickerInput}>
                    <Text style={styles.inputText}>
                      {selectedDate ? selectedDate.toISOString().split('T')[0] : "Select Date"}
                    </Text>
                    <Ionicons name="calendar-outline" size={24} color="#007AFF" />
                  </TouchableOpacity>
                }
              />
              <ReactDatePicker
                selected={selectedTime}
                onChange={handleConfirmTime}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="HH:mm"
                customInput={
                  <TouchableOpacity style={styles.webDatePickerInput}>
                    <Text style={styles.inputText}>
                      {selectedTime ? selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Select Time"}
                    </Text>
                    <Ionicons name="time-outline" size={24} color="#007AFF" />
                  </TouchableOpacity>
                }
              />
            </View>
          ) : (
            <View style={styles.datePickerContainer}>
              <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={styles.webDatePickerInput}>
                <Text style={styles.inputText}>
                  {selectedDate ? selectedDate.toISOString().split('T')[0] : "Select Date"}
                </Text>
                <Ionicons name="calendar-outline" size={24} color="#007AFF" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setTimePickerVisibility(true)} style={styles.webDatePickerInput}>
                <Text style={styles.inputText}>
                  {newTask.due_date
                    ? new Date(newTask.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : "Select Time"}
                </Text>
                <Ionicons name="time-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Separate Modals for Date and Time Picker */}
          <Modal transparent={true} visible={isDatePickerVisible}>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirmDate}
              onCancel={() => setDatePickerVisibility(false)}
            />
          </Modal>

          <Modal transparent={true} visible={isTimePickerVisible}>
            <DateTimePickerModal
              isVisible={isTimePickerVisible}
              mode="time"
              onConfirm={handleConfirmTime}
              onCancel={() => setTimePickerVisibility(false)}
            />
          </Modal>

          {/* Recurrence Picker */}
          <RecurrencePicker
            repeatType={newTask.repeat_type}
            repeatInterval={newTask.repeat_interval}
            weeklyDay={newTask.weekly_day}
            monthlyOption={newTask.monthly_option}
            monthlyDay={newTask.monthly_day}
            monthlyWeek={newTask.monthly_week}
            monthlyWeekday={newTask.monthly_weekday}
            yearlyMonth={newTask.yearly_month}
            yearlyWeek={newTask.yearly_week}
            yearlyWeekday={newTask.yearly_weekday}
            onChange={(updatedRecurrence) => setNewTask({ ...newTask, ...updatedRecurrence })}
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
    width: '100%',
    maxWidth: 650,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 3,
    borderColor: '#E5E5EA',
    borderRadius: 5,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 10,
  },
  webDatePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  webDatePickerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 10,
    zIndex: 9,
  },
  inputText: {
    fontSize: 16,
    color: '#000',
    marginRight: 8,
  },
  picker: {
    width: '48%',
    height: 40,
    marginBottom: 16,
    fontSize: 16,
    padding: 10,
  },
  textArea: {
    height: 80,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
    zIndex: -9,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'red',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    zIndex: -9,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
    zIndex: -9,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CreateTaskModal;
