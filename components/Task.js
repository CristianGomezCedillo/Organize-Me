import React, { useState, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { supabase } from './supabaseClient';
import EditTaskModal from './EditTaskModal';
import { isAfter } from 'date-fns';
import { Circle } from 'react-native-progress';
import { LongPressGestureHandler, PanGestureHandler, State, TapGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const genreIcons = {
  "Self-Care & Hygiene": "heart",
  "Household & Chores": "home",
  "Finances & Bills": "wallet",
  "School & Learning": "school",
  "Work & Career": "briefcase",
  "Physical Health & Fitness": "fitness",
  "Social & Relationships": "people",
  "Hobbies & Recreation": "game-controller",
  "Errands & Miscellaneous": "cart",
  "Planning & Organization": "calendar",
};

const Task = ({ taskId, onDelete }) => {
  const [task, setTask] = useState(null);
  const [progressTime, setProgressTime] = useState(0);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [translateX] = useState(new Animated.Value(0));

  const fetchTask = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks_table')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;

      setTask(data);
      setProgressTime(data.is_completed);
    } catch (err) {
      console.error('Error fetching task:', err);
      Alert.alert('Error fetching task:', err.message);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const handleUpdate = async (updatedTask) => {
    try {
      const { error } = await supabase
        .from('tasks_table')
        .update(updatedTask)
        .eq('id', task.id);

      if (error) {
        console.error('Error updating task:', error);
        Alert.alert('Error updating task:', error.message);
      } else {
        Alert.alert('Task updated successfully');
        setTask(updatedTask);
        setEditModalVisible(false);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleDelete = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getSession();
  
      if (userError || !userData?.session?.user) {
        console.error('User session error:', userError);
        Alert.alert('You must be logged in to delete tasks.');
        return;
      }
  
      const user = userData.session.user;
      console.log('User ID:', user.id);
  
      try {
        const { data, error } = await supabase
          .from('tasks_table')
          .delete()
          .eq('id', task.id)
          .eq('user_id', user.id);
  
        if (error) {
          console.error('Error deleting task:', error);
          Alert.alert('Error deleting task:', error.message);
        } else {
          console.log('Delete operation result:', data);
          onDelete(task.id); 
        }
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    } catch (err) {
      console.error('Error getting user session:', err);
    }
  };
  
  if (!task) return <Text>Loading task...</Text>;

  
  const dueDate = new Date(task.due_date);
  const isOverdue = isAfter(new Date(), dueDate);

  const handleProgressClick = async (fullComplete) => {
    let newProgress = Math.min(progressTime + 0.25, 1);
  
    if (progressTime >= 1) {
      setProgressTime(0);
    }
  
    if (fullComplete) {
      setProgressTime(1);
    } else {
      setProgressTime(newProgress);
    }
  
    try {
      const updatedTask = { ...task, is_completed: newProgress };
      setTask(updatedTask);
  
      const { error } = await supabase
        .from('tasks_table')
        .update({ is_completed: newProgress })
        .eq('id', task.id)
        .eq('user_id', task.user_id);
  
      if (error) {
        console.error('Error updating task progress:', error);
        Alert.alert('Error updating task:', error.message);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const deleteThreshold = 150;
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      if (Math.abs(event.nativeEvent.translationX) > deleteThreshold) {
        Animated.timing(translateX, {
          toValue: 3000,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          handleDelete();
        });
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  return (
    <GestureHandlerRootView>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View style={[styles.taskContainer, { transform: [{ translateX }] }]}>
          <LongPressGestureHandler onActivated={() => setEditModalVisible(true)}>
            <View>
              <View style={styles.taskHeader}>
                <View style={styles.progressAndIconContainer}>
                  <TapGestureHandler onActivated={() => handleProgressClick(false)}>
                    <View style={styles.progressContainer}>
                      {progressTime === 1 ? (
                        <Ionicons name="checkmark-circle-sharp" size={40} color="green" />
                      ) : progressTime === 0 ? (
                        <Ionicons name="square-outline" size={40} color="black" />
                      ) : (
                        <CircularProgress progress={progressTime} size={40} />
                      )}
                    </View>
                  </TapGestureHandler>
                  <Ionicons 
                    name={genreIcons[task.genre] || "help-circle"} 
                    size={24} 
                    color="#007AFF" 
                    style={styles.genreIcon} 
                  />
                </View>
                <Text style={styles.taskName}>{task.task_name}</Text>
                <View style={[styles.statusBadge, task.is_completed ? styles.completedBadge : (isOverdue ? styles.overdueBadge : styles.pendingBadge)]}>
                  <Text style={styles.statusText}>
                    {task.is_completed ? 'Completed' : (isOverdue ? 'Overdue' : 'Pending')}
                  </Text>
                </View>
              </View>
              <Text style={styles.description}>{task.description}</Text>
              <View style={styles.taskDetails}>
                <Text style={styles.detailText}>📅 Due: {new Date(task.due_date).toLocaleDateString()}</Text>
                <Text style={styles.detailText}>⏱️ Time: {task.time_to_take}</Text>
                <Text style={styles.detailText}>🔄 Repeats: Every {task.repeating} days</Text>
              </View>
              <EditTaskModal
                visible={isEditModalVisible}
                task={task}
                onClose={() => setEditModalVisible(false)}
                onSave={handleUpdate}
              />
            </View>
          </LongPressGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const CircularProgress = ({ progress, size = 100, color = 'lightblue' }) => {
  return (
    <View style={styles.wheel}>
      <Circle
        progress={progress}
        size={size}
        indeterminate={progress === null}
        color={color}
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
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    marginBottom: 8,
  },
  progressAndIconContainer: {
    alignItems: 'center',
  },
  taskName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
    marginTop: -50,
  },
  description: {
    marginLeft: 54,
    fontSize: 14,
    color: '#666666',
    marginTop: -50,
  },
  taskDetails: {
    flexDirection: 'row',
    marginTop: 10,
    marginLeft: 54
  },
  detailText: {
    fontSize: 14,
    color: '#666666',
    marginRight: 12,
    marginTop: 4,
  },
  progressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  genreIcon: {
    marginTop: 8, 
  },
  statusBadge: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  completedBadge: {
    backgroundColor: '#d4edda',
  },
  overdueBadge: {
    backgroundColor: '#f8d7da',
  },
  pendingBadge: {
    backgroundColor: '#ffeeba',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  wheel: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    position: 'absolute',
    fontWeight: '600',
  },
});


export default Task;