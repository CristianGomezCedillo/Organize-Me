import { StatusBar } from 'expo-status-bar';
import { Link,} from 'expo-router';
import { StyleSheet, Text, View, Image } from 'react-native';
const AppIconImage = require('../../assets/images/organizeme.png');
import Button from '../../components/Button';
import ImageViewer from '../../components/ImageViewer';

export default function Home() {
  return (

    //Color reference
    //https://www.w3schools.com/cssref/css_colors.php

    //Tab container reference
    //https://docs.expo.dev/router/advanced/tabs/

    //Available icons
    //https://icons.expo.fyi/Index
    
    <View style={styles.container}>


      
      <ImageViewer placeholderImageSource={AppIconImage}/>

      <Text style={{ color: 'darkseagreen', fontSize:50 }}>
        ORGANIZE ME
      </Text>

      {/* Components You Can Use
        <Link href="/todopage">To-Do List Link Here</Link>
        <Button label="Less Important Button"/>
      */}
      
      <Button label="Get Organized" theme="primary"/>
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 40,
    backgroundColor: 'cornsilk',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
