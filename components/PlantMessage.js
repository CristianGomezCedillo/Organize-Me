import { Modal, View, Text, Pressable, StyleSheet, Image, TouchableWithoutFeedback } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';




export default function PlantMessage({ isVisible, text, onClose, imageSource="../../assets/images/Plants/plant1_complete.png" }) {
  return (
    <TouchableWithoutFeedback onPress={onClose}>
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View style={styles.modalContent}>
          <Pressable onPress={onClose}>
            <MaterialIcons name="close" color="#fff" size={22} />
          </Pressable>
          <View style={styles.messageContainer}>
            <Image source={imageSource} style={styles.image}/>
            <Text style={styles.text}>{text}</Text>
          </View>
      </View>
      
    </Modal>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    height: '25%',
    width: '100%',
    backgroundColor: '#25292e',
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    position: 'absolute',
    bottom: 0,
    padding: 18,
    margin: 18,
    flexDirection: 'row',
  },
  text: {
    color: '#000',
    fontSize: 20,
    backgroundColor: 'lightgreen',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex:1,
  },
  image: {
    width: 100,
    height: undefined,
    margin: 20, // Remove all margin around the images
    //padding: 20, // Remove all padding inside the images
    //height: undefined,
  
  },
  messageContainer: {
    flex: 1,
    flexDirection: 'row',
    //paddingHorizontal: 10, // Adds some padding for the message
  },
});
