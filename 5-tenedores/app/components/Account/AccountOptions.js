import React, {useState} from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { ListItem } from 'react-native-elements'
import { map } from 'lodash'
import Modal from '../Modal'
import ChangeDisplayNameform from './changeDisplayNameForm'
import ChangeEmailForm from './ChangeEmailForm'
import ChangePasswordForm from './ChangePasswordForm'

export default function AccountOptions(props){
    const {userInfo, ToastRef, setReloadUserInfo} = props; //obtengo los parametros recibidos por props
    const selectedComponent = (key) => { // constante para el componente seleccionado
        console.log(key);
        switch(key){
            default: setRenderComponent(null);
                setShowModal(false);
            break;
            case "displayName":
                setRenderComponent(
                    <ChangeDisplayNameform
                        displayName={userInfo.displayName}
                        setShowModal={setShowModal}
                        ToastRef={ToastRef}
                        setReloadUserInfo={setReloadUserInfo}
                    />
                );
                setShowModal(true);
            break;
            case "email":
                setRenderComponent(
                    <ChangeEmailForm
                        email={userInfo.email}
                        setShowModal={setShowModal}
                        ToastRef={ToastRef}
                        setReloadUserInfo={setReloadUserInfo}
                    />
                );
                setShowModal(true);
            break;
            case "password":
                setRenderComponent(
                    <ChangePasswordForm
                        setShowModal={setShowModal}
                        ToastRef={ToastRef}
                        setReloadUserInfo={setReloadUserInfo}
                    />
                );
                setShowModal(true);
            break;
        }
    }
    const menuOptions = generateOptions(selectedComponent); //constante q almacena las opciones de cuenta
    const [showModal, setShowModal] = useState(true); //estado para abrir y cerrar modal
    const [renderComponent, setRenderComponent] = useState(null); //rederigir a componente en el modal

    return (
        <View>
            {map(menuOptions, (menu, index) => (
                <ListItem 
                    key={index}
                    title={menu.title}
                    leftIcon={{
                        type: menu.iconType,
                        name: menu.iconNameLeft,
                        color: menu.iconColorLeft
                    }}
                    rightIcon={{
                        type: menu.iconType,
                        name: menu.iconNameRight,
                        color: menu.iconColorRight
                    }}
                    containerStyle={styles.menuItem}
                    onPress={menu.onPress}
                />
            ))}
            {renderComponent && (
                <Modal isVisible={showModal} setIsVisible={setShowModal}>
                {renderComponent}
                </Modal>
            )}
            
        </View>
    )
}

function generateOptions(selectedComponent){ //recibe parametros, solo los componentes pueden recibir props
    return[
        {
            title: "Cambiar nombre y apellidos",
            iconType: "material-community",
            iconNameLeft: "account-circle",
            iconColorLeft: "#ccc",
            iconNameRight: "chevron-right",
            iconColorRight: "#ccc",
            onPress: () => {
                selectedComponent('displayName')
            }
        },
        {
            title: "Cambiar email",
            iconType: "material-community",
            iconNameLeft: "at",
            iconColorLeft: "#ccc", 
            iconNameRight: "chevron-right",
            iconColorRight: "#ccc",
            onPress: () => {
                selectedComponent('email')
            }
        },
        {
            title: "Cambiar contraseñas",
            iconType: "material-community",
            iconNameLeft: "lock-reset",
            iconColorLeft: "#ccc",
            iconNameRight: "chevron-right",
            iconColorRight: "#ccc",
            onPress: () => {
                selectedComponent('password')
            }
        }
    ]
}

const styles = StyleSheet.create({
    menuItem: {
        borderBottomWidth: 1,
        borderBottomColor: "#e3e3e3",
    },
})