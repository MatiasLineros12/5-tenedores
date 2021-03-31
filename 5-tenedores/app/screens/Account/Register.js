//ORDEN DE -IMPORT- ES JERARQUICO, PRIMERO LO INSTALADO Y DSPS LO CREADO POR MI
import React, { useRef } from "react"; //INSTALADO
import { StyleSheet, View, Image } from "react-native"; //INSTALADO
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"; //INSTALADO
import Toast from "react-native-easy-toast"; //INSTALADO -> notificaciones de forms
import RegisterForm from "../../components/Account/RegisterForm"; //CREADO

export default function Register() {
  const toastRef = useRef();

  return (
    <KeyboardAwareScrollView>
      <Image
        source={require("../../../assets/img/5-tenedores-letras-icono-logo.png")}
        resizeMode="contain"
        style={styles.logo}
      />
      <View style={styles.viewForm}>
        <RegisterForm toastRef={toastRef} />
      </View>
      <Toast ref={toastRef} position="center" opacity={0.9} />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: "100%",
    height: 150,
    marginTop: 20,
  },
  viewForm: {
    marginRight: 40,
    marginLeft: 40,
  },
});
