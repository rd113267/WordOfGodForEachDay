import React, { FunctionComponent, useEffect, useCallback, useState, useRef } from 'react';
import { Alert, Linking, View, SafeAreaView } from 'react-native';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import Video from 'react-native-video';
import moment from 'moment';
import strings from './strings';
import AsyncStorage from '@react-native-community/async-storage';
import { Button } from 'react-native-paper';

const Home: FunctionComponent = () => {
  const [verseUrl, setVerseUrl] = useState('');
  const [chapterUrl, setChapterUrl] = useState('');
  const [versePaused, setVersePaused] = useState(true);
  const [chapterPaused, setChapterPaused] = useState(true);
  const verseRef = useRef<Video>();
  const chapterRef = useRef<Video>();
  const date = moment().date();
  const month = moment().month() + 1;
  const verse = strings[1][date];

  const fetchVerse = useCallback(async () => {
    const url = await storage().ref(`/verses/1/${date}.mp3`).getDownloadURL();
    setVerseUrl(url);
  }, [date]);

  const fetchChapter = useCallback(async () => {
    const url = await storage().ref(`/chapters/1/${date}.mp3`).getDownloadURL();
    setChapterUrl(url);
  }, [date]);

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

    // const midday = moment('00:00').format('HH:mm');

    // PushNotification.localNotificationSchedule({
    //   title: 'awal n-rbbi i-wass-ad',
    //   message: moment().utc().format('DD/MM/YYYY'),
    //   date: new Date(),
    //   repeatType: 'minute',
    // });
  }, [fetchVerse, fetchChapter]);

  const onBuffer = () => {};

  const onError = () => {};

  return (
    <>
      {!!verseUrl && (
        <Video
          paused={versePaused}
          audioOnly={true}
          source={{ uri: verseUrl }} // Can be a URL or a local file.
          ref={verseRef} // Store reference
          onBuffer={onBuffer} // Callback when remote video is buffering
          onError={onError} // Callback when video cannot be loaded
        />
      )}
      {!!chapterUrl && (
        <Video
          paused={chapterPaused}
          audioOnly={true}
          source={{ uri: chapterUrl }} // Can be a URL or a local file.
          ref={chapterRef} // Store reference
          onBuffer={onBuffer} // Callback when remote video is buffering
          onError={onError} // Callback when video cannot be loaded
        />
      )}
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
          {/* listen again to this verse */}
          <Button
            mode="contained"
            icon="repeat"
            uppercase={false}
            style={{ margin: 10 }}
            onPress={() => Linking.openURL('http://www.tachelhit.info')}
          >
            sfeld dagh i-tguri-ad
          </Button>
          {/* listen to the whole chapter */}
          <Button
            mode="contained"
            icon="menu"
            uppercase={false}
            style={{ margin: 10 }}
            onPress={() => Linking.openURL('http://www.tachelhit.info')}
          >
            sfeld i-ugzzum-ad kullut
          </Button>
          {/* listen to all the Bible */}
          <Button
            mode="contained"
            icon="book"
            uppercase={false}
            style={{ margin: 10 }}
            onPress={() => Linking.openURL('http://www.tachelhit.info')}
          >
            sfeld i-warratn yadni n-sidi rbbi
          </Button>
          {/* enter our website: www.tachelhit.info */}
          <Button
            mode="contained"
            icon="web"
            uppercase={false}
            style={{ margin: 10 }}
            onPress={() => Linking.openURL('http://www.tachelhit.info')}
          >
            kchem s-dar takat n-tgemmi-negh
          </Button>
        </View>
      </SafeAreaView>
    </>
  );
};

export default Home;
