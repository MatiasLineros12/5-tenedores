import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Avatar } from 'react-native-elements';
import * as firebase from 'firebase';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';

export default function InfoUser(props){
    const {userInfo: {uid, photoURL, displayName, email}, toastRef, setLoading, setLoadingText} = props; //hace un structuring de userInfo
    //const {photoURL} = (userInfo);  //otra manera de hacer structuring
    
    //console.log(props.userInfo);

    const changeAvatar = async() =>{ // constante para cuando se quiera cambiar el avatar
        console.log('change avatar..');
        const resultPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL); //solicita permiso de camara
        console.log(resultPermission);
        const resultPermissionCamera = resultPermission.permissions.cameraRoll.status; //guarda estado de permiso

        if(resultPermissionCamera === "denied"){ //igualdad estricta ===, no abstracta == (tipo de dato exacto)
            //mostrar toast
            toastRef.current.show("Es necesario tener permisos de la galeria");
        }else{
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4,3]
            })
            console.log(result);
            if(result.cancelled){
                toastRef.current.show("Has cerrado la selección de imagen");
            }else{
                uploadImage(result.uri).then(()=>{
                    console.log('imagen subida')
                    updatePhotoUrl();
                }).catch(()=>{
                    toastRef.current.show("Error al actualizar el avatar");
                });
            }
        }
    }

    const uploadImage = async (uri)=>{ //función para subir el avatar a firebase
        console.log(uri);
        setLoadingText("Actualizando");
        setLoading(true);
        const response = await fetch(uri);
        console.log(JSON.stringify(response)); //desde tal version, se debe mostrar una uri mediante json
        const blob = await response.blob();
        console.log(JSON.stringify(blob));
        const ref = firebase.storage().ref().child(`avatar/${uid}`);
        return ref.put(blob);
    }

    const updatePhotoUrl = ()=>{ //funcion para convertir el paramentro photoUrl en la ruta del avtar firebase
        firebase
        .storage()
        .ref(`avatar/${uid}`)
        .getDownloadURL()
        .then(async (response) => {
            console.log(response);
            const update = {
                photoURL: response
            };
            await firebase.auth().currentUser.updateProfile(update);
            setLoading(false);
            console.log('imagen actualizada');
        })
        .catch(()=>{
            toastRef.current.show("Error al actualizar el avatar");
        })
    }

    return (
        <View style={styles.viewUserInfo}>
            <Avatar
                size="large"
                rounded
                showEditButton
                onEditPress={changeAvatar}
                ContainerStyle={styles.userInfoAvatar}
                source={
                    photoURL ? {uri: photoURL} : require("../../../assets/img/avatar-default.jpg")
                }
            />
            <View style={styles.viewText}>
                <Text style={styles.displayName}>
                    {displayName ? displayName : "Anónimo"}
                </Text>
                <Text>
                    {email ? email : "Social login"}
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    viewUserInfo:{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        backgroundColor:"#f2f2f2",
        paddingTop: 30,
        paddingBottom: 30,
    },
    userInfoAvatar:{
        marginRight: 20,
    },
    displayName:{
        fontWeight: "bold",
        paddingBottom: 5,
    },
    viewText:{
        marginLeft: 10,
    },
});