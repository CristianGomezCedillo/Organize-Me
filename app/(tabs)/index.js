import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, ScrollView } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { supabase } from '../../components/supabaseClient';
import Button from '../../components/Button';
import ImageViewer from '../../components/ImageViewer';
import { format, isAfter, differenceInDays } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { Platform } from 'react-native';
import PlantMessage from "../../components/PlantMessage";
import Plant from '../../components/Plant';

// Screen dimensions for graph scaling
const screenWidth = Dimensions.get('window').width;

export default function Home() {
  const messageRef = useRef(null); //for the plantmessage
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [lastOpenedDate, setLastOpenedDate] = useState(null);

  const fetchStreakData = async () => {
    try {
      const storedDate = await AsyncStorage.getItem('lastOpenedDate');
      const storedStreak = await AsyncStorage.getItem('streakCount');

      if (storedDate) setLastOpenedDate(new Date(storedDate));
      if (storedStreak) setStreakCount(parseInt(storedStreak, 10));
    } catch (error) {
      console.error('Error fetching streak data:', error);
    }
  };

  const updateStreak = async () => {
    const currentDate = new Date();
    if (lastOpenedDate) {
      const daysDifference = differenceInDays(currentDate, lastOpenedDate);
      const updatedStreak = daysDifference === 1 ? streakCount + 1 : 0;
      setStreakCount(updatedStreak);
      await AsyncStorage.setItem('streakCount', updatedStreak.toString());
    }
    await AsyncStorage.setItem('lastOpenedDate', currentDate.toISOString());
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('tasks_table').select('*');
      if (error) throw error;
      setTasks(data);
      calculateTaskStats(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTaskStats = (tasks) => {
    const now = new Date();
    let pending = 0, completed = 0, overdue = 0;

    tasks.forEach((task) => {
      if (task.is_completed) completed++;
      else if (isAfter(now, new Date(task.due_date))) overdue++;
      else pending++;
    });

    setPendingTasks(pending);
    setCompletedTasks(completed);
    setOverdueTasks(overdue);
  };

  useEffect(() => {
    fetchTasks();
    fetchStreakData();
    updateStreak();
  }, []);

  const taskData = {
    labels: ['Pending', 'Completed', 'Overdue'],
    datasets: [
      {
        data: [pendingTasks, completedTasks, overdueTasks],
      },
    ],
  };

  const pieData = [
    { name: 'Pending', tasks: pendingTasks, color: 'blue', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Completed', tasks: completedTasks, color: '#4CAF50', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Overdue', tasks: overdueTasks, color: 'red', legendFontColor: '#333', legendFontSize: 12 },
  ];

  return (
    <View style={styles.halfContainer}>
      <ScrollView style={styles.container}>
        <View style={styles.dashboard}>
          {loading ? (
            <Text style={styles.loadingText}>Loading tasks...</Text>
          ) : (
            <>
              <Text style={styles.chartTitle}>Task Breakdown (Pie Chart)</Text>
              <PieChart
                data={pieData}
                style={styles.chartStyle}
                width={screenWidth * 0.66}
                height={220}
                chartConfig={chartConfig}
                accessor={'tasks'}
                backgroundColor={'transparent'}
                paddingLeft={'15'}
                absolute
              />
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Pending Tasks:</Text>
                <Text style={styles.statValue}>{pendingTasks}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Completed Tasks:</Text>
                <Text style={styles.statValue}>{completedTasks}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Overdue Tasks:</Text>
                <Text style={styles.statValue}>{overdueTasks}</Text>
              </View>
            </>
          )}
        </View>
        <Button
          label="Get Organized"
          theme="primary"
          onPress={() => {
            messageRef.current.changeMessage('I am a Plant!');
            messageRef.current.changeImageSource("../../assets/images/Plants/plant2_complete.png");
            messageRef.current.show();
          }}
        />
        <PlantMessage ref={messageRef} initialText="Initial Message" />
        <StatusBar style="auto" />
      </ScrollView>

      <View style={styles.streakContainer}>
        <Plant streakAmount={streakCount} />
        <Text style={styles.dashboardTitle}>Streak</Text>
        <Text style={styles.streakText}>{streakCount} Days</Text>
      </View>
    </View>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#fb8c00',
  backgroundGradientTo: '#ffa726',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: { r: '6', strokeWidth: '2', stroke: '#ffa726' },
};

const styles = StyleSheet.create({
  halfContainer: {
    flex: 1,
    backgroundColor: 'cornsilk',
  },
  container: {
    flex: 1,
    paddingVertical: 20,
    backgroundColor: 'cornsilk',
  },
  dashboard: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'darkbrown',
    textAlign: 'center',
  },
  streakContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'red',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  chartStyle: {
    borderRadius: 6,
    marginVertical: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 16,
    color: 'darkbrown',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'darkbrown',
  },
});

