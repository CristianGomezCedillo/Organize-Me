import React, { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  Platform,
  FlatList,
} from "react-native";
import { CheckBox } from 'react-native-elements'; // Checkbox component
import AsyncStorage from "@react-native-async-storage/async-storage"; // For storing tasks

export default function ToDoPage() {
  const [task, setTask] = useState("");
  const [tag, setTag] = useState("");
  const [taskItems, setTaskItems] = useState([]);

  // Fetch tasks on app start
  useEffect(() => {
    loadTasks();
  }, []);

  // Save task list to storage
  const saveTasks = async (tasks) => {
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  };

  // Load tasks from storage
  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      if (storedTasks !== null) {
        setTaskItems(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  // Add new task with tag
  const handleAddTask = () => {
    if (task) {
      Keyboard.dismiss();
      const newTask = { text: task, isCompleted: false, tag: tag || "General" }; // Add tag
      const updatedTasks = [...taskItems, newTask];
      setTaskItems(updatedTasks);
      setTask(""); // Reset input
      setTag(""); // Reset tag input
      saveTasks(updatedTasks); // Save to AsyncStorage
    }
  };

  // Complete or uncheck task
  const toggleTaskCompletion = (index) => {
    let updatedTasks = [...taskItems];
    updatedTasks[index].isCompleted = !updatedTasks[index].isCompleted;
    setTaskItems(updatedTasks);
    saveTasks(updatedTasks);
  };

  // Delete a task
  const deleteTask = (index) => {
    let updatedTasks = [...taskItems];
    updatedTasks.splice(index, 1);
    setTaskItems(updatedTasks);
    saveTasks(updatedTasks);
  };

  return (
    <View style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        {/* Task Heading */}
        <View style={styles.tasksWrapper}>
          <Text style={styles.sectionTitle}>My To-Do List</Text>

          {/* Task List */}
          {taskItems.length > 0 ? (
            <FlatList
              data={taskItems}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.taskItem}>
                  <CheckBox
                    checked={item.isCompleted}
                    onPress={() => toggleTaskCompletion(index)}
                    containerStyle={styles.checkbox}
                  />
                  <View style={styles.taskContent}>
                    <Text style={item.isCompleted ? styles.taskTextCompleted : styles.taskText}>{item.text}</Text>
                    <Text style={styles.tagText}>{item.tag}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteTask(index)}>
                    <Text style={styles.deleteText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noTaskText}>No tasks added yet</Text>
          )}
        </View>
      </ScrollView>

      {/* Task Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.writeTaskWrapper}
      >
        <TextInput
          style={styles.input}
          placeholder={"Add a new task"}
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TextInput
          style={styles.tagInput}
          placeholder={"Add a tag "}
          value={tag}
          onChangeText={(text) => setTag(text)}
        />
        <TouchableOpacity onPress={handleAddTask}>
          <View style={styles.addWrapper}>
            <Text style={styles.addText}>+</Text>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
  },
  tasksWrapper: {
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#3E3E3E",
    marginBottom: 20,
    textAlign: "center",
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  checkbox: {
    padding: 0,
    margin: 0,
  },
  taskContent: {
    flex: 1,
    marginLeft: 10,
  },
  taskText: {
    fontSize: 18,
    color: "#333",
  },
  taskTextCompleted: {
    fontSize: 18,
    color: "#888",
    textDecorationLine: "line-through",
  },
  tagText: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
  },
  noTaskText: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
    marginTop: 50,
  },
  writeTaskWrapper: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 60,
    borderColor: "#C0C0C0",
    borderWidth: 1,
    width: 200,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  tagInput: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 60,
    borderColor: "#C0C0C0",
    borderWidth: 1,
    width: 150,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  addWrapper: {
    width: 60,
    height: 60,
    backgroundColor: "#3E3E3E",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  addText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  deleteText: {
    fontSize: 18,
    color: "red",
    marginLeft: 10,
  },
});
