import React, { FunctionComponent, useEffect, useCallback, useState, useRef } from 'react';
import { Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import Video from 'react-native-video';

const Home: FunctionComponent = () => {
  const [uri, setUri] = useState();
  const videoRef = useRef<Video>();
  useEffect(() => {
    auth().signInAnonymously();

    PushNotification.configure({
      onRegister: (token) => {
        console.log('TOKEN:', token);
      },
      onNotification: (notification) => {
        console.log('NOTIFICATION:', notification);
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      senderID: '622115831035',
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
    playVerse();
  }, []);

  const playVerse = useCallback(async () => {
    const url = await storage().ref('/verses/1/1.mp3').getDownloadURL();
    Alert.alert('test', url);
    setUri(url);
  }, []);

  const playChapter = useCallback(async () => {
    const url = await storage().ref('/chapters/1/1.mp3').getDownloadURL();
    Alert.alert('test', url);
    setUri(url);
  }, []);

  const onBuffer = () => {};

  const onError = () => {};

  return (
    <>
      <Video
        audioOnly={true}
        source={{ uri }} // Can be a URL or a local file.
        ref={videoRef} // Store reference
        onBuffer={onBuffer} // Callback when remote video is buffering
        onError={onError} // Callback when video cannot be loaded
      />
    </>
  );
};

export default Home;
