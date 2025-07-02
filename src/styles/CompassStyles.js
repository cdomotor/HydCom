// src/styles/CompassStyles.js
import { StyleSheet } from 'react-native';

export const compassStyles = StyleSheet.create({
  compassContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  compassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  compassRose: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#aaa',
    backgroundColor: '#f0f0f0',
  },
  compassRoseInner: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassCenter: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'black',
    zIndex: 3,
  },
  degreeMark: {
    position: 'absolute',
    width: 2,
    height: 10,
    backgroundColor: '#333',
  },
  compassReadout: {
    marginTop: 10,
    alignItems: 'center',
  },
  compassHeading: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  compassDirection: {
    fontSize: 14,
    color: '#666',
  },
  compassTrue: {
    fontSize: 12,
    color: '#888',
  },
  compassWarning: {
    marginTop: 10,
    color: 'orange',
    fontStyle: 'italic',
  },
  cardinalLabel: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    width: 24,
    textAlign: 'center',
  },
});
