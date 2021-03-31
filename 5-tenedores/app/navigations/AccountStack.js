import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Account from "../screens/Account/Account";
import Login from "../screens/Account/Login";
import Register from "../screens/Account/Register";

const Stack = createStackNavigator();

export default function AccountStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="account" //para llamar
        component={Account} //componente
        options={{ title: "Mi Cuenta" }} //titulo de pagina
      />
      <Stack.Screen
        name="login" //para llamar
        component={Login} //componente
        options={{ title: "Login" }} //titulo de pagina
      />
      <Stack.Screen
        name="register" //para llamar
        component={Register} //componente
        options={{ title: "Registro" }} //titulo de pagina
      />
    </Stack.Navigator>
  );
}
