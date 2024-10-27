// App.js
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useNotifications } from '../../components/ScheduledNotification'; // Import the hook we created earlier

export default function NotificationExample() {
  const {
    scheduleNotification,
    cancelAllNotifications,
    getAllScheduledNotifications
  } = useNotifications();

  // Schedule a notification in 5 seconds
  const scheduleInstantNotification = async () => {
    const id = await scheduleNotification({
      title: "Test Notification",
      body: "This will appear in 5 seconds!",
      data: { screen: 'Home' },
      trigger: { seconds: 5 }
    });
    console.log('Scheduled notification:', id);
  };

  // Schedule a notification for specific time
  const scheduleTimeNotification = async () => {
    // Schedule for tomorrow at 10 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const id = await scheduleNotification({
      title: "Scheduled Reminder",
      body: "This is your scheduled notification!",
      trigger: { date: tomorrow }
    });
    console.log('Scheduled time notification:', id);
  };

  // Schedule a daily recurring notification
  const scheduleRecurringNotification = async () => {
    const id = await scheduleNotification({
      title: "Daily Reminder",
      body: "This is your daily notification!",
      trigger: {
        hour: 9, // 9 AM
        minute: 0,
        repeats: true
      }
    });
    console.log('Scheduled recurring notification:', id);
  };

  // View all scheduled notifications
  const checkScheduledNotifications = async () => {
    const notifications = await getAllScheduledNotifications();
    console.log('All scheduled notifications:', notifications);
  };

  return (
    <View style={styles.container}>
      <Button 
        title="Send Test Notification (5s)"
        onPress={scheduleInstantNotification}
      />
      
      <View style={styles.spacer} />
      
      <Button 
        title="Schedule for Tomorrow 10 AM"
        onPress={scheduleTimeNotification}
      />
      
      <View style={styles.spacer} />
      
      <Button 
        title="Set Daily Reminder (9 AM)"
        onPress={scheduleRecurringNotification}
      />
      
      <View style={styles.spacer} />
      
      <Button 
        title="Check Scheduled Notifications"
        onPress={checkScheduledNotifications}
      />
      
      <View style={styles.spacer} />
      
      <Button 
        title="Cancel All Notifications"
        onPress={cancelAllNotifications}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  spacer: {
    height: 20,
  },
});