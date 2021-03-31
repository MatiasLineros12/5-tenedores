import React, {useState, useEffect} from 'react'
import { StyleSheet, View, ScrollView, Alert, Dimensions} from 'react-native'
import { Icon, Avatar, Image, Input, Button } from 'react-native-elements'
import { map, size, filter } from 'lodash'
import * as Permissions from "expo-permissions"
import * as ImagePicker from "expo-image-picker"
import * as Location from 'expo-location'
import MapView from "react-native-maps";
import uuid from "random-uuid-v4"
import Modal from "../Modal"

import { firebaseApp}  from "../../utils/firebase"
import firebase from "firebase/app"
import "firebase/storage"
import "firebase/firestore"
const db = firebase.firestore(firebaseApp);

const widthScreen =  Dimensions.get("window").width; //solo los componentes comienzan con mayuscula

export default function AddRestaurantForm(props){
    const {toastRef, setIsLoading, navigation} = props; //llega por props AddRestaurant.js

    const [restaurantName, setRestaurantName] = useState(""); //variable para almacenar nombre
    const [restaurantAddress, setRestaurantAddress] = useState(""); //variable para almacenar dirección
    const [restaurantDescription, setRestaurantDescription] = useState("") //variable para almacenar descripcion
    const [imageSelected, setImageSelected] = useState([]); //arreglo para almacenar las imagenes

    const [isVisibleMap, setIsVisibleMap] = useState(false); //estado para mostrar un modal
    const [locationRestaurant, setLocationRestaurant] = useState(null) //variable para almacenar la ubicacion

    const addRestaurant = () => { //funcion del onPress para guardar un restaurant
        console.log("click en guardar");
        /*
        console.log(restaurantName);
        console.log(restaurantAddress);
        console.log(restaurantDescription);
        */
        console.log(imageSelected);
        if(!restaurantName || !restaurantAddress || !restaurantDescription){
            toastRef.current.show("Todos los campos son obligatorios");
        }else if(size(imageSelected) === 0){
            toastRef.current.show("El restaurante debe tener al menos una foto");
        }else if(!locationRestaurant){
            toastRef.current.show("Debes seleccionar una ubicación");
        }else{//si llega aca es pq las validaciones estan bien
            setIsLoading(true);
            uploadImageStorage().then((response)  => { 
                //console.log(response); //devuelve array de url de imagenes
                db.collection("restaurants")
                    .add({
                        name: restaurantName,
                        address: restaurantAddress,
                        description: restaurantDescription,
                        location: locationRestaurant,
                        images: response,
                        rating: 0,
                        ratingTotal: 0,
                        quantityVoting: 0,
                        createdAt: new Date(),
                        createBy: firebase.auth().currentUser.uid,
                    })
                    .then(()=>{
                        setIsLoading(false);
                        console.log("resturant almacenado");
                        navigation.navigate("restaurants");
                    }).catch(()=>{
                        setIsLoading(false);
                        toastRef.current.show("Error al subir restaurante");
                    });
            });
        }
    };

    const uploadImageStorage = async () => { //funcion para almacenar imagenes en el storage
        const imageBlob = [];

        await Promise.all(
            map(imageSelected, async (image) => {
                const response = await fetch(image);
                const blob = await response.blob();
                const ref = firebase.storage().ref("restaurants").child(uuid());
                await ref.put(blob).then(async(result) => {
                    await firebase
                            .storage()
                            .ref(`restaurants/${result.metadata.name}`)
                            .getDownloadURL()
                            .then((photoUrl) => {
                                imageBlob.push(photoUrl);
                            });
                });
            })
        );
        return imageBlob;
    };

    return(
        <ScrollView styles={styles.ScrollView}>
            <ImageRestaurant imagenRestaurant={imageSelected[0]}/>
            <FormAdd //se le pasan estos parametros y se reciben por post
                setRestaurantName={setRestaurantName}
                setRestaurantAddress={setRestaurantAddress}
                setRestaurantDescription={setRestaurantDescription}
                setIsVisibleMap={setIsVisibleMap}
                locationRestaurant={locationRestaurant} //debo pasarle este parametro, para llega al icono de maps y cambiar su color
            />
            <UploadImage 
                toastRef={toastRef}
                setImageSelected={setImageSelected}
                imageSelected={imageSelected}
            />
            <Button 
                title="Crear restaurante"
                onPress={addRestaurant}
                buttonStyle={styles.btnAddRestaurant}
            />
            <Map 
                isVisibleMap={isVisibleMap}
                setIsVisibleMap={setIsVisibleMap}
                setLocationRestaurant={setLocationRestaurant}
                toastRef={toastRef}
            />
        </ScrollView>
    )
}

