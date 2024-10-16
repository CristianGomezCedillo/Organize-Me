import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { isAfter, format } from 'date-fns'; // Ensure you have date-fns installed
import { Ionicons } from '@expo/vector-icons';
import { Circle } from 'react-native-progress';

//When calling this, pass a function from your script as a parameter for onPressCheckmark
export default function TaskGraphic({task_name,due_date,is_completed,description,time_to_take,repeating,progress_time=0,onPressCheckmark}) {
  const dueDate = new Date(due_date);
  const isOverdue = isAfter(new Date(), dueDate);
  
  return (
    <View>
      <View style={styles.taskHeader}>
      <TouchableOpacity onPress={onPressCheckmark}>
          {is_completed ? (<Ionicons name="checkmark-circle-sharp" size={40} color="green" />
            ) : progress_time === 0 ? (<Ionicons name="square-outline" size={40} color="black" />
            ) : (<CircularProgress progress={progress_time} size={40} />)}
        </TouchableOpacity>
        <Text style={styles.taskName}>{task_name}</Text>
        <View style={[styles.statusBadge, is_completed ? styles.completedBadge : (isOverdue ? styles.overdueBadge : styles.pendingBadge)]}>
          <Text style={styles.statusText}>
            {is_completed ? 'Completed' : (isOverdue ? 'Overdue' : 'Pending')}
          </Text>
        </View>
      </View>
      
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      
      <View style={styles.taskDetails}>
        <Text style={styles.detailText}>📅 Due: {format(dueDate, 'MMM dd, yyyy')}</Text>
        {time_to_take ? (
          <Text style={styles.detailText}>⏱️ Time: {time_to_take}</Text>
        ) : null}
        {repeating ? (
          <Text style={styles.detailText}>🔄 Repeats: Every {repeating} days</Text>
        ) : null}
      </View>
    </View>
  );
}


//A circular progress bar that shows up when the task has multiple sittings
const CircularProgress = ({ progress, size = 100, color = 'lightblue' }) => {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    paddingHorizontal: 12,
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
});
