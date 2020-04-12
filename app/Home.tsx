import React, { FunctionComponent, useEffect, useCallback, useState, useRef } from 'react';
import { Linking, View, SafeAreaView, Alert, ImageBackground } from 'react-native';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import crashlytics from '@react-native-firebase/crashlytics';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import Video, { LoadError } from 'react-native-video';
import moment from 'moment';
import strings from './strings';
import AsyncStorage from '@react-native-community/async-storage';
import { Button, Text, Modal, Card, FAB } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SplashScreen from 'react-native-splash-screen';
import styles from './styles';

const Home: FunctionComponent = () => {
  const [verseUrl, setVerseUrl] = useState('');
  const [chapterUrl, setChapterUrl] = useState('');
  const [versePaused, setVersePaused] = useState(true);
  const [chapterPaused, setChapterPaused] = useState(true);
  const [verseLoading, setVerseLoading] = useState(false);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(true);
  const [showButtons, setShowButtons] = useState(false);
  const [playingChapter, setPlayingChapter] = useState(false);
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
          const notifDate = new Date();
          notifDate.setHours(13, 0, 0, 0);
          PushNotification.localNotificationSchedule({
            message: 'awal n-rbbi i-wass-ad',
            date: notifDate,
            repeatType: 'day',
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
    SplashScreen.hide();
    // const midday = moment('00:00').format('HH:mm');
  }, [fetchVerse, fetchChapter]);

  const onVerseBuffer = ({ isBuffering }) => {
    setVerseLoading(isBuffering);
  };

  const onVerseLoadStart = () => {
    setVerseLoading(true);
  };

  const onVerseLoad = () => {
    setVerseLoading(false);
  };

  const onChapterBuffer = ({ isBuffering }) => {
    setChapterLoading(isBuffering);
  };

  const onChapterLoadStart = () => {
    setChapterLoading(true);
  };

  const onChapterLoad = () => {
    setChapterLoading(false);
  };

  const onError = (e: LoadError) => {
    crashlytics().recordError(new Error(e.error.errorString));
    Alert.alert('Error', e.error.errorString);
  };

  return (
    <>
      {!!verseUrl && (
        <Video
          paused={versePaused}
          audioOnly
          source={{ uri: verseUrl, cache: true }} // Can be a URL or a local file.
          ref={verseRef} // Store reference
          onBuffer={onVerseBuffer} // Callback when remote video is buffering
          onLoad={onVerseLoad}
          onLoadStart={onVerseLoadStart}
          onError={onError} // Callback when video cannot be loaded
          onEnd={() => {
            verseRef.current.seek(0);
            setTimeout(() => {
              setVersePaused(true);
            }, 100);
          }}
          playInBackground
          playWhenInactive
          ignoreSilentSwitch="ignore"
        />
      )}
      {!!chapterUrl && (
        <Video
          paused={chapterPaused}
          audioOnly
          source={{ uri: chapterUrl, cache: true }} // Can be a URL or a local file.
          ref={chapterRef} // Store reference
          onBuffer={onChapterBuffer} // Callback when remote video is buffering
          onLoad={onChapterLoad}
          onLoadStart={onChapterLoadStart}
          onError={onError} // Callback when video cannot be loaded
          onEnd={() => {
            chapterRef.current.seek(0);
            setTimeout(() => {
              setVersePaused(true);
            }, 100);
          }}
          playInBackground
          playWhenInactive
          ignoreSilentSwitch="ignore"
        />
      )}
      <ImageBackground style={styles.imgBackground} resizeMode="cover" source={require('./cross.jpg')}>
        <SafeAreaView style={{ flex: 1 }}>
          <Card style={{ margin: 20 }}>
            <Card.Title title="awal n-rbbi i-kraygatt ass" subtitle={verse} subtitleStyle={{ fontSize: 20 }} titleStyle={{ fontSize: 20}}/>
          </Card>

          <FAB
            style={styles.fab}
            icon={versePaused && chapterPaused ? 'play' : 'pause'}
            loading={verseLoading || chapterLoading}
            onPress={() => (playingChapter ? setChapterPaused(!chapterPaused) : setVersePaused(!versePaused))}
          />
        </SafeAreaView>
      </ImageBackground>
      <Modal
        contentContainerStyle={styles.modal}
        visible={modalVisible}
        onDismiss={() => {
          setModalVisible(false);
          setVersePaused(false);
        }}
      >
        <Text style={{ fontSize: 25, lineHeight: 40, marginBottom: 20 }}>
          {/* a-tsflidt i-yan-wawal imimn gh-warratn n-sidi rbbi kraygatt ass */}
          ass f-wass rad-ak-ntazn iwaliwn mimnin gh-warratn n-sidi rbbi. sfeld-asn, tfraht srsn, tamnt gisn, ar-ttdust
          s-tayri-ns izgan ula s-rrja ishan.
        </Text>
        <Button
          mode="contained"
          onPress={() => {
            setModalVisible(false);
            setVersePaused(false);
          }}
        >
          <Icon name="keyboard-return" size={30} />
        </Button>
      </Modal>
      <Modal
        visible={versePaused && chapterPaused && !modalVisible}
        contentContainerStyle={styles.buttonModal}
        dismissable={false}
      >
        {/* listen again to this verse */}
        <Button
          mode="contained"
          icon="repeat"
          uppercase={false}
          style={{ margin: 10 }}
          onPress={() => {
            verseRef.current.seek(0);
            setVersePaused(false);
            setPlayingChapter(false);
          }}
        >
          sfeld dagh i-tguri-ad
        </Button>
        {/* listen to the whole chapter */}
        <Button
          mode="contained"
          icon="menu"
          uppercase={false}
          style={{ margin: 10 }}
          onPress={() => {
            chapterRef.current.seek(0);
            setChapterPaused(false);
            setPlayingChapter(true);
          }}
        >
          sfeld i-ugzzum-ad kullut
        </Button>
        {/* listen to all the Bible */}
        <Button
          mode="contained"
          icon="book"
          uppercase={false}
          style={{ margin: 10 }}
          onPress={() => Alert.alert('Coming soon')}
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
      </Modal>
    </>
  );
};

export default Home;