function ImageRestaurant(props){ //funcion para mostrar la primera imagen seleccionada
    const {imagenRestaurant} = props;
    return (
        <View style={styles.viewPhoto}>
            <Image 
            source={ 
                imagenRestaurant ? {uri: imagenRestaurant} : require("../../../assets/img/no-image.png")} 
            style={{width: widthScreen, height: 200}}
            />
        </View>
    );
}

function FormAdd(props){ //componente interno para el form del restaurant
    //props corresponden a los useState creados: name, adress y description
    const {setRestaurantName, setRestaurantAddress, setRestaurantDescription, setIsVisibleMap, locationRestaurant} = props;
    
    return (
        <View style={styles.ViewForm}>
            <Input 
                placeholder="Nombre del restaurante"
                containerStyle={styles.input}
                onChange={e => setRestaurantName(e.nativeEvent.text)}
            />
            <Input 
                placeholder="Dirección del restaurante"
                containerStyle={styles.input}
                onChange={e => setRestaurantAddress(e.nativeEvent.text)}
                rightIcon={{
                    type: "material-community",
                    name: "google-maps",
                    color: locationRestaurant ? "#00a680" : "#c2c2c2",
                    onPress: () => setIsVisibleMap(true)
                }}
            />
            <Input 
                placeholder="Descripción del restaurante"
                multiline={true}
                inputContainerStyle={styles.textArea}
                onChange={(e) => setRestaurantDescription(e.nativeEvent.text)}
            />
        </View>
    );
}

function Map(props){
    const {isVisibleMap, setIsVisibleMap, setLocationRestaurant, toastRef} = props; //llegan de main
    const [location, setLocation] = useState(null);

    useEffect(() => { //useEffect para almacenar la ubicacion del restaurant
       (async()=>{ //asincrona pq debe esperar al usuario
           const resultPermissions = await Permissions.askAsync(
               Permissions.LOCATION
           );
           console.log(resultPermissions); //muestra permiso obtenido
           const statusPermissions = resultPermissions.permissions.location.status;
           if(statusPermissions !== "granted"){ //si es denegado
               toastRef.current.show("Debes aceptar el permiso de ubicación", 3000);
           }else{ //si es aceptado
               const loc = await Location.getCurrentPositionAsync({}); //espera ubicacion del usuario
               console.log(loc);
               setLocation({ //cambiar parametros de ubicacion
                   latitude: loc.coords.latitude,
                   longitude: loc.coords.longitude,
                   latitudeDelta: 0.001,
                   longitudeDelta: 0.001,
               });
           }
       })();
    }, []);

    const confirmLocation = () => { //funcion para guardar la ubicacino 
        setLocationRestaurant(location);
        toastRef.current.show("Localización guardada correctamente");
        setIsVisibleMap(false); //cierra modal
    };

    return ( // <Modal> necesita esas dos propiedades, isvisiable y setisvisible
        <Modal isVisible={isVisibleMap} setIsVisible={setIsVisibleMap}> 
            <View>
                {location && (
                    <MapView 
                        style={styles.mapStyle}
                        initialRegion={location}
                        showsUserLocation={true}
                        onRegionChange={(region)=>setLocation(region)}
                    >
                        <MapView.Marker 
                            coordinate={{
                                latitude: location.latitude,
                                longitude: location.longitude,
                            }}
                            draggable
                        />
                    </MapView>
                )}
                <View style={styles.viewMapBtn}>
                    <Button 
                        title="Guardar ubicación"
                        containerStyle={styles.viewMapBtnContainerSave}
                        buttonStyle={styles.viewMapBtnSave}
                        onPress={confirmLocation}
                    />
                    <Button 
                        title="Cancelar ubicación"
                        containerStyle={styles.viewMapBtnContainerCancel}
                        buttonStyle={styles.viewMapBtnCancel}
                        onPress={() => setIsVisibleMap(false)}
                    />
                </View>
            </View>
        </Modal>
    );
}

