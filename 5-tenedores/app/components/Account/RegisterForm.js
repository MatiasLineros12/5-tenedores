import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Input, Icon, Button } from "react-native-elements";
import Loading from "../../components/Loading";
import { validateEmail } from "../../utils/validations";
import { size, isEmpty } from "lodash"; //lodash: biblioteca para funciones de programacion
import * as firebase from "firebase";
import { useNavigation } from "@react-navigation/native";

export default function RegisterForm(props) {
  const { toastRef } = props; // props para el toastRef del REgister.js
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [formData, setFormData] = useState(defaultFormValue());
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const onSubmit = () => {
    //console.log(formData);
    //console.log(validateEmail(formData.email));
    if (
      isEmpty(formData.email) ||
      isEmpty(formData.password) ||
      isEmpty(formData.repeatPassword)
    ) {
      //console.log("todos los campos son obligatorios");
      toastRef.current.show("todos los campos son obligatorios");
    } else if (!validateEmail(formData.email)) {
      //console.log("email incorrecto");
      toastRef.current.show("email incorrecto");
    } else if (formData.password !== formData.repeatPassword) {
      //console.log("contraseñas no coinciden");
      toastRef.current.show("contraseñas no coinciden");
    } else if (size(formData.password) < 6) {
      //console.log("contraseña debe tener minimo 6 caracteres");
      toastRef.current.show("contraseña debe tener minimo 6 caracteres");
    } else {
      //console.log("ok");
      setLoading(true);
      firebase
        .auth()
        .createUserWithEmailAndPassword(formData.email, formData.password)

        .then((/*response*/) => {
          //console.log(response);
          setLoading(false);
          navigation.navigate("account");
        })
        .catch((/*err*/) => {
          //console.log(err);
          setLoading(false);
          toastRef.current.show("email ya en uso");
        });
    }
  };

  const onChange = (e, type) => {
    //console.log("type");
    //console.log(e);
    //console.log(e.nativeEvent.text);
    //setFormData({ [type]: e.nativeEvent.text }); //solo trae el ultimo valor asignado
    setFormData({ ...formData, [type]: e.nativeEvent.text }); //los tres puntos, permiten acceder a los datos del objeto formData
  };

  return (
    <View style={styles.formContainer}>
      <Input
        placeholder="Correo electronico"
        containerStyle={styles.inputForm}
        onChange={(e) => onChange(e, "email")}
        rightIcon={
          <Icon
            type="material-community"
            name="at"
            iconStyle={styles.iconRight}
          />
        }
      />
      <Input
        placeholder="Contraseña"
        containerStyle={styles.inputForm}
        onChange={(e) => onChange(e, "password")}
        password={true}
        secureTextEntry={showPassword ? false : true}
        rightIcon={
          <Icon
            type="material-community"
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            iconStyle={styles.iconRight}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />
      <Input
        placeholder="Repita contraseña"
        containerStyle={styles.inputForm}
        onChange={(e) => onChange(e, "repeatPassword")}
        password={true}
        secureTextEntry={showRepeatPassword ? false : true}
        rightIcon={
          <Icon
            type="material-community"
            name={showRepeatPassword ? "eye-off-outline" : "eye-outline"}
            iconStyle={styles.iconRight}
            onPress={() => setShowRepeatPassword(!showRepeatPassword)}
          />
        }
      />
      <Button
        title="Unirse"
        containerStyle={styles.btnContainerRegister}
        buttonStyle={styles.btnRegister}
        onPress={onSubmit}
      />
      <Loading isVisible={loading} text="creando cuenta" />
    </View>
  );
}

function defaultFormValue() {
  return {
    email: "",
    password: "",
    repeatPassword: "",
  };
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  inputForm: {
    width: "100%",
    marginTop: 20,
  },
  btnContainerRegister: {
    marginTop: 20,
    width: "95%",
  },
  btnRegister: {
    backgroundColor: "#00a680",
  },
  iconRight: {
    color: "#c1c1c1",
  },
});
