import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { supabase } from '../../components/supabaseClient';
import SignInScreen from './SignInScreen';

export default function Layout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // New loading state

  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false); // Stop loading after checking the session
    };

    checkUserSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false); // Stop loading when the auth state changes
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return null; // Optionally, you can return a loading spinner or screen here
  }

  return user ? (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#ADD8E6',
        tabBarInactiveTintColor: 'yellow',
        tabBarIcon: ({ color, size }) => {
          let iconName;

          // Set icon based on the route name
          if (route.name === 'index') {
            iconName = 'home';
          } else if (route.name === 'Calendar') {
            iconName = 'calendar';
          } else if (route.name === 'TaskList') {
            iconName = 'list';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: '#228B22', // Tab bar background color
          height: 60, // Adjust the height of the tab bar
        },
        headerStyle: {
          backgroundColor: '#228B22', // Header background color
        },
        headerTitleStyle: {
          color: 'yellow', // Color for the header title
          fontSize: 20, // Font size for the header title
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Dashboard',
          headerTitle: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="TaskList"
        options={{
          tabBarLabel: 'All Tasks',
          headerTitle: 'All Tasks',
        }}
      />
      <Tabs.Screen
        name="Calendar"
        options={{
          tabBarLabel: 'Calendar',
          headerTitle: 'Calendar',
        }}
      />
    </Tabs>
  ) : (
    <SignInScreen />
  );
}
