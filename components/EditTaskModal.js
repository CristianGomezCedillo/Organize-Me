import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { commonStyles } from './styles';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Ionicons } from '@expo/vector-icons';
import RecurrencePicker from './RecurrencePicker';
import { handleRepeatLogic } from './RepeatLogic';

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
  const [isCompleted, setIsCompleted] = useState(task.is_completed);
  const [genre, setGenre] = useState(task.genre);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // State for recurrence
  const [repeatType, setRepeatType] = useState(task.repeat_type || '');
  const [repeatInterval, setRepeatInterval] = useState(task.repeat_interval || 1);
  const [weeklyDay, setWeeklyDay] = useState(task.weekly_day || '');
  const [monthlyOption, setMonthlyOption] = useState(task.monthly_option || '');
  const [monthlyDay, setMonthlyDay] = useState(task.monthly_day || '');
  const [monthlyWeek, setMonthlyWeek] = useState(task.monthly_week || '');
  const [monthlyWeekday, setMonthlyWeekday] = useState(task.monthly_weekday || '');
  const [yearlyMonth, setYearlyMonth] = useState(task.yearly_month || '');
  const [yearlyWeek, setYearlyWeek] = useState(task.yearly_week || '');
  const [yearlyWeekday, setYearlyWeekday] = useState(task.yearly_weekday || '');

  const handleSave = async () => {
    // Log the current repeatType state before creating the updatedTask object
    console.log('repeatType in state before saving:', repeatType);
  
    const updatedTask = {
      ...task,
      task_name: taskName,
      description,
      time_to_take: timeToTake,
      due_date: dueDate,
      is_completed: isCompleted ? 1 : 0,
      genre,
      repeat_type: repeatType || task.repeat_type,  // Retain previous value if empty
      repeat_interval: repeatInterval || task.repeat_interval,
      weekly_day: weeklyDay || task.weekly_day,
      monthly_option: monthlyOption || task.monthly_option,
      monthly_day: monthlyDay || task.monthly_day,
      monthly_week: monthlyWeek || task.monthly_week,
      monthly_weekday: monthlyWeekday || task.monthly_weekday,
      yearly_month: yearlyMonth || task.yearly_month,
      yearly_week: yearlyWeek || task.yearly_week,
      yearly_weekday: yearlyWeekday || task.yearly_weekday,
    };
  
    console.log('Updated Task with repeatType:', updatedTask.repeat_type);
  
    if (isCompleted) {
      console.log('Task is marked as completed.');
  
      // Log the repeatType check for debugging purposes
      if (updatedTask.repeat_type) {
        console.log('Repeat Type:', updatedTask.repeat_type);
  
        try {
          await handleRepeatLogic(updatedTask);
          console.log('handleRepeatLogic executed successfully.');
        } catch (error) {
          console.error('Error creating repeating tasks:', error);
        }
      } else {
        console.log('No repeat type defined in updatedTask:', updatedTask.repeat_type);
      }
    }
  
    onSave(updatedTask);
    onClose();
  };
  
  
  const handleConfirm = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setDueDate(formattedDate);
    setDatePickerVisibility(false);
  };

  useEffect(() => {
    // Initialize state with the task data
    setTaskName(task.task_name);
    setDescription(task.description);
    setTimeToTake(task.time_to_take);
    setDueDate(task.due_date);
    setIsCompleted(task.is_completed);
    setGenre(task.genre);
    
    // Set recurrence fields
    setRepeatType(task.repeat_type);
    setRepeatInterval(task.repeat_interval || 1);
    setWeeklyDay(task.weekly_day || '');
    setMonthlyOption(task.monthly_option || '');
    setMonthlyDay(task.monthly_day || '');
    setMonthlyWeek(task.monthly_week || '');
    setMonthlyWeekday(task.monthly_weekday || '');
    setYearlyMonth(task.yearly_month || '');
    setYearlyWeek(task.yearly_week || '');
    setYearlyWeekday(task.yearly_weekday || '');
  }, [task]);

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

          {/* Recurrence Picker */}
          <RecurrencePicker
            repeatType={repeatType}
            repeatInterval={repeatInterval}
            weeklyDay={weeklyDay}
            monthlyOption={monthlyOption}
            monthlyDay={monthlyDay}
            monthlyWeek={monthlyWeek}
            monthlyWeekday={monthlyWeekday}
            yearlyMonth={yearlyMonth}
            yearlyWeek={yearlyWeek}
            yearlyWeekday={yearlyWeekday}
            onChange={(updatedRecurrence) => {
              setRepeatType(updatedRecurrence.repeatType);
              setRepeatInterval(updatedRecurrence.repeatInterval);
              setWeeklyDay(updatedRecurrence.weeklyDay);
              setMonthlyOption(updatedRecurrence.monthlyOption);
              setMonthlyDay(updatedRecurrence.monthlyDay);
              setMonthlyWeek(updatedRecurrence.monthlyWeek);
              setMonthlyWeekday(updatedRecurrence.monthlyWeekday);
              setYearlyMonth(updatedRecurrence.yearlyMonth);
              setYearlyWeek(updatedRecurrence.yearlyWeek);
              setYearlyWeekday(updatedRecurrence.yearlyWeekday);
            }}
          />

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
              <Text style={commonStyles.buttonText}>Save</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  webDatePickerInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  inputText: {
    fontSize: 16,
  },
});

export default EditTaskModal;
