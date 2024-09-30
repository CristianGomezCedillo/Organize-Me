// app/_layout.js
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: 'yellow',
        tabBarInactiveTintColor: 'darkseagreen',
        tabBarIcon: ({ color, size }) => {
          let iconName;

          // Set icon based on the route name
          if (route.name === 'index') {
            iconName = 'home';
          } else if (route.name === 'Calendar') {
            iconName = 'calendar';
          } else if (route.name === 'TaskList'){
            iconName = 'list'
          } else if(route.name === 'UpcomingTasks'){
            iconName = 'list'
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: 'darkslategray', // Set your desired background color here
          height: 60, // Optional: adjust the height of the tab bar
        },
        headerStyle: {
          backgroundColor: 'darkslategray', // Header background color
        },
        headerTitleStyle: {
          color: 'darkseagreen', // Color for the header title
          fontSize: 20, // Font size for the header title
        },
      })}
    >
      <Tabs.Screen 
        name="index" 
        options={{ tabBarLabel: 'Dashboard' }} 
      />
      <Tabs.Screen 
        name="TaskList" 
        options={{ tabBarLabel: 'All Tasks' }} 
      />
      <Tabs.Screen 
        name="UpcomingTasks" 
        options={{ tabBarLabel: "Today's Tasks" }} 
      />
      <Tabs.Screen 
        name="Calendar" 
        options={{ tabBarLabel: 'Calendar' }} 
      />
    </Tabs>
  );
}
