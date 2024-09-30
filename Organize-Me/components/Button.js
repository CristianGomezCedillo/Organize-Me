import { StyleSheet, View, Pressable, Text } from 'react-native';
//import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function Button({ label, theme }) {
  if (theme === "primary") {
    return (
      <View style={[styles.buttonContainer, { borderWidth: 3, borderColor: "yellow", borderRadius: 18 }]}>
        <Pressable
          style={[styles.button, { backgroundColor: "green" }]}
          onPress={() => alert('You pressed a button.')}
        >

          <Text style={[styles.buttonLabel, { color: "yellow" }]}>{label}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={() => alert('You pressed a button.')}>
          <Text style={styles.buttonLabel}>{label}</Text>
        </Pressable>
      </View>
  );
}

const styles = StyleSheet.create({
    buttonContainer: {
        width: 320,
        height: 68,
        marginHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
      },
      button: {
        borderRadius: 10,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        fontFamily: "Helvetica",
      },
      buttonIcon: {
        paddingRight: 8,
      },
      buttonLabel: {
        color: 'yellow',
        fontSize: 16,

      },
    });
