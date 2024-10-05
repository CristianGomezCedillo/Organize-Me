import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../components/supabaseClient';
import { format, isAfter } from 'date-fns';

const AllTasksScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [taskIdToEdit, setTaskIdToEdit] = useState(null);
   const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formState, setFormState] = useState({
    taskName: '',
    description: '',
    timeToTake: '',
    dueDate: '',
    repeating: '',
    isCompleted: false
  });

  const fetchTasks = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('tasks_table').select('*').order('due_date', { ascending: true });
      if (error) throw error;
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      Alert.alert("Error", "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    
    // Check for expired tasks every minute
    const interval = setInterval(() => {
      const now = new Date();
      setTasks(currentTasks => 
        currentTasks.filter(task => !isAfter(now, new Date(task.due_date)))
      );
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchTasks]);

  const filteredTasks = useCallback(() => {
    return tasks.filter((task) => {
      const taskNameMatch = task.task_name.toLowerCase().includes(searchQuery.toLowerCase());

      if (filterStatus === 'all') return taskNameMatch;
      if (filterStatus === 'completed') return taskNameMatch && task.is_completed;
      if (filterStatus === 'pending') return taskNameMatch && !task.is_completed && !isAfter(new Date(), new Date(task.due_date));
      if (filterStatus === 'overdue') return taskNameMatch && !task.is_completed && isAfter(new Date(), new Date(task.due_date));
    });
  }, [tasks, searchQuery, filterStatus]);


  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    setFormState({
      taskName: '',
      description: '',
      timeToTake: '',
      dueDate: '',
      repeating: '',
      isCompleted: false
    });
    setIsEditing(false);
    setTaskIdToEdit(null);
  }, []);

  const handleInputChange = useCallback((name, value) => {
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = async () => {
    if (!formState.taskName || !formState.dueDate) {
      Alert.alert("Required Fields", "Please fill in task name and due date.");
      return;
    }

    try {
      const taskData = {
        task_name: formState.taskName,
        description: formState.description,
        time_to_take: formState.timeToTake,
        due_date: new Date(formState.dueDate).toISOString(),
        repeating: formState.repeating ? parseInt(formState.repeating, 10) : null,
        is_completed: formState.isCompleted
      };

    if (isEditing && taskIdToEdit) {
  const { error } = await supabase
    .from('tasks_table')
    .update(taskData)
    .eq('id', taskIdToEdit);

  if (error) {
    console.error("Supabase Update Error:", error.message, error.details, error.hint);
    throw error;
  } else {
    console.log("Task updated successfully!");
  }
} else {
  const { error } = await supabase
    .from('tasks_table')
    .insert([taskData]);

  if (error) {
    console.error("Supabase Insert Error:", error.message, error.details, error.hint);
    throw error;
  } else {
    console.log("Task created successfully!");
  }
}

      fetchTasks();
      handleModalClose();
      Alert.alert("Success", `Task ${isEditing ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error("Error saving task:", error);
      Alert.alert("Error", `Failed to ${isEditing ? 'update' : 'create'} task`);
    }
  };

  const openEditModal = useCallback((task) => {
    setFormState({
      taskName: task.task_name,
      description: task.description || '',
      timeToTake: task.time_to_take || '',
      dueDate: format(new Date(task.due_date), 'yyyy-MM-dd'),
      repeating: task.repeating ? task.repeating.toString() : '',
      isCompleted: task.is_completed || false
    });
    setTaskIdToEdit(task.id);
    setIsEditing(true);
    setModalVisible(true);
  }, []);

  const renderItem = useCallback(({ item }) => {
    const dueDate = new Date(item.due_date);
    const isOverdue = isAfter(new Date(), dueDate);
    
    return (
      <TouchableOpacity 
        style={[styles.taskContainer, item.is_completed && styles.completedTask]}
        onPress={() => openEditModal(item)}
      >
        <View style={styles.taskHeader}>
          <Text style={styles.taskName}>{item.task_name}</Text>
          <View style={[styles.statusBadge, item.is_completed ? styles.completedBadge : (isOverdue ? styles.overdueBadge : styles.pendingBadge)]}>
            <Text style={styles.statusText}>
              {item.is_completed ? 'Completed' : (isOverdue ? 'Overdue' : 'Pending')}
            </Text>
          </View>
        </View>
        
        {item.description ? (
          <Text style={styles.description}>{item.description}</Text>
        ) : null}
        
        <View style={styles.taskDetails}>
          <Text style={styles.detailText}>📅 Due: {format(dueDate, 'MMM dd, yyyy')}</Text>
          {item.time_to_take ? (
            <Text style={styles.detailText}>⏱️ Time: {item.time_to_take}</Text>
          ) : null}
          {item.repeating ? (
            <Text style={styles.detailText}>🔄 Repeats: Every {item.repeating} days</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }, [openEditModal]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0066cc" />
      ) : (
          <>
            {/* search bar */}
             <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, filterStatus === 'all' && styles.activeFilter]}
              onPress={() => setFilterStatus('all')}
            >
              <Text>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterStatus === 'pending' && styles.activeFilter]}
              onPress={() => setFilterStatus('pending')}
            >
              <Text>Pending</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterStatus === 'overdue' && styles.activeFilter]}
              onPress={() => setFilterStatus('overdue')}
            >
              <Text>Overdue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterStatus === 'completed' && styles.activeFilter]}
              onPress={() => setFilterStatus('completed')}
            >
              <Text>Completed</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredTasks()}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
          />
          
          <TouchableOpacity 
            style={styles.fabButton} 
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={handleModalClose}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>{isEditing ? "Edit Task" : "New Task"}</Text>

                <TextInput
                  placeholder="Task Name"
                  value={formState.taskName}
                  onChangeText={(value) => handleInputChange('taskName', value)}
                  style={styles.input}
                />

                <TextInput
                  placeholder="Description (optional)"
                  value={formState.description}
                  onChangeText={(value) => handleInputChange('description', value)}
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={3}
                />

                <TextInput
                  placeholder="Time to Take (optional)"
                  value={formState.timeToTake}
                  onChangeText={(value) => handleInputChange('timeToTake', value)}
                  style={styles.input}
                />

                <TextInput
                  placeholder="Due Date (YYYY-MM-DD)"
                  value={formState.dueDate}
                  onChangeText={(value) => handleInputChange('dueDate', value)}
                  style={styles.input}
                />

                <TextInput
                  placeholder="Repeat every X days (optional)"
                  value={formState.repeating}
                  onChangeText={(value) => handleInputChange('repeating', value)}
                  style={styles.input}
                  keyboardType="numeric"
                />

                <TouchableOpacity 
                  style={[styles.completedButton, formState.isCompleted && styles.completedButtonActive]}
                  onPress={() => handleInputChange('isCompleted', !formState.isCompleted)}
                >
                  <Text style={styles.completedButtonText}>
                    {formState.isCompleted ? '✓ Completed' : 'Mark as Completed'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleModalClose}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>{isEditing ? "Update" : "Create"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    margin: 10,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#e5e5e5',
  },
  activeFilter: {
    backgroundColor: '#007AFF',
    color: '#ffffff',
  },
 
  listContainer: {
    padding: 16,
  },
  taskContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedTask: {
    opacity: 0.7,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: '#007AFF',
  },
  completedBadge: {
    backgroundColor: '#34C759',
  },
  overdueBadge: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  taskDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailText: {
    fontSize: 14,
    color: '#666666',
    marginRight: 12,
    marginTop: 4,
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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

export default AllTasksScreen;