import React, {useRef} from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Image,
  //requireNativeComponent,
} from "react-native";
import { Divider } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-easy-toast"; //INSTALADO -> notificaciones de forms
import LoginForm from "../../components/Account/LoginForm";

export default function Login() {
  const toastRef = useRef();

  return (
    <ScrollView>
      <Image
        source={require("../../../assets/img/5-tenedores-letras-icono-logo.png")}
        resizeMode="contain"
        style={styles.logo}
      />
      <View style={styles.viewContainer}>
        <LoginForm toastRef={toastRef}/>
        <CreateAccount />
      </View>
      <Divider style={styles.Divider} />
      <Toast ref={toastRef} position="center" opacity={0.9}/>
    </ScrollView>
  );
}

//componente interno- solo para el Login.js
function CreateAccount() {
  const navigation = useNavigation();
  return (
    <Text style={styles.TextRegister}>
      ¿Aun no tienes cuenta?{" "}
      <Text
        style={styles.btnRegister}
        onPress={() => navigation.navigate("register")}
      >
        Registrate
      </Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: "100%",
    height: 150,
    marginTop: 20,
  },
  viewContainer: {
    marginRight: 40,
    marginLeft: 40,
  },
  TextRegister: {
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
  },
  btnRegister: {
    color: "#00a680",
    fontWeight: "bold",
  },
  Divider: {
    backgroundColor: "#00a680",
    margin: 40,
  },
});
