import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { supabase } from '../../components/supabaseClient';
import Task from '../../components/Task';
import OrganizerAlgorithm from '../../components/OrganizerAlgorithm'
import EditTaskModal from '../../components/EditTaskModal';
import CreateTaskModal from '../../components/CreateTaskModal';

export default function Home() {
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [user, setUser] = useState(null);

  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const today = getTodayDate();

  const hoursPerDay = [3,3,3,3,3,5,5]; //Mon, Tues, Wed, Thu, Fri, Sat, Sun hours available for homework
  // Fetch current user session
  const fetchUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error fetching user session:', error);
    } else {
      setUser(session?.user ?? null);
    }
  };

  useEffect(() => {
    fetchUser(); // Fetch the current user
  }, []);

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks_table')
        .select('*')
        .or(`user_id.eq.${user?.id},user_id.is.null`); // Show tasks for user and unassigned tasks
        //.order('due_date', { ascending: true });

      if (error) throw error;

      //Add a field called Priority that is calculated when the task is fetched
      const tasksWithPriority = data.map(task => ({
        ...task,
        priority: OrganizerAlgorithm.GetPriority(task.due_date,0,task.time_to_take) // Add priority based on the function
      }));
      // Sort tasks by priority (higher priority first)
      tasksWithPriority.sort((a, b) => b.priority - a.priority);

      // Transform tasks into the format expected by the calendar
      const transformedTasks = distributeTasksByDay(tasksWithPriority, hoursPerDay);
      setItems(transformedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };
  const distributeTasksByDay = (tasks, maxTasksPerDay) => {
    const transformedItems = {};
    //let day = new Date(today);
    let day = today;
    let hoursUsed = 0;

    tasks.forEach((task, index) => {
      if (!transformedItems[day]) {
        transformedItems[day] = [];
      }
      if(isNaN(parseFloat(task.time_to_take))){task.time_to_take = 1;}
      if (hoursUsed + parseFloat(task.time_to_take) < hoursPerDay[new Date(day).getDay()]) {
      //if(transformedItems[day].length < 3){
        transformedItems[day].push({
          name: task.task_name,
          date: task.due_date.split('T')[0],
          description: task.description || '',
          complete: task.is_completed,
          progress: task.is_completed ? 1 : 0,
          progressPerClick: 0.25,
          height: 50,
          backgroundColor: getTaskColor(task),
          id: task.id,
          priority: task.priority
        });
        if(!isNaN(parseFloat(task.time_to_take))){
          hoursUsed += task.time_to_take;
        }else{
          hoursUsed += 1; //default of one hour if no task length is given
        }

      } else {
        // Move to the next day if current day is full
        day = getNextDay(day);
        //hoursUsed = 0;
        transformedItems[day] = [
          {
            name: task.task_name,
            date: task.due_date.split('T')[0],
            description: task.description || '',
            complete: task.is_completed,
            progress: task.is_completed ? 1 : 0,
            progressPerClick: 0.25,
            height: 50,
            backgroundColor: getTaskColor(task),
            id: task.id,
            priority: task.priority
          }
        ];
        if(!isNaN(parseFloat(task.time_to_take))){
          hoursUsed += task.time_to_take;
        }else{
          hoursUsed += 1; //default of one hour if no task length is given
        }
      }
    });
    return transformedItems;
  };

  // Helper function to get the next day's date
  const getNextDay = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

    // Handle task deletion
    const handleDelete = (taskId) => {
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

  // Get color based on task status
  const getTaskColor = (task) => {
    if (task.is_completed) return '#34C759'; // Green for completed
    const dueDate = new Date(task.due_date);
    const now = new Date();
    
    if (dueDate < now) return '#FF3B30'; // Red for overdue
    return '#007AFF'; // Blue for pending
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const loadItems = (day) => {
    // This function is called when scrolling through months
    // We don't need to do anything here as we've already loaded all tasks
  };

  const renderEmptyDate = () => {
    return (
      <View style={styles.emptyDate}>
        <Text>No tasks for this day</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>{today} Hours Available for Work: {hoursPerDay[new Date(today).getDay()]}</Text>
      <Agenda
        items={items}
        selected={today}
        loadItemsForMonth={loadItems}
        renderItem={(item) => (
          <View style={styles.itemContainer}>
            <Task
              key={item.id}
              taskId={item.id}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <Text>Priority {item.priority}</Text>
          </View>
        )}
        renderEmptyDate={renderEmptyDate}
        onDayPress={(day) => {
          // If you need to do something when a day is pressed
        }}
        theme={{
          agendaDayTextColor: '#007AFF',
          agendaDayNumColor: '#007AFF',
          agendaTodayColor: '#007AFF',
          agendaKnobColor: '#007AFF'
        }}
      />

      {/* Render EditTaskModal */}
      {isEditModalVisible && (
        <EditTaskModal
          task={selectedTask}
          isVisible={isEditModalVisible}
          onClose={() => setEditModalVisible(false)}
          onUpdate={fetchTasks} // Refresh task list after updating
        />
      )}

      {/* Render CreateTaskModal */}
      {isCreateModalVisible && (
        <CreateTaskModal
          isVisible={isCreateModalVisible}
          onClose={closeCreateModal}
          onCreate={fetchTasks} // Refresh task list after creating
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    flex: 1,
    marginRight: 10,
    marginTop: 17,
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
});

