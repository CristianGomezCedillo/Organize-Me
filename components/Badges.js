import { StyleSheet, View, ActivityIndicator, Text, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';

export default function Badges({ date, tasks }) {
    const [badges, setBadges] = useState([]); // State for badges
    const [isLoading, setIsLoading] = useState(true); // State to track loading
    

    useEffect(() => {
        // Fetch badges when the component mounts
        handleLogin(date); // Pass the specific date to handleLogin
        fetchBadges();
    }, [date]); // Use date as a dependency to rerun the effect when the date changes


    const badgesAvailable = [
        { id: 0, name: 'Daily Doer', description: "Complete all of today's tasks in the Calendar" },
        { id: 1, name: 'Weekly Warrior', description: 'Complete all tasks due this week' },
        { id: 2, name: "Can't Catch Me Slippin", description: 'No overdue tasks this week' },
        { id: 3, name: 'Dedicated Gardener', description: '7-day task completion streak' },
        { id: 4, name: 'Baby Plant', description: 'Hooray, you completed one task this week!' },
    ];

    const debugClearData = async () => {
        try {
          // Remove only the 'Badges' and 'LastLoginDate' keys from AsyncStorage
          await AsyncStorage.multiRemove(['Badges', 'LastLoginDate']);
          console.log('Badges and LastLoginDate have been cleared.');
        } catch (error) {
          console.error('Error clearing Badges and LastLoginDate:', error);
        }
    };

    const fetchBadges = async () => {
        try {
          const storedBadges = await AsyncStorage.getItem('Badges');
          if (storedBadges) {
            setBadges(JSON.parse(storedBadges)); // Parse and set badges
          } else {
            setBadges([]); // No badges yet
          }
        } catch (error) {
          console.error('Error fetching badges:', error);
          setBadges([]); // Handle error by setting an empty badge list
        } finally {
          setIsLoading(false); // Mark loading as complete
        }
    };

    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay(); // 0 (Sunday) to 6 (Saturday)
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
        const startOfWeek = new Date(d.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0); // Reset to midnight
        return startOfWeek.toISOString().split('T')[0];
    };
    
    const getEndOfWeek = (date) => {
        const startOfWeek = new Date(getStartOfWeek(date));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999); // End of the day
        return endOfWeek.toISOString().split('T')[0];
    };

    const handleLogin = async (date) => {

        //debug
        //await debugClearData();

        const lastLogin = await AsyncStorage.getItem('LastLoginDate');
    
        if (lastLogin) {
            const startOfLastWeek = getStartOfWeek(new Date(lastLogin) - 7 * 24 * 60 * 60 * 1000);
            const endOfLastWeek = getEndOfWeek(new Date(lastLogin) - 7 * 24 * 60 * 60 * 1000);
        
            const isNewWeek = getStartOfWeek(date) !== getStartOfWeek(lastLogin);
            const isNewDay = date !== lastLogin;

            if (isNewWeek) {
                console.log('First login of the week! Calculating last week’s badges...');
                await clearBadges(); // Clear the list of badges at the end of each week and go again
                calculateBadgesForWeek(tasks, startOfLastWeek, endOfLastWeek); // Pass tasks here if needed
            }

                //I'm lenient, you can complete daily badges even if the day isn't over
            calculateBadgesForDay(tasks, date); // Pass tasks here if needed

        } else {
            console.log('Welcome! Setting LastLoginDate for the first time.');
        }
    
        // Update LastLoginDate
        await AsyncStorage.setItem('LastLoginDate', date);
    };

    const calculateBadgesForWeek = (tasks, startOfLastWeek, endOfLastWeek) => {
        console.log('Calculating last weeks badges for new week');
        const weeklyTasks = tasks.filter(task => {
          const taskDate = new Date(task.due_date.split('T')[0]);
          const startDate = new Date(startOfLastWeek);
          const endDate = new Date(endOfLastWeek);
      
          return taskDate >= startDate && taskDate <= endDate;
        });
      
        const allTasksComplete = weeklyTasks.every(task => task.is_completed === 1);
      
        if (allTasksComplete) {
          console.log('Awarding Weekly Doer badge!');
          awardBadge(1); // Adjust to the correct badge ID
        } else {
          console.log('Weekly Doer badge not earned this week.');
        }
    };

    const calculateBadgesForDay = async (tasks, date) => {
        // Clear the two daily badges (if needed, this can be based on badge IDs)
        const updatedBadges = badges.filter(badge => badge !== 2 && badge !== 3); // Remove the daily badges (e.g., 2, 3) if already in the list
        console.log("Tasks received for the day:", tasks);
        // Check if there's at least one completed task for the day
   
        const completedTask = tasks.some(task => task.is_completed === 1);
        if (completedTask) {
            console.log('Awarding badge for completing at least one task today!');
            updatedBadges.push(4); // Add badge ID 3 (Baby Plant) for completing at least one task
        }
    
        try {
            // Fetch streakCount from AsyncStorage
            const streakCount = await AsyncStorage.getItem('streakCount');
            
            if (streakCount && parseInt(streakCount) >= 7) {
                console.log('Awarding "Dedicated Gardener" badge for completing tasks for 7 consecutive days!');
                updatedBadges.push(3); // Add badge ID 2 (Dedicated Gardener) for 7-day streak
            }
        } catch (error) {
            console.error('Error fetching streakCount from AsyncStorage:', error);
        }
    
        // Update badges state directly (without AsyncStorage)
        setBadges(updatedBadges); // Set the updated badges list to state
    };
    

    const awardBadge = async (badgeId) => {
        const badges = (await AsyncStorage.getItem('Badges')) || '[]';
        const badgesList = JSON.parse(badges);
        if (!badgesList.includes(badgeId)) {
            badgesList.push(badgeId);
            await AsyncStorage.setItem('Badges', JSON.stringify(badgesList));
            console.log(`${badgesAvailable[badgeId].name} badge awarded!`);
        } else {
            console.log(`${badgesAvailable[badgeId].name} badge already earned.`);
        }
    };

    const clearBadges = async () => {
        try {
          let badges = JSON.parse(await AsyncStorage.getItem('userBadges')) || [];
          // Filter out the badges with the specified badge IDs
          await AsyncStorage.setItem('userBadges', JSON.stringify(badges));
          console.log(`Cleared badges`);
        } catch (error) {
          console.error('Error clearing badges from AsyncStorage:', error);
        }
        fetchBadges();
    };

    const BadgeList = ({ badges }) => {
        // Filter badgesAvailable to include only those matching the IDs in the badges array
        console.log(`Cleared badges with IDs: ${badges.join(', ')}`);
        const earnedBadges = badgesAvailable.filter((badge) => badges.includes(badge.id));
    
        return (
            <View style={styles.container}>
                <Text style={styles.header}>Your Badges</Text>
                <FlatList
                    data={earnedBadges} // Pass the earned badges to FlatList
                    keyExtractor={(item) => item.id.toString()} // Use badge ID as the key
                    renderItem={({ item }) => (
                        <View style={styles.badgeContainer}>
                            <Text style={styles.badgeName}>{item.name}</Text>
                            <Text style={styles.badgeDescription}>{item.description}</Text>
                        </View>
                    )}
                />
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text>Loading badges...</Text>
            </View>
        );
    }

    if (badges.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>No badges earned yet!</Text>
            </View>
        );
    }

    return (
        <View>
            <BadgeList badges={badges} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold' },
    badgeContainer: { marginVertical: 10 },
    badgeName: { fontSize: 18 },
    badgeDescription: { fontSize: 14, color: 'gray' },
});
