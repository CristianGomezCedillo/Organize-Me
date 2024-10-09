import { StyleSheet, View, Pressable, Text, Image} from 'react-native';
import React, {useState} from 'react';


export default function Plant({imageSource = '../../assets/images/plants/plant1', streakAmount}) {
  const [modalVisible, setModalVisible] = useState(true);
  
  return (
      <View style={styles.container}>
        <Image source={imageSource+'_4.png'} style={[styles.image,{aspectRatio: 6.4}]} />
        {Array.from({ length: streakAmount }).map((_, index) => (
          <Image
            key={index}
            source={index % 2 === 0 ? imageSource+"_3.png" : imageSource+"_2.png"}
            style={[styles.image,{aspectRatio: 6.4}]}
          />
        ))}
        <Image source={imageSource+'_1.png'} style={[styles.image,{aspectRatio: 1}]} />
      </View>
  );
}
const styles = StyleSheet.create({
    container: {
      flexDirection: 'column', // Display the images in a row
      alignItems: 'center', // Vertically center the images
      justifyContent: 'center', // Horizontally center the images
      //flexWrap: 'wrap', // Allow images to wrap to the next line if necessary
      margin: 0, // Remove all margin around the images
    padding: 0, // Remove all padding inside the images
    },
    image: {
      width: 60, // Adjust the size of the image
      margin: 0, // Remove all margin around the images
      padding: 0, // Remove all padding inside the images
      //height: undefined,
      resizeMode: 'cover',
    },
 
  });
