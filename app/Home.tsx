import React, { FunctionComponent, useEffect, useCallback, useState, useRef } from 'react';
import { Linking, SafeAreaView, Alert, ImageBackground, View, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import crashlytics from '@react-native-firebase/crashlytics';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import Video, { LoadError } from 'react-native-video';
import moment from 'moment';
import strings from './strings';
import AsyncStorage from '@react-native-community/async-storage';
import { Button, Text, Modal, FAB } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SplashScreen from 'react-native-splash-screen';
import styles from './styles';
import VersionNumber from 'react-native-version-number';

const Home: FunctionComponent = () => {
  const [verseUrl, setVerseUrl] = useState('');
  const [chapterUrl, setChapterUrl] = useState('');
  const [versePaused, setVersePaused] = useState(true);
  const [chapterPaused, setChapterPaused] = useState(true);
  const [verseLoading, setVerseLoading] = useState(false);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
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

  const setup = useCallback(async () => {
    try {
      await auth().signInAnonymously();
      fetchVerse();
      fetchChapter();
      const storageKey = 'scheduledNotification';
      const notification = await AsyncStorage.getItem(storageKey);
      if (!notification) {
        // only show modal and schedule notification once
        setModalVisible(true);
        const dateString = new Date().toString();
        await AsyncStorage.setItem(storageKey, dateString);
        const now = moment();
        const notifTime = moment().set({ hour: 17, minutes: 0, second: 0, millisecond: 0 });
        const notifDate = now.isAfter(notifTime) ? notifTime.add(1, 'd') : notifTime;
        PushNotification.localNotificationSchedule({
          message: 'awal n-rbbi i-wass-ad',
          date: notifDate.toDate(),
          repeatType: 'day',
        });
      }
    } catch (e) {
      console.log(e);
      crashlytics().recordError(e);
    }
  }, [fetchChapter, fetchVerse]);

  useEffect(() => {
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
    setup();
    SplashScreen.hide();
    // const midday = moment('00:00').format('HH:mm');
  }, [setup, fetchChapter, fetchVerse]);

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

  const buttonsVisible = versePaused && chapterPaused && !modalVisible && !!verseUrl && !!chapterUrl;
  const loading = verseLoading || chapterLoading || !verseUrl || !chapterUrl;
  return (
    <>
      {!!verseUrl && (
        <Video
          paused={versePaused}
          audioOnly
          source={{ uri: verseUrl }} // Can be a URL or a local file.
          ref={verseRef} // Store reference
          onBuffer={onVerseBuffer} // Callback when remote video is buffering
          onLoad={onVerseLoad}
          onLoadStart={onVerseLoadStart}
          onError={onError} // Callback when video cannot be loaded
          onEnd={() => {
            if (verseRef.current) {
              verseRef.current.seek(0);
              setTimeout(() => {
                setVersePaused(true);
              }, 100);
            }
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
          source={{ uri: chapterUrl }} // Can be a URL or a local file.
          ref={chapterRef} // Store reference
          onBuffer={onChapterBuffer} // Callback when remote video is buffering
          onLoad={onChapterLoad}
          onLoadStart={onChapterLoadStart}
          onError={onError} // Callback when video cannot be loaded
          onEnd={() => {
            if (chapterRef.current) {
              chapterRef.current.seek(0);
              setTimeout(() => {
                setVersePaused(true);
              }, 100);
            }
          }}
          playInBackground
          playWhenInactive
          ignoreSilentSwitch="ignore"
        />
      )}
      <ImageBackground style={styles.imgBackground} resizeMode="cover" source={require('./background.jpg')}>
        <View style={styles.overlay} />
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.detailsContainer}>
            <Image source={require('./logo.png')} resizeMode="contain" style={{ width: 60, height: 60, margin: 10 }} />
            <View>
              <Text style={{ marginBottom: 10, fontSize: 20 }}>awal i-wass</Text>
              <Text style={{ marginBottom: 10, fontSize: 20, color: '#989898' }}>{verse}</Text>
              <Text style={{ fontSize: 16, color: '#989898' }}>{moment().format('DD/MM/YYYY')}</Text>
            </View>
          </View>
          {buttonsVisible && (
            <View style={styles.buttonModal}>
              <View style={styles.buttonContainer}>
                {/* listen again to this verse */}
                <Button
                  mode="contained"
                  icon="repeat"
                  uppercase={false}
                  style={{ margin: 10 }}
                  onPress={() => {
                    if (verseRef.current) {
                      verseRef.current.seek(0);
                      setVersePaused(false);
                      setPlayingChapter(false);
                    }
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
                    if (chapterRef.current) {
                      chapterRef.current.seek(0);
                      setChapterPaused(false);
                      setPlayingChapter(true);
                    }
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
                  kchem dar takat n-tgemmi-negh
                </Button>
              </View>
            </View>
          )}
          <FAB
            style={styles.fab}
            icon={versePaused && chapterPaused ? 'play' : 'pause'}
            loading={loading}
            onPress={() => (playingChapter ? setChapterPaused(!chapterPaused) : setVersePaused(!versePaused))}
          />
          <View style={styles.versionDetail}>
            <Text
              style={{ color: 'rgb(46,56,143)', fontSize: 12 }}
            >{`${VersionNumber.appVersion} (${VersionNumber.buildVersion})`}</Text>
          </View>
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
    </>
  );
};

export default Home;
