import React, { useState, useEffect, useRef} from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Text, TextInput } from 'react-native';
import { supabase } from '../../components/supabaseClient';
import Task from '../../components/Task';
import EditTaskModal from '../../components/EditTaskModal';
import CreateTaskModal from '../../components/CreateTaskModal';
import { isAfter } from 'date-fns';
import PlantMessage from "../../components/PlantMessage";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [user, setUser] = useState(null);
  const messageRef = useRef(null); // For the plant message

  // Fetch current user session
  const fetchUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error fetching user session:', error);
    } else {
      setUser(session?.user ?? null);
    }
  };

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks_table')
      .select('*')
      .or(`user_id.eq.${user?.id},user_id.is.null`); // Show tasks for user and unassigned tasks
    
    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data);
    }
  };

  useEffect(() => {
    fetchUser(); // Fetch the current user
  }, []);

  useEffect(() => {
    if (user !== null) {
      fetchTasks(); // Fetch tasks after user is set
    }
  }, [user]);

  // Handle task deletion
  const handleDelete = async (taskId) => {
    // Delete task from Supabase
    const { error } = await supabase
      .from('tasks_table')
      .delete()
      .eq('id', taskId);
    
    if (error) {
      console.error('Error deleting task:', error);
      return;
    }

    // Show the plantMessage
    messageRef.current.changeMessage('Task deleted successfully!');
    messageRef.current.changeImageSource("../../assets/images/Plants/plant2_complete.png");
    messageRef.current.show(); // Show the modal

    // Update local state
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Open edit modal with selected task
  const handleEdit = (task) => {
    setSelectedTask(task);
    setEditModalVisible(true);
  };

  // Open create task modal
  const handleCreate = () => {
    setCreateModalVisible(true);
  };

  // Close create modal
  const closeCreateModal = () => {
    setCreateModalVisible(false);
  };

  // Render each task as an item
  const renderTaskItem = ({ item }) => (
    <Task
      key={item.id}
      taskId={item.id}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onUpdate={(updatedTask) => {
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
        );
      }}
    />
  );

  const filteredTasks = () => {
    return tasks.filter((task) => {
      // Safeguard against undefined task
      if (!task || !task.task_name) return false;
  
      const taskNameMatch = task.task_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Early return if taskName does not match
      if (!taskNameMatch) return false;
  
      const dueDate = new Date(task.due_date);
      
      // Check filter status
      if (filterStatus === 'all') return !task.is_completed; // All tasks
      if (filterStatus === 'completed') return task.is_completed === 1; // Completed tasks
      if (filterStatus === 'pending') return !task.is_completed && !isAfter(new Date(), dueDate); // Pending tasks
      if (filterStatus === 'overdue') return !task.is_completed && isAfter(new Date(), dueDate); // Overdue tasks
  
      return false; // Default case
    });
  };
  

  return (
    <View style={styles.container}>
      
      {/* Search bar */}
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

      {filteredTasks().length === 0 ? ( // Check if the filtered task list is empty
        <Text style={styles.emptyMessage}>Hooray! All your tasks are complete... Add a new task below</Text>
      ) : (
        <FlatList
          data={filteredTasks()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTaskItem}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <PlantMessage ref={messageRef} initialText="Initial Message" />

      {/* Create Task Button */}
      <TouchableOpacity style={styles.fabButton} onPress={handleCreate}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Render EditTaskModal */}
      {isEditModalVisible && (
        <EditTaskModal
          task={selectedTask}
          isVisible={isEditModalVisible}
          onClose={() => setEditModalVisible(false)}
          onUpdate={(updatedTask) => {
            setTasks((prevTasks) =>
              prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
            );
          }} // Update local task state
        />
      )}

      {/* Render CreateTaskModal */}
      {isCreateModalVisible && (
        <CreateTaskModal
          isVisible={isCreateModalVisible}
          onClose={closeCreateModal}
          onCreate={async (newTask) => {
            // Add the new task to the local state
            setTasks((prevTasks) => [...prevTasks, newTask]);
            closeCreateModal(); // Close modal after creation
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
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
  createButtonContainer: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
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
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 30,
    color: '#777',
  },
});

export default TaskList;
