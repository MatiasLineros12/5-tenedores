import React, {useState, useEffect, useRef} from "react";
import { StyleSheet, View, Text } from "react-native";
import { Button } from "react-native-elements";
import Toast from "react-native-easy-toast";
import * as firebase from "firebase";
import Loading from "../../components/Loading";
import InfoUser from "../../components/Account/InfoUser";
import AccountOptions from "../../components/Account/AccountOptions";

export default function UserLogged() {
  const [userInfo, setUserInfo] = useState({}) //useState para la informacion de usuario
  const toastRef = useRef();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [reloadUserInfo, setReloadUserInfo] = useState(false) //estado para recargar la pagina cuando se modifica un account option

  useEffect(() => { //este useEffect es para solicitar la info del usuario actual
    (async () => {
      const user = await firebase.auth().currentUser;
      setUserInfo(user); //se le cargan los datos a la variable definida anteriormente
    })();
    setReloadUserInfo(false); //cada vez q setReload sea true, se actualizara la info del usuario
  }, [reloadUserInfo]); // como si fuera un interruptor

  return (
    <View style={styles.viewUserInfo}>
      
      {userInfo && <InfoUser 
                      userInfo={userInfo} 
                      toastRef={toastRef}
                      setLoading={setLoading}
                      setLoadingText={setLoadingText} 
                   />}

      <AccountOptions userInfo={userInfo} toastRef={toastRef} setReloadUserInfo={setReloadUserInfo}/>
      
      <Button 
        title="Cerrar sesión" 
        buttonStyle={styles.buttonCloseSession}
        titleStyle={styles.buttonCloseSessionText}
        onPress={() => firebase.auth().signOut()} 
      />
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <Loading text={loadingText} isVisible={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  viewUserInfo:{
    minHeight: "100%",
    backgroundColor: "#f2f2f2",
  },
  buttonCloseSession:{
    borderRadius:0,
    marginTop:30,
    backgroundColor:"#fff",
    borderTopWidth:1,
    borderTopColor: "#e3e3e3",
    borderBottomWidth:1,
    borderBottomColor: "#e3e3e3",
    paddingTop:10,
    paddingBottom:10,
  },
  buttonCloseSessionText:{
    color:"#00A680"
  },
});