import React, { FunctionComponent, useEffect, useCallback, useState, useRef } from 'react';
import { Linking, View, SafeAreaView } from 'react-native';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import crashlytics from '@react-native-firebase/crashlytics';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import Video, { LoadError } from 'react-native-video';
import moment from 'moment';
import strings from './strings';
import AsyncStorage from '@react-native-community/async-storage';
import { Button, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TouchableOpacity } from 'react-native-gesture-handler';

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
    try {
      const url = await storage().ref(`/verses/1/${date}.mp3`).getDownloadURL();
      setVerseUrl(url);
    } catch (e) {
      crashlytics().recordError(e);
    }
  }, [date]);

  const fetchChapter = useCallback(async () => {
    try {
      const url = await storage().ref(`/chapters/1/${date}.mp3`).getDownloadURL();
      setChapterUrl(url);
    } catch (e) {
      crashlytics().recordError(e);
    }
  }, [date]);

  useEffect(() => {
    const setup = async () => {
      try {
        const storageKey = 'scheduledNotification';
        const notification = await AsyncStorage.getItem(storageKey);
        if (!notification) {
          const dateString = new Date().toString();
          await AsyncStorage.setItem(storageKey, dateString);
          PushNotification.localNotificationSchedule({
            //title: 'awal n-rbbi i-wass-ad',
            message: 'awal n-rbbi i-wass-ad',
            //message: moment().utc().format('DD/MM/YYYY') + ' ' + moment().unix().toString(),
            date: new Date(Date.now() + 30 * 1000),
            repeatType: 'minute',
          });
        }
      } catch (e) {
        console.log(e);
        crashlytics().recordError(e);
      }
    };
    try {
      auth().signInAnonymously();
    } catch (e) {
      crashlytics().recordError(e);
    }
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
    fetchChapter();
    setup();
    // const midday = moment('00:00').format('HH:mm');
  }, [fetchVerse, fetchChapter]);

  const onBuffer = () => {};

  const onError = (e: LoadError) => {
    crashlytics().recordError(new Error(e.error.errorString));
  };

  return (
    <>
      {!!verseUrl && (
        <Video
          paused={versePaused}
          audioOnly
          source={{ uri: verseUrl }} // Can be a URL or a local file.
          ref={verseRef} // Store reference
          onBuffer={onBuffer} // Callback when remote video is buffering
          onError={onError} // Callback when video cannot be loaded
          onEnd={() => {
            verseRef.current.seek(0);
          }}
          onSeek={() => setVersePaused(true)}
          playInBackground
          playWhenInactive
        />
      )}
      {!!chapterUrl && (
        <Video
          paused={chapterPaused}
          audioOnly
          source={{ uri: chapterUrl }} // Can be a URL or a local file.
          ref={chapterRef} // Store reference
          onBuffer={onBuffer} // Callback when remote video is buffering
          onError={onError} // Callback when video cannot be loaded
          playInBackground
          playWhenInactive
        />
      )}
      <SafeAreaView style={{ flex: 1 }}>
        <Text style={{ margin: 10 }}>
          ass f-wass rad-ak-ntazn iwaliwn mimnin gh-warratn n-sidi rbbi. sfeld-asn, tfraht srsn, tamnt gisn, ar-ttdust
          s-tayri-ns izgan ula s-rrja ishan
        </Text>
        <Text style={{ margin: 10 }}>{verse}</Text>
        <TouchableOpacity onPress={() => setVersePaused(!versePaused)}>
          <Icon name={versePaused ? 'play' : 'pause'} size={30} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
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
            onPress={() => setChapterPaused(false)}
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
