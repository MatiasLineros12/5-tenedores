import React, {useState} from 'react'
import { StyleSheet, View , Text} from 'react-native'
import { Input, Button } from 'react-native-elements'
import * as firebase from 'firebase'

export default function ChangeDisplayNameform(props){
    const {displayName, setShowModal, toastRef, setReloadUserInfo} = props;
    const [newDisplayName, setNewDisplayName] = useState(null); //para nuevo nombre
    const [error, setError] = useState(null) //error en validacion de formulario
    const [isLoading, setIsLoading] = useState(false)

    const onSubmit = () => {
        console.log(newDisplayName);
        setError(null);
        if(!newDisplayName){
            setError("El nombre no puede estar vacío");
        }else if(displayName === newDisplayName){
            setError("El nombre no puede ser igual al anterior");
        }else{
            setIsLoading(true);
            const update ={
                displayName: newDisplayName //se asigna nuevo nombre
            }
            firebase.
                auth()
                .currentUser.updateProfile(update)
                .then(()=>{
                    setIsLoading(false);
                    setReloadUserInfo(true);
                    setShowModal(false);
                })
                .catch(()=>{
                    setError("Error al actualizar nombre");
                    setIsLoading(false);
                });
        }
    }

    return (
        <View style={styles.view}>
            <Input
                placeholder="Nombre y apellidos"
                containerStyles={styles.input}
                rightIcon={{
                    type: "material-community",
                    name: "account-circle-outline",
                    color: "#c2c2c2",
                }}
                defaultValue={displayName  || ""} //si llega lo pones y si no, vacio
                onChange={(e) => setNewDisplayName(e.nativeEvent.text)} //almacena el nuevo nombre puesto en el input
                errorMessage={error}
            />
            <Button 
                title="Cambiar nombre"
                containerStyle={styles.btnContainer}
                buttonStyle={styles.btn}
                onPress={onSubmit}
                loading={isLoading}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    view:{
        alignItems:"center",
        paddingBottom:10,
        paddingTop:10,
    },
    input:{
        marginBottom: 10,
    },
    btnContainer:{
        marginTop: 20,
        width: "95%",
    },
    btn:{
        backgroundColor: "#00a680",
    },

})