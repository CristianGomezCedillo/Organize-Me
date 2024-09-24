import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';
const AppIconImage = require('./assets/images/organizeme.png');

export default function App() {
  return (
    <View style={styles.container}>

      <Image source={AppIconImage} />

      <Text style={{ color: '#fff', fontSize:50 }}>
        ORGANIZE ME
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#008000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    paddingTop: 58,
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
});
