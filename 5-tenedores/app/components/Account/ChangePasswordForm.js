import React, {useState} from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { Input, Button } from 'react-native-elements'
import * as firebase from 'firebase'
import { size } from 'lodash'
import {reauthenticate} from '../../utils/api'


export default function ChangePasswordForm(props){
    const { setShowModal, toastRef, setReloadUserInfo } = props;
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState(defaultValues()); //datos del form, 3 por defecto
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const onChange = (e, type) => { //funcion para añadir datos al formData
        setFormData({ ...formData, [type]: e.nativeEvent.text });
    };
    
    const onSubmit = async () => { //es async para q el set errors no se ejecute antes de la conexion a la api
        //console.log(formData);
        let isSetError = true; //para no ejecutar errores inexistentes.
        let errorsTemp = {};
        setErrors({});
        
        if(!formData.password || !formData.nuevaPassword || !formData.repetirNuevaPassword){
            errorsTemp = {
                password: !formData.password ? "Este campo no puede estar vacío" : "",
                nuevaPassword: !formData.nuevaPassword ? "Este campo no puede estar vacío" : "",
                repetirNuevaPassword: !formData.repetirNuevaPassword ? "Este campo no puede estar vacío" : "",
            };
        }else if(formData.nuevaPassword !== formData.repetirNuevaPassword){
            errorsTemp = {
                nuevaPassword:"Las contraseñas no coinciden",
                repetirNuevaPassword:"Las contraseñas no coinciden",
            };
        }else if(size(formData.nuevaPassword) < 6){
            errorsTemp = {
                nuevaPassword:"La contraseña debe ser mayor a 5 caracteres",
                repetirNuevaPassword:"La contraseña debe ser mayor a 5 caracteres",
            };
        }else{
            setIsLoading(true);
            await reauthenticate(formData.password) //await, para q espere a q se conecete a la api y termine reauthenticate
            .then(async ()=>{ 
                await firebase
                .auth()
                .currentUser.updatePassword(formData.nuevaPassword)
                .then(()=>{
                    isSetError=false;
                    setIsLoading(false);
                    setShowModal(false);
                    firebase.auth().signOut();
                }).catch(()=>{
                    errorsTemp ={
                        other: "Error al actualizar la contraseña",
                    };
                    setIsLoading(false);
                });
            }).catch(()=>{
                //multiples intentos erroneos para acceder, firebase bloquea por 5 min
                errorsTemp = {
                    password: "La contraseña no es correcta",
                };
                setIsLoading(false);
            });
        }
        isSetError && setErrors(errorsTemp); //si isSetError es true se ejecuta setErrors, si no, no se ejecuta
    };

    return(
        <View style={styles.View}>
            <Input
                placeholder="Contraseña actual"
                containerStyle={styles.Input}
                password={true}
                secureTextEntry={showPassword ? false : true}
                rightIcon={{
                    type: "material-community",
                    name: showPassword ? "eye-off-outline" : "eye-outline",
                    color:"#c2c2c2",
                    onPress: () => setShowPassword(!showPassword),        
                }}
                onChange={(e) => onChange(e, "password")}
                errorMessage={errors.password}
            />
            <Input
                placeholder="Nueva contraseña"
                containerStyle={styles.Input}
                password={true}
                secureTextEntry={showPassword ? false : true}
                rightIcon={{
                    type: "material-community",
                    name: showPassword ? "eye-off-outline" : "eye-outline",
                    color:"#c2c2c2",
                    onPress: () => setShowPassword(!showPassword),        
                }}
                onChange={(e) => onChange(e, "nuevaPassword")}
                errorMessage={errors.nuevaPassword}
            />
            <Input
                placeholder="Repita contraseña"
                containerStyle={styles.Input}
                password={true}
                secureTextEntry={showPassword ? false : true}
                rightIcon={{
                    type: "material-community",
                    name: showPassword ? "eye-off-outline" : "eye-outline",
                    color:"#c2c2c2",
                    onPress: () => setShowPassword(!showPassword),        
                }}
                onChange={(e) => onChange(e, "repetirNuevaPassword")}
                errorMessage={errors.repetirNuevaPassword}
            />
            <Button
                title="Cambiar contraseña"
                containerStyle={styles.btnContainer}
                buttonStyle={styles.btn}
                onPress={onSubmit}
                loading={isLoading}
            />
            <Text>{errors.other}</Text>
        </View>
    );
}

function defaultValues(){ //solo declara valores por defecto para el formData... dsps cambiara mediante onChange
    return {
        password: "",
        nuevaPassword: "",
        repetirNuevaPassword: "",
    };
}

const styles = StyleSheet.create({
    View:{
        alignItems: "center",
        paddingTop: 10,
        paddingBottom: 10,
    },
    Input:{
        marginBottom: 10,
    },
    btnContainer:{
        marginTop: 20,
        width: "95%",
    },
    btn:{
        backgroundColor: "#00a680",
    },
});