# Word Of God For Each Day

awal n-rbbi i-kraygatt ass (the word of God for each day)

a-tsflidt i-yan-wawal imimn gh-warratn n-sidi rbbi kraygatt ass (Hear each day a sweet word from the writings of the Lord God)

awal n-rbbi i-wass-ad (the daily notification sent to the user)

sfeld dagh i-tguri-ad (listen again to this verse)

sfeld i-ugzzum-ad kullut (listen to the whole chapter)

sfeld i-warratn yadni n-sidi rbbi (listen to all the Bible)

kchem s-dar takat n-tgemmi-negh  (enter our website: www.tachelhit.info)

## Getting react-native-track-player to work

https://github.com/react-native-kit/react-native-track-player/issues/867#issuecomment-603807017

add this line to react-native-track-player.podspec in module dir

```pod
s.exclude_files = ["ios/RNTrackPlayer/Vendor/AudioPlayer/Example"]
```
