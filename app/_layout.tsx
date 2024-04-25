import { Formik } from 'formik';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { app, dbs } from "../firebaseConfig.js";
import { useColorScheme } from '@/components/useColorScheme';
import { NativeBaseProvider } from "native-base";
import { doc, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from '@firebase/auth';
import * as Yup from 'yup';
import { Image } from "react-native";
const myWallpaper = require("../assets/images/wall.jpg");
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

interface AuthScreenProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  isLogin: boolean;
  loading: boolean;
  errorMsg:string;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
  handleAuthentication: (values: { email: string; password: string }) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({
  email,
  password,
  isLogin,
  loading,
  setIsLogin,
  errorMsg,
  handleAuthentication,
}) => {
  const colorScheme = useColorScheme();

  let validationSchema;
  if (!isLogin) {
    validationSchema = Yup.object().shape({
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string().required('Password is required'),
      deviceId: Yup.string().required('Device ID is required'),
    });
  } else {
    validationSchema = Yup.object().shape({
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string().required('Password is required'),
    });
  }
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Image source={myWallpaper} style={styles.wall} />
      <View style={styles.box}>
        <Text style={styles.brand}>Pet Health Guardian </Text>
        <View style={styles.authContainer}>
          <Text style={styles.title}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>

          <Formik
            initialValues={{ email: '', password: '', deviceId: '' }}
            validationSchema={validationSchema}
            onSubmit={handleAuthentication}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
              <>
                <TextInput
                  style={styles.input}
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  placeholder="Email"
                  autoCapitalize="none"
                />
                {errors.email && <Text style={styles.textError}>{errors.email}</Text>}
                {
                  !isLogin ?
                    <>
                      <TextInput
                        style={styles.input}
                        value={values.deviceId}
                        onChangeText={handleChange('deviceId')}
                        onBlur={handleBlur('deviceId')}
                        placeholder="Device Id"
                        autoCapitalize="none"
                      />
                      {errors.deviceId && <Text style={styles.textError}>{errors.deviceId}</Text>}
                    </>
                    : ""
                }
                <TextInput
                  style={styles.input}
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  placeholder="Password"
                  secureTextEntry
                />
                {errors.password && <Text style={styles.textError}>{errors.password}</Text>}

                <View style={styles.buttonContainer}>
                  <Button title={isLogin ? 'Sign In' : 'Sign Up'}   onPress={handleSubmit} isLoading={loading?'true':'false'} color="orange" />
                </View>

                <View style={styles.bottomContainer}>
                  <Text style={styles.toggleText} onPress={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
                  </Text>
                  {errorMsg ? <Text style={styles.textError}>{errorMsg}</Text> : null}
                </View>
              </>
            )}
          </Formik>
        </View>
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [user, setUser] = useState<any | null>(null); // Change 'User' to match the actual user object
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false); 
  const [errorMsg,setErrorMsg]=useState<string>("");
  const auth = getAuth(app);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleAuthentication = async (values: any, { resetForm }: any) => {
    try {
      setLoading(true);
      if (user) {
        // If user is already authenticated, log out
        console.log('User logged out successfully!');
        await signOut(auth);
      } else {
        // Sign in or sign up
        if (isLogin) {
          // Sign in
          await signInWithEmailAndPassword(auth, values.email, values.password);
          console.log('User signed in successfully!');
        } else {
          // Sign up
          let { user } = await createUserWithEmailAndPassword(auth, values.email, values.password);
      
          await updateProfile(user, {
            displayName: values.deviceId
          });
          await setDoc(doc(dbs, "users", user.uid), {
            deviceId: values.deviceId,
          });
          console.log('User created successfully!');
        }
      }
      resetForm();
    } catch (error: any) {
      console.error('Authentication error:', error.message);
      setErrorMsg(error.message);
    }
  };

  return (
    <NativeBaseProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {user ? (
          // Show user's email if user is authenticated
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        ) : (
          // Show sign-in or sign-up form if user is not authenticated
          <AuthScreen
            handleAuthentication={handleAuthentication}
            isLogin={isLogin}
            loading={loading} 
            setIsLogin={setIsLogin}
          />
        )}
      </ThemeProvider>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '100%',
    maxWidth: 400,

    padding: 16,
    borderRadius: 8,
    elevation: 3,
    flex: 1,
    justifyContent: 'center'
  },
  wall: {
    position: "absolute",
    width: "100%",
    height: "100%",
    left: 0,
    top: 0,
    zIndex: -1

  },
  authContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 16,
    height: 310,
    borderRadius: 8,
    elevation: 35,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  brand: {
    fontSize: 24,
    marginBottom: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    marginBottom: 0,
  },
  toggleText: {
    color: '#3498db',
    textAlign: 'center',
  },
  bottomContainer: {
    marginTop: 20,
  },
  emailText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  textError: {
    color: '#fc6d47',
    marginTop: 2,
  },
});