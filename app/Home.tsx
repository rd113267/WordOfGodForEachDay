import React, { FunctionComponent, useEffect, useCallback, useState, useRef } from 'react';
import { Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import Video from 'react-native-video';
import moment from 'moment';

const Home: FunctionComponent = () => {
  const [verse, setVerse] = useState('');
  const [chapter, setChapter] = useState('');
  const [versePaused, setVersePaused] = useState(true);
  const [chapterPaused, setChapterPaused] = useState(true);
  const verseRef = useRef<Video>();
  const chapterRef = useRef<Video>();

  const fetchVerse = useCallback(async () => {
    const url = await storage().ref('/verses/1/1.mp3').getDownloadURL();
    setVerse(url);
  }, []);

  const fetchChapter = useCallback(async () => {
    const url = await storage().ref('/chapters/1/1.mp3').getDownloadURL();
    setChapter(url);
  }, []);

  useEffect(() => {
    auth().signInAnonymously();

    PushNotification.configure({
      onRegister: (token) => {
        console.log('TOKEN:', token);
      },
      onNotification: async (notification) => {
        await fetchVerse();
        await fetchChapter();
        setVersePaused(false);
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
    fetchVerse();

    const midday = moment('00:00').format('HH:mm');

    PushNotification.localNotificationSchedule({
      title: 'awal n-rbbi i-wass-ad',
      message: moment().utc().format('DD/MM/YYYY'),
      date: new Date(),
      repeatType: 'minute',
    });
  }, [fetchVerse, fetchChapter]);

  const onBuffer = () => {};

  const onError = () => {};

  return (
    <>
      {!!verse && (
        <Video
          paused={versePaused}
          audioOnly={true}
          source={{ uri: verse }} // Can be a URL or a local file.
          ref={verseRef} // Store reference
          onBuffer={onBuffer} // Callback when remote video is buffering
          onError={onError} // Callback when video cannot be loaded
        />
      )}
      {!!chapter && (
        <Video
          paused={chapterPaused}
          audioOnly={true}
          source={{ uri: chapter }} // Can be a URL or a local file.
          ref={chapterRef} // Store reference
          onBuffer={onBuffer} // Callback when remote video is buffering
          onError={onError} // Callback when video cannot be loaded
        />
      )}
    </>
  );
};

export default Home;
