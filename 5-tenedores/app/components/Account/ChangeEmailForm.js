import React, {useState} from 'react'
import { StyleSheet, View } from 'react-native'
import { Input, Button } from 'react-native-elements'
import * as firebase from 'firebase'
import {validateEmail} from '../../utils/validations'
import {reauthenticate} from '../../utils/api'

export default function ChangeEmailForm(props){

    const { email, setShowModal, toastRef, setReloadUserInfo } = props;
    const [formData, setFormData] = useState(defaultValues());
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const onChange = (e, type) => {
        setFormData({ ...formData, [type]: e.nativeEvent.text });
      };

    const onSubmit = () => {
        setErrors({});
        if(!formData.email || email === formData.email){
            setErrors({
                email:"El email no ha cambiado",
            });
        }else if(!validateEmail(formData.email)){
            setErrors({
                email:"El email es incorrecto",
            });
        }else if(!formData.password){
            setErrors({
                password:"La contraseña no puede estar vacia",
            });
        }else{
            setIsLoading(true);
            reauthenticate(formData.password)
            .then(() => {
                firebase
                .auth().
                currentUser.updateEmail(formData.email)
                .then(()=>{
                    setIsLoading(false);
                    setReloadUserInfo(true);
                    toastRef.current.show("Email actualizado correctamente");
                    setShowModal(false);
                })
                .catch(()=>{
                    setErrors({email: "Error al actualizar"});
                    setIsLoading(false);
                });
            })
            .catch(()=>{
                setIsLoading(false);
                setErrors({password: "La contraseña no es correcta"});
            });
        }
    };

    return (
        <View style={styles.View}>
            <Input 
                placeholder="Correo electrónico"
                containerStyle={styles.Input}
                defaultValue={email || ""} //si llega lo pones y si no, vacio
                rightIcon={{
                    type: "material-community",
                    name: "at",
                    color: "#c2c2c2",
                }}
                onChange={(e) => onChange(e, "email")}
                errorMessage={errors.email}
            />
            <Input
                placeholder="Contraseña"
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
            <Button
                title="Cambiar email"
                containerStyle={styles.btnContainer}
                buttonStyle={styles.btn}
                onPress={onSubmit}
                loading={isLoading}
            />
        </View>
    );
}

function defaultValues(){
    return {
        email: "",
        password: "",
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