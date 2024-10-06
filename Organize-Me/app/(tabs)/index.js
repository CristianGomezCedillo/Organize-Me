import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { supabase } from '../../components/supabaseClient';
import Button from '../../components/Button';
import ImageViewer from '../../components/ImageViewer';
const AppIconImage = require('../../assets/images/organizeme.png');
import { format, isAfter } from 'date-fns';
import { differenceInDays } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

// Screen dimensions for graph scaling
const screenWidth = Dimensions.get('window').width;

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState(0);
    const [streakCount, setStreakCount] = useState(0);
  const [lastOpenedDate, setLastOpenedDate] = useState(null);
   const fetchStreakData = async () => {
    const storedDate = await AsyncStorage.getItem('lastOpenedDate');
    const storedStreak = await AsyncStorage.getItem('streakCount');

    if (storedDate) {
      setLastOpenedDate(new Date(storedDate));
    }

    if (storedStreak) {
      setStreakCount(parseInt(storedStreak, 10));
    }
  };
  const updateStreak = async () => {
    const currentDate = new Date();

    if (lastOpenedDate) {
      const daysDifference = differenceInDays(currentDate, lastOpenedDate);

      if (daysDifference === 1) {
        setStreakCount((prev) => prev + 1);
        await AsyncStorage.setItem('streakCount', (streakCount + 1).toString());
      } else if (daysDifference > 2) {
        setStreakCount(0);
        await AsyncStorage.setItem('streakCount', '0');
      }
    }

    await AsyncStorage.setItem('lastOpenedDate', currentDate.toISOString());
  };
  // Fetch tasks and calculate stats
  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('tasks_table').select('*');

    if (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
      return;
    }

    setTasks(data);
    calculateTaskStats(data);
    setLoading(false);
  };

  // Calculate task stats
  const calculateTaskStats = (tasks) => {
    const now = new Date();
    let pending = 0;
    let completed = 0;
    let overdue = 0;

    tasks.forEach((task) => {
      if (task.is_completed) {
        completed += 1;
      } else if (isAfter(now, new Date(task.due_date))) {
        overdue += 1;
      } else {
        pending += 1;
      }
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

  // Graph Data
  const taskData = {
    labels: ['Pending', 'Completed', 'Overdue'],
    datasets: [
      {
        data: [pendingTasks, completedTasks, overdueTasks],
      },
    ],
  };

  const pieData = [
    { name: 'Pending', tasks: pendingTasks, color: '#F76C5E', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Completed', tasks: completedTasks, color: '#4CAF50', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Overdue', tasks: overdueTasks, color: '#FFCC00', legendFontColor: '#333', legendFontSize: 12 },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* <ImageViewer placeholderImageSource={AppIconImage} /> */}

      <Text style={styles.title}>ORGANIZE ME</Text>

         <View style={styles.dashboard}>
        <Text style={styles.dashboardTitle}>Streak Overview</Text>
        <View style={styles.streakContainer}>
          <FontAwesome name="fire" size={40} color="#FF6347" />
          <Text style={styles.streakText}>{streakCount} Day Streak</Text>
        </View>
        {loading ? (
          <Text style={styles.loadingText}>Loading tasks...</Text>
        ) : (
          <>
            {/* Bar Chart */}
            <Text style={styles.chartTitle}>Task Summary (Bar Chart)</Text>
            <BarChart
              data={taskData}
              width={screenWidth - 80} // Adjust to fit your screen width
              height={220}
              chartConfig={chartConfig}
              fromZero
              style={styles.chartStyle}
              yAxisLabel=""
              yAxisSuffix=" tasks"
            />

            {/* Pie Chart */}
            <Text style={styles.chartTitle}>Task Breakdown (Pie Chart)</Text>
            <PieChart
              data={pieData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor={'tasks'}
              backgroundColor={'transparent'}
              paddingLeft={'15'}
              absolute
            />

            {/* Task Stats */}
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

      <Button label="Get Organized" theme="primary" />
      <StatusBar style="auto" />
    </ScrollView>
  );
}

const chartConfig = {
  backgroundColor: '#e26a00',
  backgroundGradientFrom: '#fb8c00',
  backgroundGradientTo: '#ffa726',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#ffa726',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    backgroundColor: 'cornsilk',
  },
  title: {
    color: 'darkseagreen',
    fontSize: 50,
    textAlign: 'center',
    marginBottom: 20,
  },
  dashboard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'darkseagreen',
    marginBottom: 10,
    textAlign: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  chartStyle: {
    borderRadius: 16,
    marginVertical: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 16,
    color: '#333',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
