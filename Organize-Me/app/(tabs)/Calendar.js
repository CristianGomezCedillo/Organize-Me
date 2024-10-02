import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Agenda } from 'react-native-calendars';
import ToDoItem from '../../components/ToDoItem';

const eventsList = [
  { date: '2024-09-30', due: '2024-09-30', name: 'Event 1 on 30th', description: 'Do the Dishes', height: 50, complete: false, progress: 0.75, backgroundColor:'lightgreen', priority:1 },
  { date: '2024-09-30', name: 'Event 2 on 30th', description: 'Coding Assignment', height: 50, complete: false, progress: 0, progressPerClick: 0.25},
  { date: '2024-10-01', name: 'Event 1 on 1st', description: 'Build an App', height: 50, complete: true, progress: 1},
];

export default function Home() {
  
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const today = getTodayDate();
  
  const [items, setItems] = useState({}); // Initialize as an empty object

  // Load items for today when the component mounts
  useEffect(() => {
    loadItems({ dateString: today }); // Load today's events
  }, []);

  const loadItems = (day) => {
    // Filter events for the selected day from eventsList
    const filteredEvents = eventsList.filter(event => event.date === day.dateString);
    
    // Create a new items object for the selected day
    const newItems = {
      [day.dateString]: filteredEvents.length > 0 ? filteredEvents : [], // Store filtered events
    };

    // Update the state with the new items
    setItems(prevItems => ({
      ...newItems,
    }));
  };

  const renderEmptyDate = () => {
    return (
      <View style={{ padding: 20 }}>
        <Text>No tasks for this day!</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Agenda
        items={items}
        selected={today} // Set the selected date to today
        loadItemsForMonth={loadItems} // Load items for the month
        renderItem={(item) => {
          return (
            <View style={styles.container}>
              <ToDoItem name={item.name} date={item.date} description={item.description} complete={item.complete} progress={item.progress} progressPerClick={item.progressPerClick} backgroundColor={item.backgroundColor} priority={item.priority}/>
            </View>
          );
        }}
        renderEmptyDate={renderEmptyDate} // Render empty date message
        onDayPress={(day) => {
          loadItems(day); // Load items for the selected day when it's pressed
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    backgroundColor: 'lightblue',
    padding: 20,
    marginVertical: 5,
  },
});