function UploadImage(props){
    const {toastRef, imageSelected, setImageSelected} = props;
    const imageSelect = async() => { //asincrono, ya q la app debera esperar a q el user seleccione una imagen para continuar el proceso
        //console.log("imagenes");
        const resultPermissions = await Permissions.askAsync(//obtiene permiso
            Permissions.CAMERA_ROLL
        );
        //console.log(resultPermissions);
        if(resultPermissions === "denied"){ //si es denegado
            toastRef.current.show("Debes aceptar los permisos", 5000);
        }else{ //si es aceptado
            const result = await ImagePicker.launchImageLibraryAsync({ // await pq debemos esperar la seleccion de una imagen para continuar
                allowsEditing: true,
                aspect: [4, 3],
            });
            if(result.cancelled){ //si cancela 
                toastRef.current.show("Has cerrado la galeria sin seleccionar imagen", 3000);
            }else{ //si selecciona
                //console.log(result.uri);
                setImageSelected(result.uri);
                setImageSelected([...imageSelected, result.uri]);
            }
        }
    };

    const removeImage = (image) => { //funcion para eliminar la imagen seleccionada
        
        Alert.alert(
            "Eliminar Imagen",
            "¿Estas seguro?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    onPress: ()=>{
                        //console.log("Eliminado");
                        setImageSelected(
                            filter(imageSelected, (imageUrl) => imageUrl !== image)
                        );
                    },
                },
            ],
            {
                cancelable: false
            }
        );
    };

    return ( //size para manipular tamaño de algo, array, string, etc
        <View style={styles.viewImage}>
            {size(imageSelected) < 4 && ( //si es menor a 5 q se ponga el icon
                <Icon 
                type="material-community"
                name="camera"
                color="#7a7a7a"
                containerStyle={styles.containerIcon}
                onPress={imageSelect}
                />
            )} 
            
            {map(imageSelected, (imageRestaurant, index) => (
                <Avatar 
                    key={index}
                    style={styles.miniatureStyle}
                    source={{ uri: imageRestaurant }}
                    onPress={()=>removeImage(imageRestaurant)}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    ScrollView:{
        height: "100%",
    },
    ViewForm:{
       marginLeft: 10,
       marginRight: 10 
    },
    input:{
        marginBottom: 10,
    },
    textArea:{
        height: 100,
        width: "100%",
        padding: 0,
        margin: 0,
    },
    btnAddRestaurant:{
        backgroundColor: "#00a680",
        margin: 20,
    },  
    viewImage:{
        flexDirection: "row",
        marginLeft: 20,
        marginRight: 20,
        marginTop: 30,
    },
    containerIcon:{
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
        height: 70,
        width: 70,
        backgroundColor: "#e3e3e3",
    },  
    miniatureStyle:{
        width: 70,
        height: 70,
        marginRight: 10,
    },
    viewPhoto:{
        alignItems: "center",
        height: 200,
        marginBottom: 20
    },
    mapStyle:{
        width: "100%",
        height: 480,
    },
    viewMapBtn:{
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
    },
    viewMapBtnContainerCancel:{
        paddingLeft: 5,
    },
    viewMapBtnCancel:{
        backgroundColor: "#a60b0d",
    },
    viewMapBtnContainerSave:{
        paddingRight: 5,
    },
    viewMapBtnSave:{
        backgroundColor: "#00a680",
    },
})