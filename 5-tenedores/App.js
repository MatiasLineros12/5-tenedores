import React from "react";
import { YellowBox } from "react-native";
import Navigation from "./app/navigations/Navigation";
import { firebaseApp } from "./app/utils/firebase";
import { decode, encode } from "base-64" //se instaló para guardar restaurant en bd firebase (115.Guardando Restaurante...)

YellowBox.ignoreWarnings(["Setting a timer"]);

if(!global.btoa) global.btoa = encode; //se desarrollo para guardar restaurant en bd firebase (115.Guardando Restaurante...)
if(!global.atob) global.atob = decode;//se desarrollo para guardar restaurant en bd firebase (115.Guardando Restaurante...)

export default function App() {
  return <Navigation />;
}
