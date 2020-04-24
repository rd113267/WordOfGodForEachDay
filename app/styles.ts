import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  modal: {
    backgroundColor: '#fff',
    width: '75%',
    alignSelf: 'center',
    textAlign: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    borderRadius: 4,
  },
  modalText: {
    fontSize: 20,
    lineHeight: 35,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    backgroundColor: '#fff',
    padding: 15,
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  detailsContainer: {
    margin: 25,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 4,
    flexDirection: 'row',
    paddingVertical: 10,
  },
  versionDetail: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 5,
    borderRadius: 10,
  }
});
