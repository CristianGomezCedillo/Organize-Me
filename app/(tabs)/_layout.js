import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';


export default function Layout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'limegreen',
        tabBarIcon: ({ color, size }) => {
          let iconName;

          // Set icon based on the route name
          if (route.name === 'index') {
            iconName = 'home';
          } else if (route.name === 'Calendar') {
            iconName = 'calendar';
          } else if (route.name === 'TaskList') {
            iconName = 'list';
          } else if (route.name === 'TaskList2') { // New TaskList2 Icon
            iconName = 'checkbox-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: '#806043', // Tab bar background color
          height: 60, // Adjust the height of the tab bar
        },
        headerStyle: {
          backgroundColor: '#806043', // Header background color
        },
        headerTitleStyle: {
          color: 'darkseagreen', // Color for the header title
          fontSize: 20, // Font size for the header title
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Dashboard',
          headerTitle: 'Dashboard', // Set title to display on the header
        }}
      />
      <Tabs.Screen
        name="TaskList"
        options={{
          tabBarLabel: 'All Tasks',
          headerTitle: 'All Tasks', // Set title to display on the header
        }}
      />
      <Tabs.Screen
        name="TaskList2"
        options={{
          tabBarLabel: 'Task List 2',
          headerTitle: 'Task List 2', // Set title to display on the header
        }}
      />
      <Tabs.Screen
        name="Calendar"
        options={{
          tabBarLabel: 'Calendar',
          headerTitle: 'Calendar', // Set title to display on the header
        }}
      />
    </Tabs>
  );
}
