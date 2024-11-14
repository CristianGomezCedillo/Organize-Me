import React, { useState, useEffect, useRef, useCallback} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { supabase } from '../../components/supabaseClient';
import Task from '../../components/Task';
import OrganizerAlgorithm from '../../components/OrganizerAlgorithm'
import EditTaskModal from '../../components/EditTaskModal';
import CreateTaskModal from '../../components/CreateTaskModal';
import { MaterialIcons } from '@expo/vector-icons';
import { commonStyles } from '../../components/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PlantMessage from "../../components/PlantMessage";


export default function Home() {
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [hasTasks, setHasTasks] = useState(true);
  const [tempHours, setTempHours] = useState([3,3,3,3,3,3,3]);
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
  const [hoursPerDay, setHoursPerDay] = useState([]); //Mon, Tues, Wed, Thu, Fri, Sat, Sun hours available for homework
  const messageRef = useRef(null); //for the plantmessage
  const daysOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  //const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getTodayDate = () => {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    today.setHours(0, 0, 0, 0); // Reset time to midnight in local time
    return today.toISOString().split('T')[0]; // Convert to ISO string and split to get 'YYYY-MM-DD'
  };
  const today = getTodayDate();


   // Function to load hours from AsyncStorage
   const loadHours = async () => {
    try {
      const storedHours = await AsyncStorage.getItem('HoursPerDay');
      
      if (storedHours !== null) {
        setHoursPerDay(JSON.parse(storedHours));
        setTempHours(JSON.parse(storedHours))
      } else {
        // If there's no stored value, initialize it with default values
        setHoursPerDay([3, 3, 3, 3, 3, 3, 3]);
        setTempHours([3, 3, 3, 3, 3, 3, 3]);
        await AsyncStorage.setItem('HoursPerDay', JSON.stringify([3, 3, 3, 3, 3, 3, 3]));
      }

    } catch (error) {
      console.error('Failed to load hours:', error);
    }
    
  };

  // Function to save hours to AsyncStorage
  const saveHours = async () => {
    try {
      await AsyncStorage.setItem('HoursPerDay', JSON.stringify(tempHours));
      console.log('Updated settings' + JSON.stringify(tempHours));
    } catch (error) {
      console.error('Failed to save hours:', error);
    }
  };
  
  // Fetch current user session
  const fetchUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {ht4
      console.error('Error fetching user session:', error);
    } else {
      setUser(session?.user ?? null);
    }
  };

  useEffect(() => {
    fetchUser(); // Fetch the current user
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("Hello, I'm focused!");
      fetchTasks(); // Fetch tasks whenever this screen is focused
    }, [user])
  );

  useEffect(() => {
    if (user) {
      loadHours(); //this also calls fetchTasks
    }
  }, [user]);

  useEffect(() => {
    console.log("Updated hours: ", hoursPerDay);
    fetchTasks();
  }, [hoursPerDay])

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    if (!user) {
      console.log("User not loaded yet.");
      return; // Avoid querying if the user is not loaded yet
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks_table')
        .select('*')
        .or(`user_id.eq.${user?.id},user_id.is.null`) // Show tasks for user and unassigned tasks
        //.neq('is_completed',1); YES we want the completed tasks to appear on the agenda!
        //.order('due_date', { ascending: true });

      if (error) throw error;
      setHasTasks(data.length > 0);

      //Add a field called Priority that is calculated when the task is fetched
      const tasksWithPriority = data.map(task => ({
        ...task,
        priority: OrganizerAlgorithm.GetPriority(task.due_date,task.is_completed,task.time_to_take) // Add priority based on the function
      }));
      // Sort tasks by priority (higher priority first)
      tasksWithPriority.sort((a, b) => b.priority - a.priority);

      // Transform tasks into the format expected by the calendar
      const transformedTasks = distributeTasksByDay(tasksWithPriority, hoursPerDay);
      console.log("Tasks fetched");
      setItems(transformedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };
  const getTimeToTake = (task) =>{
    const f = parseFloat(task.time_to_take);
    if(f==0){return 0.5;}
    if(isNaN(f)){return 1;}
    return f; 
  }
  const distributeTasksByDay = (tasks) => {
    const transformedItems = {};
    let day = today;
    let allComplete = true;
    let hoursUsed = 0;
    let hoursPerToday = 0;
    tasks.forEach((task, index) => {
      if (!transformedItems[day]) {
        transformedItems[day] = [];
      }
      hoursPerDay[new Date(day).getDay()];
      hoursPerToday = hoursPerDay[new Date(day).getDay()];
      //console.log("day "+new Date(day).getDay()+" hours used: "+hoursUsed+" total available: "+hoursPerToday);
      if (hoursUsed + getTimeToTake(task) <= hoursPerToday) {
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
        hoursUsed += getTimeToTake(task);
      } else {
        // Move to the next day if current day is full
        day = getNextDay(day);
        // Reset hours for the new day
        hoursPerToday = hoursPerDay[new Date(day).getDay()]; // Update hours for the new day
         hoursUsed = getTimeToTake(task); // Reset hoursUsed to the time for the current task
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
        hoursUsed = getTimeToTake(task);
      }
    });
    return transformedItems;
  };

  // Helper function to get the next day's date
  const getNextDay = (dateString) => {
    const date = new Date(dateString);
    
    date.setDate(date.getDate() + 1);
    //date.setHours(0,0,0,0);
    return date.toISOString().split('T')[0];
  };

    // Handle task deletion
    const handleDelete = (taskId) => {
      fetchTasks();
      //setTasks(tasks.filter(task => task.id !== taskId));
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

  const tempHoursChange = (value, index) => {
    const updatedHours = [...tempHours];
    updatedHours[index] = value ? parseInt(value, 10) : 1; // Convert value to int or set to 0
    setTempHours(updatedHours);
  }

  const handleHoursChange = () => {
    setHoursPerDay(tempHours);
    saveHours();
  };

  return (
    <View style={styles.container}>
      <PlantMessage ref={messageRef} initialText="Initial Message" />
      <TouchableOpacity style={commonStyles.settingsButton} onPress={() => setSettingsModalVisible(true)}>
        <MaterialIcons name="settings" size={24} color="gray" />
      </TouchableOpacity>
      <Text>{today} Hours Available for Work: {hoursPerDay[new Date(today).getDay()]}</Text>

      {/*Settings popup*/}
      <Modal animationType="slide" transparent={true} visible={isSettingsModalVisible}>
        <View style={commonStyles.modalOverlay}>
          <View style={commonStyles.modalView}>
            <Text style={commonStyles.modalTitle}>Hours Available Per Day</Text>
            {hoursPerDay.map((hours, index) => (
              <View key={index} style={styles.inputRow}>
                <Text style={styles.label}>{daysOfWeek[index]}: </Text>
                <TextInput
                  style={commonStyles.input}
                  keyboardType="numeric" // Ensures numeric input
                  value={tempHours[index].toString()}
                  onChangeText={(value) => tempHoursChange(value, index)} // Updates corresponding index
                  placeholder="Enter hours"
                />
              </View>
            ))}
          </View>
          <View style={commonStyles.modalButtons}>
            <TouchableOpacity style={commonStyles.submitButton} onPress={() => {
              setSettingsModalVisible(false); 
              handleHoursChange();
              }}>
              <Text style={commonStyles.buttonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/*Agenda component*/}
      {/* Display a message when no tasks are fetched */}
      {!loading && !hasTasks ?(
          <View style={styles.noTasksContainer}>
            <Text style={styles.noTasksText}>No tasks scheduled.</Text>
          </View>
        ):(
          <Agenda
            key={JSON.stringify(items)} //force a re render by supplying a new key each time
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
        )}

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
  noTasksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noTasksText: {
    fontSize: 18,
    color: '#777',
  },
  settingsButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#007AFF', // Button background color
    padding: 10,               // Padding around the icon
    borderRadius: 25,           // Rounded button
    justifyContent: 'center',   // Center icon within button
    alignItems: 'center',       // Align icon in the center
  },
});

