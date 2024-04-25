import React, { useState, useEffect } from "react";
import { Link, Tabs } from 'expo-router';
import { NativeBaseProvider } from "native-base";
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import * as Device from "expo-device";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { FontAwesome6 } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { ref, onValue } from "firebase/database";
import { db, app } from "../../firebaseConfig";
import { Pressable } from 'react-native';
import { getAuth, onAuthStateChanged, signOut } from '@firebase/auth';
function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialIcons>['name'];
  color: string;
}) {
  return <MaterialIcons size={23} style={{ marginBottom: -0 }} {...props} />;
}
function TabBarIcon2(props: {
  name: React.ComponentProps<typeof FontAwesome6>['name'];
  color: string;
}) {
  return <FontAwesome6 size={20} style={{ marginBottom: -0 }} {...props} />;
}



export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<any | null>(null);
  const auth = getAuth(app);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);
  const handleLogout = async () => {
    try {

      // Redirect the user to the login screen or update the app's state after logout
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  return (

    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pet Health ',
          tabBarIcon: ({ color }) => <TabBarIcon name="health-and-safety" color={color}
          />,
          headerRight: () => (
            <Pressable>
              {({ pressed }) => (
                <MaterialIcons name="logout" size={24} color="black"
                  style={{color:'black', marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  onPress={handleLogout}
                />
              )}
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'QR Form',
          tabBarIcon: ({ color }) => <TabBarIcon2 name="file-waveform" color={color} />,
        }}
      />
    </Tabs>

  );
}
