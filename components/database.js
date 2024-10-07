import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Make sure your Supabase client is correctly configured here
import { View, Text, ScrollView } from 'react-native';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);

  // Function to fetch tasks from the Supabase database
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks_table')
      .select('name, description, time_to_take, due_date, repeating');

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data);
    }
  };

  // useEffect to handle initial data fetching and real-time subscription
  useEffect(() => {
    // Fetch tasks when the component mounts
    fetchTasks();

    // Set up real-time subscription to the tasks_table
    const taskSubscription = supabase
      .from('tasks_table')
      .on('*', (payload) => {
        console.log('Change received!', payload);
        // Re-fetch tasks when there's a change in the table
        fetchTasks();
      })
      .subscribe();

    // Cleanup subscription when the component unmounts
    return () => {
      supabase.removeSubscription(taskSubscription);
    };
  }, []);

  return (
    <ScrollView style={{ padding: 20 }}>
      {tasks.length > 0 ? (
        tasks.map((task, index) => (
          <View key={index} style={{ marginBottom: 20, padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Name: {task.name}</Text>
            <Text>Description: {task.description}</Text>
            <Text>Time to Take: {task.time_to_take}</Text>
            <Text>Due Date: {new Date(task.due_date).toLocaleString()}</Text>
            <Text>Repeating: {task.repeating}</Text>
          </View>
        ))
      ) : (
        <Text>No tasks available.</Text>
      )}
    </ScrollView>
  );
};

export default TaskList;
