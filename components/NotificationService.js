// NotificationService.js
import PushNotification from 'react-native-push-notification';

const configureNotificationChannel = () => {
  PushNotification.createChannel(
    {
      channelId: "task-reminders", // (required) channel id
      channelName: "Task Reminders", // (required) channel name
      channelDescription: "A channel for task reminder notifications", // (optional) channel description
      playSound: true, // (optional) default: true
      sound: "default", // (optional) See `sound` for more info
      importance: PushNotification.Importance.HIGH, // (optional) default: Importance.HIGH. Int value
      vibrate: true, // (optional) default: true. Creates a vibration effect
    },
    (created) => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed
  );
};

export default configureNotificationChannel;
