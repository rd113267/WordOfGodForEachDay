import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  modal: {
    backgroundColor: '#fff',
    width: '75%',
    alignSelf: 'center',
    textAlign: 'center',
    justifyContent: 'flex-start',
    padding: 30,
    borderRadius: 4,
  },
  buttonModal: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 15,
    width: '90%',
    borderRadius: 4,
  },
  imgBackground: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
