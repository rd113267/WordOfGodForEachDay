import React, { FunctionComponent, useEffect, useCallback, useState, useRef } from 'react';
import HuaweiProtectedApps from 'react-native-huawei-protected-apps';
import { Linking, SafeAreaView, Alert, ImageBackground, View, Image } from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import Video, { LoadError, OnProgressData } from 'react-native-video';
import moment from 'moment';
import strings from './strings';
import bookInfo, { sequence } from './bibleRef';
import AsyncStorage from '@react-native-community/async-storage';
import { Button, Text, Modal, FAB, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './styles';
import VersionNumber from 'react-native-version-number';
import { getRandomInt } from './helpers';
import SplashScreen from 'react-native-splash-screen';

const Home: FunctionComponent = () => {
  const PHONE_NUMBER = '+212642596841';
  const [versePaused, setVersePaused] = useState(true);
  const [chapterPaused, setChapterPaused] = useState(true);
  const [biblePaused, setBiblePaused] = useState(true);
  const [verseLoading, setVerseLoading] = useState(false);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [bibleLoading, setBibleLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [playingChapter, setPlayingChapter] = useState(false);
  const [playingBible, setPlayingBible] = useState(false);
  const [chapter, setChapter] = useState(1);
  const [book, setBook] = useState(0);
  const [progress, setProgress] = useState(0);
  const verseRef = useRef<Video>();
  const chapterRef = useRef<Video>();
  const bibleRef = useRef<Video>();
  const date = moment().date();
  const month = moment().month() + 1;
  const verse = strings[month][date];
  const rootURL = 'https://raw.githubusercontent.com/moulie415/WordOfGodForEachDay/master/files/';
  const verseUrl = `${rootURL}verses/${month}/${date}.mp3`;
  const chapterUrl = `${rootURL}chapters/${month}/${date}.mp3`;
  const bibleUrl = `${rootURL}bible/${sequence[book]}/${chapter}.mp3`;

  const setup = useCallback(async () => {
    try {
      const storageKey = 'scheduledNotification';
      const notification = await AsyncStorage.getItem(storageKey);
      if (!notification) {
        // only show modal and schedule notification once
        setModalVisible(true);
        const dateString = new Date().toString();
        await AsyncStorage.setItem(storageKey, dateString);
        const now = moment();
        const time = __DEV__
          ? { hour: 17, minutes: 39, second: 0, millisecond: 0 } // use this for testing notifications
          : { hour: 17, minutes: 0, second: 0, millisecond: 0 };
        const notifTime = moment().set(time);
        const notifDate = now.isAfter(notifTime) ? notifTime.add(1, 'd') : notifTime;
        PushNotification.localNotificationSchedule({
          message: 'sfeld-as tzaamt s-rrja ishan',
          date: notifDate.toDate(),
          repeatType: 'day',
        });
      }
    } catch (e) {
      console.log(e);
      crashlytics().recordError(e);
    }
  }, []);

  useEffect(() => {
    PushNotification.configure({
      onRegister: (token) => {
        console.log('TOKEN:', token);
      },
      onNotification: async (notification) => {
        if (notification.userInteraction) {
          setVersePaused(false);
          setChapterPaused(true);
          setBiblePaused(true);
          setPlayingChapter(false);
          setPlayingBible(false);
        }
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
    const config = {
      title: 'Huawei Protected Apps',
      text: "This app requires to be enabled in 'Protected Apps' in order to receive push notifications",
      doNotShowAgainText: 'Do not show again',
      positiveText: 'PROTECTED APPS',
      negativeText: 'CANCEL',
    };
    HuaweiProtectedApps.AlertIfHuaweiDevice(config);
  }, [setup]);

  const onFABPress = useCallback(() => {
    if (playingChapter) {
      setChapterPaused(!chapterPaused);
    } else if (playingBible) {
      setBiblePaused(!biblePaused);
    } else {
      setVersePaused(!versePaused);
    }
  }, [biblePaused, chapterPaused, versePaused, playingBible, playingChapter]);

  const onVerseBuffer = ({ isBuffering }: { isBuffering: boolean }) => {
    setVerseLoading(isBuffering);
  };

  const onVerseLoadStart = () => {
    setVerseLoading(true);
  };

  const onVerseLoad = () => {
    setVerseLoading(false);
  };

  const onChapterBuffer = ({ isBuffering }: { isBuffering: boolean }) => {
    setChapterLoading(isBuffering);
  };

  const onChapterLoadStart = () => {
    setChapterLoading(true);
  };

  const onChapterLoad = () => {
    setChapterLoading(false);
  };

  const onBibleBuffer = ({ isBuffering }: { isBuffering: boolean }) => {
    setBibleLoading(isBuffering);
  };

  const onBibleLoadStart = () => {
    setBibleLoading(true);
  };

  const onBibleLoad = () => {
    setBibleLoading(false);
  };

  const onError = (e: LoadError) => {
    setVersePaused(true);
    setBiblePaused(true);
    setChapterPaused(true);
    console.log(e);
    if (playingBible) {
      crashlytics().log('bible url: ' + bibleUrl);
      console.log('bible url', bibleUrl);
    } else if (playingChapter) {
      crashlytics().log('chapter url: ' + chapterUrl);
      console.log('chapter url', chapterUrl);
    } else {
      crashlytics().log('verse url: ' + verseUrl);
      console.log('verse url', verseUrl);
    }
    crashlytics().recordError(new Error(e.error.errorString));
    Alert.alert('Error', e.error.errorString);
  };

  const onProgress = useCallback(({ currentTime, playableDuration }: OnProgressData) => {
    setProgress(currentTime / playableDuration);
  }, []);

  const buttonsVisible = versePaused && chapterPaused && biblePaused && !modalVisible;
  const loading = verseLoading || chapterLoading || bibleLoading;
  return (
    <>
      <Video
        paused={versePaused}
        onProgress={onProgress}
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
      <Video
        paused={chapterPaused}
        onProgress={onProgress}
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
              setChapterPaused(true);
            }, 100);
          }
        }}
        playInBackground
        playWhenInactive
        ignoreSilentSwitch="ignore"
      />
      <Video
        paused={biblePaused}
        onProgress={onProgress}
        audioOnly
        source={{ uri: bibleUrl }} // Can be a URL or a local file.
        ref={bibleRef} // Store reference
        onBuffer={onBibleBuffer} // Callback when remote video is buffering
        onLoad={onBibleLoad}
        onLoadStart={onBibleLoadStart}
        onError={onError} // Callback when video cannot be loaded
        onEnd={() => {
          if (bibleRef.current) {
            const currentBook = sequence[book];
            try {
              if (chapter === bookInfo[currentBook].length) {
                setChapter(1);
                if (currentBook === sequence.pop()) {
                  setBook(0);
                } else {
                  setBook(book + 1);
                }
              } else {
                setChapter(chapter + 1);
              }
            } catch (e) {
              crashlytics().log('book: ' + book);
              crashlytics().recordError(e);
              Alert.alert('Error', e.message);
            }
          }
        }}
        playInBackground
        playWhenInactive
        ignoreSilentSwitch="ignore"
      />
      <ImageBackground
        style={styles.imgBackground}
        resizeMode="cover"
        source={require('./background.png')}
        onLoadEnd={() => SplashScreen.hide()}
      >
        {/* <View style={styles.overlay} /> */}
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.detailsContainer}>
            <Image source={require('./logo.png')} resizeMode="contain" style={{ width: 60, height: 60, margin: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 10, fontSize: 20 }}>awal i-wass</Text>
              <Text style={{ marginBottom: 10, fontSize: 20, color: '#989898' }}>{verse}</Text>
              <Text style={{ fontSize: 16, color: '#989898' }}>{moment().format('DD/MM/YYYY')}</Text>
              {__DEV__ && (
                <ProgressBar style={{ marginRight: 20, marginTop: 10 }} progress={progress} color="rgb(46,56,143)" />
              )}
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
                      setPlayingBible(false);
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
                      setPlayingBible(false);
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
                  onPress={() => {
                    if (bibleRef.current) {
                      const newBook = getRandomInt(0, 65);
                      try {
                        const max = bookInfo[sequence[newBook]].length;
                        console.log('max', max);
                        const newChapter = getRandomInt(1, max);
                        setBook(newBook);
                        setChapter(newChapter);
                        setPlayingBible(true);
                        setPlayingChapter(false);
                        setTimeout(() => setBiblePaused(false), 250);
                      } catch (e) {
                        crashlytics().log('book: ' + newBook);
                        crashlytics().recordError(e);
                        Alert.alert('Error', e.message);
                      }
                    }
                  }}
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
                  kchem s-dar takat-negh
                </Button>
                <Button
                  mode="contained"
                  icon="whatsapp"
                  uppercase={false}
                  style={{ margin: 10 }}
                  onPress={async () => {
                    try {
                      await Linking.openURL(`whatsapp://send?phone=${PHONE_NUMBER}`);
                    } catch (e) {
                      crashlytics().recordError(e);
                      Alert.alert('Error', e.message);
                    }
                  }}
                >
                  sawl-agh-d s-watsapp
                </Button>
              </View>
            </View>
          )}
          <FAB
            style={styles.fab}
            icon={versePaused && chapterPaused && biblePaused ? 'play' : 'pause'}
            loading={loading}
            onPress={onFABPress}
          />
          <View style={styles.versionDetail}>
            <Text
              style={{ color: '#fff', fontSize: 12 }}
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
        <Text style={styles.modalText}>
          ass f-wass rad-ak-ntazn awal imimn gh-warratn n-sidi rbbi. sfeld-as ar-ttzaamt s-rrja ishan.
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
