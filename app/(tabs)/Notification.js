import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { supabase } from '../../components/supabaseClient';
import ToDoItem from '../../components/ToDoItem';

export default function Home() {
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);

  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const today = getTodayDate();

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks_table')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;

      // Transform tasks into the format expected by the calendar
      const transformedTasks = transformTasksForCalendar(data);
      setItems(transformedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Transform Supabase tasks into calendar format
  const transformTasksForCalendar = (tasks) => {
    const transformedItems = {};
    
    tasks.forEach(task => {
      const date = task.due_date.split('T')[0]; // Extract YYYY-MM-DD
      
      if (!transformedItems[date]) {
        transformedItems[date] = [];
      }
      
      transformedItems[date].push({
        name: task.task_name,
        date: date,
        description: task.description || '',
        complete: task.is_completed,
        progress: task.is_completed ? 1 : 0,
        progressPerClick: 0.25,
        height: 50,
        backgroundColor: getTaskColor(task),
        priority: task.priority || 1,
        id: task.id
      });
    });
    
    return transformedItems;
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
      <Agenda
        items={items}
        selected={today}
        loadItemsForMonth={loadItems}
        renderItem={(item) => (
          <View style={styles.itemContainer}>
            <ToDoItem
              name={item.name}
              date={item.date}
              description={item.description}
              complete={item.complete}
              progress={item.progress}
              progressPerClick={item.progressPerClick}
              backgroundColor={item.backgroundColor}
              priority={item.priority}
            />
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
