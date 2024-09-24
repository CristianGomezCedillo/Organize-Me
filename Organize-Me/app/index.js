import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';
import { StyleSheet, Text, View, Image } from 'react-native';
const AppIconImage = require('../assets/images/organizeme.png');
import Button from '../components/Button';
import ImageViewer from '../components/ImageViewer';

export default function Home() {
  return (
    <View style={styles.container}>

      <ImageViewer placeholderImageSource={AppIconImage}/>

      <Text style={{ color: '#fff', fontSize:50 }}>
        ORGANIZE ME
      </Text>

      <Link href="/todopage">To-Do List Link Here</Link>
      <Button label="Get Organized" theme="primary"/>
      <Button label="Less Important Button"/>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 40,
    backgroundColor: '#008000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
