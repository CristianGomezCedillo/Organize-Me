// Components/ToDoListItem.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ToDoItem = ({name, date, description }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.date}>{date}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'lightblue',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    elevation: 2, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  date: {
    color: 'gray',
  },
  description: {
    marginTop: 5,
    fontSize: 14,
  },
});

export default ToDoItem;
