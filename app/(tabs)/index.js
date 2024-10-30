import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, ScrollView } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { supabase } from '../../components/supabaseClient';
import Button from '../../components/Button';
import ImageViewer from '../../components/ImageViewer';
const AppIconImage = require('../../assets/images/organizeme.png');
import { format, isAfter } from 'date-fns';
import { differenceInDays } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { Platform } from 'react-native';
import PlantMessage from "../../components/PlantMessage";
import Plant from '../../components/Plant';
import { Link } from 'expo-router';


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
  const [lastLoginDate, setLastLoginDate] = useState(null);
  const [user, setUser] = useState(null);

  // Fetch current user session
  const fetchUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error fetching user session:', error);
    } else {
      setUser(session?.user ?? null);
    }
  };

  //useEffect will trigger on load, but will first wait for everything specified in the ending brackets to be loaded
  //First fetch the user, then call FetchTasks to update the pie chart graphic
  useEffect(() => {
    fetchUser(); // Fetch the current user
  }, []);

  useEffect(() => {
    if (user !== null) {
      fetchTasks(); // Fetch tasks after user is set
    }
  }, [user]);

  //Streak
  useEffect(() => {
    const checkStreak = async () => {
      try {
        // Retrieve last login date and streak count from AsyncStorage
        const storedLastLogin = await AsyncStorage.getItem('lastLoginDate');
        const storedStreak = await AsyncStorage.getItem('streakCount');
        
        const today = new Date();
        const formattedToday = today.toDateString(); // Only consider the date, not time

        // Check if there is a stored last login date
        if (storedLastLogin) {
          // Check if the stored last login date is yesterday
          const lastLogin = new Date(storedLastLogin);
          const differenceInDays = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));

          if (differenceInDays === 1) {
            // User logged in on consecutive days, increase streak count
            const newStreak = parseInt(storedStreak) + 1;
            setStreakCount(newStreak);
            ShowPlantMessage(`You’re on a streak! Streak count: ${newStreak}`);
            await AsyncStorage.setItem('streakCount', newStreak.toString());
          } else if (differenceInDays > 1) {
            // User did not log in yesterday, reset streak
            setStreakCount(1);
            ShowPlantMessage('Streak reset. Start again!');
            await AsyncStorage.setItem('streakCount', '1');
          } else {
            // User logged in today again, keep the same streak
            setStreakCount(parseInt(storedStreak));
            //ShowPlantMessage(`You logged in again today! Streak count: ${storedStreak}`);
          }
        } else {
          // First login, initialize the streak count
          setStreakCount(1);
          ShowPlantMessage('Welcome! Start your streak today!');
          await AsyncStorage.setItem('streakCount', '1');
        }

        // Update last login date in AsyncStorage
        await AsyncStorage.setItem('lastLoginDate', formattedToday);
        setLastLoginDate(formattedToday);
      } catch (error) {
        console.error('Error checking streak:', error);
      }
    };

    checkStreak();
  }, []); // Empty dependency array to run only once
  // Fetch tasks and calculate stats
  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('tasks_table')
      .select('*')
      .or(`user_id.eq.${user?.id},user_id.is.null`);

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

  // Graph Data
  const taskData = {
    labels: ['Pending', 'Completed', 'Overdue'],
    datasets: [
      {
        data: [pendingTasks, completedTasks, overdueTasks],
      },
    ],
  };

  const ShowPlantMessage = (text) =>{
    messageRef.current.changeMessage(text);
    messageRef.current.changeImageSource("../../assets/images/Plants/plant2_complete.png")
    messageRef.current.show(); // Show the modal
  }

  const pieData = [
    { name: 'Pending', tasks: pendingTasks, color: 'Blue', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Completed', tasks: completedTasks, color: '#4CAF50', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Overdue', tasks: overdueTasks, color: 'Red', legendFontColor: '#333', legendFontSize: 12 },
  ];

  return (
    <View style={styles.halfContainer}>
    <ScrollView style={styles.container}>
      {/* <ImageViewer placeholderImageSource={AppIconImage} /> */}


         <View style={styles.dashboard}>
        
        {loading ? (
          <Text style={styles.loadingText}>Loading tasks...</Text>
        ) : tasks.length === 0 ? (
          <View style={styles.emptyTasksContainer}>
            <Text style={styles.emptyTasksText}>Welcome to OrganizeMe!</Text>
            <Link href="/TaskList">
            <Button
              label="Get Organized!"
              theme="primary"
              onPress={() => {
                // Add your navigation or task-adding function here
                console.log("Add Task button pressed");
              }}
            />
            </Link>
          </View>
        ) : (
          <>

            {/* Pie Chart */}
            <Text style={styles.chartTitle}>Task Breakdown (Pie Chart)</Text>
            <PieChart
              data={pieData}
              style={styles.chartStyle}
              width={screenWidth * 0.66} // Take up 2/3 of screen width (66%)
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

      <PlantMessage ref={messageRef} initialText="Initial Message" />
      <StatusBar style="auto" />
    </ScrollView>

    <View style={styles.streakContainer}>
          <Plant streakAmount={streakCount}/>
          <Text style={styles.dashboardTitle}>Streak</Text>
          <Text style={styles.streakText}>{streakCount} Days</Text>
          
    </View>
    </View>
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
  halfContainer:{
    flex: 2,
    backgroundColor: 'cornsilk',
    flexDirection: 'row',
  },
  container: {
    flex: 1,
    paddingVertical: 20,
    backgroundColor: 'cornsilk',
  },
  title: {
    color: 'darkbrown',
    fontSize: 50,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyTasksContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyTasksText: {
    fontSize: 18,
    color: 'darkbrown',
    marginBottom: 10,
    textAlign: 'center',
  },
  dashboard: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
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
    color: 'darkbrown',
    marginBottom: 10,
    textAlign: 'center',
  },
  streakContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    paddingHorizontal: 20,
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
    color: 'darkbrown',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'darkbrown',
  },
});
