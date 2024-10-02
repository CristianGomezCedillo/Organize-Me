import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Modal, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../components/supabaseClient'; // Import your Supabase client

const AllTasksScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // Form state for new task
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [timeToTake, setTimeToTake] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [repeating, setRepeating] = useState(''); // Store repeating as a string to allow numeric input
  const [isCompleted, setIsCompleted] = useState(false);

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks_table')
      .select('*');
    if (error) {
      console.error(error);
    } else {
      setTasks(data);
    }
    setLoading(false);
  };

  const createTask = async () => {
    // Ensure required fields are filled
    if (!taskName || !dueDate) {
      Alert.alert("Please fill in all required fields.");
      return;
    }
  
    // Validate and format data
    const formattedDueDate = new Date(dueDate).toISOString(); // Format date to ISO 8601
    const repeatingValue = repeating ? parseInt(repeating, 10) : null; // Ensure repeating is a number
  
    // Construct the data object to be inserted
    const taskData = {
      task_name: taskName,
      description: description,
      time_to_take: timeToTake,
      due_date: formattedDueDate,
      repeating: repeatingValue,
      is_completed: isCompleted
    };
  
    // Log the task data for debugging
    console.log("Task data being sent to Supabase:", taskData);
  
    // Send the request to Supabase
    const { data, error } = await supabase
      .from('tasks_table')
      .insert([taskData]);  // Insert expects an array of objects
  
    // Handle response
    if (error) {
      console.error("Supabase Error:", error);  // Log the error details
      Alert.alert("Error creating task:", error.message);
    } else {
      Alert.alert("Task created successfully!");
      fetchTasks();  // Refresh task list
      setModalVisible(false);  // Close modal after successful insertion
      clearForm();  // Clear form inputs
    }
  };  

  // Clear form after submission
  const clearForm = () => {
    setTaskName('');
    setDescription('');
    setTimeToTake('');
    setDueDate('');
    setRepeating(''); // Reset to empty string
    setIsCompleted(false);
  };

  // Fetch tasks when component mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  // Render each task
  const renderItem = ({ item }) => (
    <View style={styles.taskContainer}>
      <Text style={styles.taskName}>{item.task_name}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.timeToTake}>Time to take: {item.time_to_take}</Text>
      <Text style={styles.dueDate}>Due: {new Date(item.due_date).toLocaleDateString()}</Text>
      <Text style={styles.repeating}>Repeating: {item.repeating ? `${item.repeating} units` : 'None'}</Text>
      <Text style={styles.isCompleted}>Completed: {item.is_completed ? 'Yes' : 'No'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />
          <Button title="Create New Task" onPress={() => setModalVisible(true)} />

          {/* Modal for creating a new task */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Create New Task</Text>

              <TextInput
                placeholder="Task Name"
                value={taskName}
                onChangeText={setTaskName}
                style={styles.input}
              />

              <TextInput
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                style={styles.input}
              />

              <TextInput
                placeholder="Time to Take"
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
                placeholder="Repeating Interval"
                value={repeating}
                onChangeText={setRepeating}
                style={styles.input}
                keyboardType="numeric" // Only allow numeric input
              />

              <View style={styles.switchContainer}>
                <Text>Completed</Text>
                <Button title={isCompleted ? "Yes" : "No"} onPress={() => setIsCompleted(!isCompleted)} />
              </View>

              <Button title="Submit" onPress={createTask} />
              <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

export default AllTasksScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  taskContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  taskName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginTop: 8,
  },
  timeToTake: {
    fontSize: 14,
    marginTop: 4,
  },
  dueDate: {
    fontSize: 14,
    marginTop: 4,
  },
  repeating: {
    fontSize: 14,
    marginTop: 4,
  },
  isCompleted: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: 'bold',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    width: '100%',
  },
});