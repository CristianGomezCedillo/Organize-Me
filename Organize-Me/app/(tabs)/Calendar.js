// app/index.js
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Agenda } from 'react-native-calendars';
import ToDoItem from '../../components/ToDoItem';

const eventsList = [
  { date: '2024-09-30', due: '2024-09-30', name: 'Event 1 on 30th', description: 'Do the Dishes', height: 50 },
  { date: '2024-09-30', name: 'Event 2 on 30th', description: 'Coding Assignment', height: 50 },
  { date: '2024-10-01', name: 'Event 1 on 1st', description: 'Build an App', height: 50 },
];

export default function Home() {
  const [items, setItems] = useState({}); // Store items based on selected day

  const loadItems = (day) => {
    // Filter events for the selected day from eventsList
    const filteredEvents = eventsList.filter(event => event.date === day.dateString);
    
    // Create a new items object for the selected day
    const newItems = {
      [day.dateString]: filteredEvents.length > 0 ? filteredEvents : [], // Store filtered events
    };

    // Update the state with the new items
    setItems(newItems);
  };

  return (
    <View style={styles.container}>
      <Agenda
        items={items}
        loadItemsForMonth={loadItems}
        renderItem={(item) => {
          return (
            <View style={styles.container}>
              <ToDoItem name={item.name} date={item.date} description={item.description}/>
            </View>
          );
        }}
        // Customize other props as needed
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
