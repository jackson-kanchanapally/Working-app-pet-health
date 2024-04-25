import React, { useState, useEffect, useRef } from 'react';
import { View, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Box, Divider, Text, Flex, ScrollView, Button } from "native-base";
import { Image } from "react-native";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebaseConfig.js";
import { getAuth } from "firebase/auth";
const myImageHeart = require("../../assets/images/isn.png");
const myImageTemp = require("../../assets/images/temp.png");
const myImagedogGif = require("../../assets/images/dogGif2.gif");
const myImagesickDog = require("../../assets/images/sickDog.png");

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const sendNotification = async (expoPushToken: string, title: string, body: string) => {
  console.log("Sending push notification...");

  // notification message
  const message = {
    to: expoPushToken,
    sound: "default",
    title: title,
    body: body,
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      host: "exp.host",
      accept: "application/json",
      "accept-encoding": "gzip, deflate",
      "content-type": "application/json",
    },
    body: JSON.stringify(message),
  });
  console.log("senttt");
};

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId: "46471a68-a35e-40c2-b5c1-c352b693e2f4",
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

export default function App() {
  const autha = getAuth();
  const useruid = autha.currentUser;
  const [data, setData] = React.useState({
    heartRate: "",
    temperature: "",
    water: ""
  });
  const route = useruid?.displayName

  React.useEffect(() => {
    const sref = ref(db, "users/" + route + "/");
    onValue(sref, (snapshot) => {
      const dat = snapshot.val();
      setData(dat);
    });
  }, [route]);
  React.useEffect(() => {

    if (data && parseInt(data?.heartRate) >= 170 || parseInt(data?.heartRate) <= 55) {
      sendNotification(expoPushToken, "Your pet's heart rate is not normal!!!",
        "Your pet might fall ill!");

    }
    if (data && parseInt(data?.temperature) >= 105) {
      sendNotification(expoPushToken, "Your pet's Temperature is High!!!",
        "Your pet might fall ill!");
    }
    if (data && parseInt(data?.water) === 0) {
      sendNotification(expoPushToken, "Your Pet's drowning!!",
        "Your pet might be drowning!");
    }

  }, [data]);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ''))
      .catch((error: any) => setExpoPushToken(`${error}`));

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <ScrollView >
      <Flex h="100%" mt="50px" alignItems="center" pt="10">
        <Flex direction="row" justifyContent="center">
          <Box
            borderRadius="full"
            shadow={6}
            pt="20px"
            alignItems="center"
            mr="30px"
            h="150px"
            w="150px"
            bg="white"
          >

            <Image source={myImageHeart} style={{ width: 40, height: 40 }} />
            <Box
              pt="5px"
              _text={{
                fontSize: "30px",
                fontWeight: "700",
              }}
            >
              {data && parseInt(data?.heartRate) >= 170 ? Math.floor(parseInt(data?.heartRate) * 0.6) : data && parseInt(data?.heartRate) >= 120 ? Math.floor(parseInt(data?.heartRate) * 0.7) : data && parseInt(data?.heartRate)}

            </Box>
            <Text>bpm</Text>
          </Box>
          <Box
            borderRadius="full"
            shadow={6}
            justifyContent="center"
            alignItems="center"
            // mr="30px"
            h="150px"
            w="150px"
            bg="white"
            _text={{
              fontSize: "30px",
              fontWeight: "700",
            }}
          >
            <Image source={myImageTemp} style={{ width: 60, height: 60 }} />
            <Text
              fontSize="30px"
              fontWeight="700"
              color={data && parseInt(data?.temperature) >= 105 ? "red.600" : "black"}
            >
              {data && data.temperature}°F
            </Text>
          </Box>
        </Flex>
        <Flex direction="row" justifyContent="center" mb="30px" w="90%">
          <Box
            borderRadius="2xl"
            shadow={6}
            justifyContent="center"
            alignItems="center"
            // mr="30px"
            h="150px"
            w="full"
            mt="30px"
            bg="white"
            _text={{
              fontSize: "30px",
              fontWeight: "700",
            }}
          >
            {data && data.water == "1"
              ? "Safe from water"
              : "Might Fell in water"}
          </Box>
        </Flex>
        <Box mt="45px">
          <Image source={data && parseInt(data?.temperature) >= 105 || data && parseInt(data?.heartRate) >= 160 || data && parseInt(data?.heartRate) <= 70 ? myImagesickDog : myImagedogGif} style={{ width: 160, height: 160 }} />
        </Box>
        {/* <Box mt="30px" mb="30px">
      <Button
        bg="gray.100"
        borderRadius="sm"
        size="sm"
        shadow={6}
        _text={{
          color: "black",
          fontSize: "16px",
        }}
      >
        Create QR
      </Button> 
     </Box> */}
        {/* <Flex h="50px" w="90%"
        pl="10px" mt="20px"
        justifyContent="center">
        <Text fontSize="2xl">
          Create a Collar QR for your pet

        </Text>
      </Flex> */}
        {/* <Divider px="2" w="90%" />
      <QRForm />
      <QRCode value="Mobile no: 984654211, address:9-113 jkg kjgjhg , pet name: snoopy" /> */}
      </Flex>
    </ScrollView>

  );
}
