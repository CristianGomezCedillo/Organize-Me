// Components/ToDoListItem.js
import React, {useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Circle } from 'react-native-progress';

const CircularProgress = ({ progress, size = 100, color = 'blue' }) => {
  return (
    <View style={styles.wheel}>
      <Circle
        progress={progress} // A value between 0 and 1
        size={size} // Size of the circle
        indeterminate={progress === null} // If true, it will show an indeterminate state
        color={color} // Color of the progress
        style={styles.progress}
      />
      {progress !== null && (
        <Text style={styles.progressText}>
          {(progress * 100).toFixed(0)}%
        </Text>
      )}
    </View>
  );
};

const PriorityColors = {
  0: 'white',
  1: 'orange',
  2: 'red',
  default: 'white',
};

const ToDoItem = ({name, date, description, timeTaken, initialProgress=0, progressPerClick=1, repeating=false, complete=false, backgroundColor='lightblue', priority=0}) => {
  const [progress, setProgress] = useState(initialProgress); // Use state to manage progress
  const handlePress = () => {
    setProgress(prevProgress => Math.min(1, prevProgress + progressPerClick));
  }
  return (
    <View style={[styles.container, { backgroundColor, borderColor: PriorityColors[priority]}]}>
      <TouchableOpacity onPress={handlePress}>
        {progress === 1 || complete === true ? (
            <Ionicons name="checkmark-circle-sharp" size={40} color="green" />
          ) : progress === 0 ? (
            <Ionicons name="square-outline" size={40} color="black" />
          ) : (
            <CircularProgress progress={progress} size={40} color="blue" />
          )}
      </TouchableOpacity>
      <View style={styles.textContainercontainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    //backgroundColor: 'lightblue',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    flexDirection: 'row',
    borderWidth: 2, // Width of the border
    borderColor: 'orange', // Color of the border
    borderRadius: 10, // Rounding the corners of the border
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
  textContainer: {
    flex: 1,
    paddingHorizontal:20,
  },
  wheel: {
    padding: 10,
    marginVertical: 5,
    flexDirection: 'row',
  },
  progress: {
    marginBottom: 10, // Space between the circle and text
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ToDoItem;
