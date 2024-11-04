import { StyleSheet, View, Pressable, Text, Image} from 'react-native';
import React, {useState} from 'react';
const plant1_1 = require('../assets/images/Plants/plant1_1.png');
const plant1_2 = require('../assets/images/Plants/plant1_2.png');
const plant1_3 = require('../assets/images/Plants/plant1_3.png');
const plant1_4 = require('../assets/images/Plants/plant1_4.png');


export default function Plant({imageSource = '../../assets/images/plants/plant1', streakAmount}) {
  const [modalVisible, setModalVisible] = useState(true);
  
  return (
      <View style={styles.container}>
        <Image source={plant1_4} style={[styles.image,{aspectRatio: 6.4, height: 9.375}]} />
        {Array.from({ length: streakAmount }).map((_, index) => (
          <Image
            key={index}
            source={index % 2 === 0 ? plant1_3 : plant1_2}
            style={[styles.image,{aspectRatio: 6.4, height: 9.375}]}
          />
        ))}
        <Image source={plant1_1} style={[styles.image,{aspectRatio: 1.1, height: 60}]} />
      </View>
  );
}
const styles = StyleSheet.create({
    container: {
      flexDirection: 'column', // Display the images in a row
      alignItems: 'center', // Vertically center the images
      justifyContent: 'flex-start', // Horizontally center the images
      //flexWrap: 'wrap', // Allow images to wrap to the next line if necessary
      margin: 0, // Remove all margin around the images
    padding: 0, // Remove all padding inside the images
    },
    image: {
      width: 60,              // Fixed width of 60 pixels
      height: undefined,       // Allow height to scale based on aspect ratio
      aspectRatio: 6.4,          // Square aspect ratio for consistent display
      resizeMode: 'contain',   // Prevents cropping and keeps the image within bounds
    },
 
  });
