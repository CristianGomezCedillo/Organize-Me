import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { supabase } from '../../components/supabaseClient';
import SignInScreen from '../../components/SignInScreen';

export default function Layout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkUserSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return null; // Optionally, return a loading spinner or screen here
  }

  return user ? (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#F5F5DC',
        tabBarIcon: ({ color, size }) => {
          let iconName;

          // Set icon based on the route name
          if (route.name === 'index') {
            iconName = 'home';
          } else if (route.name === 'TaskList') {
            iconName = 'list';
          } else if (route.name === 'Calendar') {
            iconName = 'calendar';
          } else if (route.name === 'Profile') { 
            iconName = 'person'; 
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
<<<<<<< HEAD
          backgroundColor: '#806043', 
          height: 60,

=======
          backgroundColor: '#2E8B57', // Tab bar background color
          height: 60, // Adjust the height of the tab bar
          backgroundColor: '#806043',
          height: 60, 
>>>>>>> parent of ffcf91b (Added Profile icon/notification/ forget password )
        },
        headerStyle: {
          backgroundColor: '#2E8B57',
        },
        headerTitleStyle: {
<<<<<<< HEAD
          color: 'darkseagreen',
          fontSize: 20,
=======
          color: '#F5F5DC', // Color for the header title
          fontSize: 20, // Font size for the header title
          color: 'darkseagreen', 
          fontSize: 20, 
>>>>>>> parent of ffcf91b (Added Profile icon/notification/ forget password )
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
