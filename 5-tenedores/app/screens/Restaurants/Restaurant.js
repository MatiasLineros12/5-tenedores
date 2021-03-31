import React, {useState, useEffect, useCallback, useRef} from 'react'
import { StyleSheet, ScrollView, Text, View, Dimensions } from 'react-native'
import {map} from 'lodash'
import {Rating, ListItem, Icon} from 'react-native-elements'
import {useFocusEffect} from '@react-navigation/native'
import Loading from "../../components/Loading"
import Carousel from '../../components/Carousel'
import Map from '../../components/Map'
import ListReviews from '../../components/Restaurants/ListReviews'
import Toast from 'react-native-easy-toast'

import { firebaseApp } from '../../utils/firebase'
import firebase from "firebase/app"
import "firebase/firestore"

const db = firebase.firestore(firebaseApp);
const screenWidth = Dimensions.get("window").width;

export default function Restaurant(props) {
    const {navigation, route} = props;
    const { id, name } = route.params;
    navigation.setOptions({title: name});

    const [restaurant, setRestaurant] = useState(null);
    const [rating, setRating] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [userLogged, setUserLogged] = useState(false);
    const toastRef = useRef();

    firebase.auth().onAuthStateChanged((user)=>{
        user ? setUserLogged(true) : setUserLogged(false);
    });

    useFocusEffect(
        useCallback(() => {
            db.collection("restaurants")
            .doc(id)
            .get()
            .then((response)=>{
                const data = response.data();
                data.id = response.id;
                setRestaurant(data);
                setRating(data.rating);
            })
        }, [])
    );

    useEffect(() => {
        if(userLogged && restaurant){ //si el usuario esta logeado y existe un restaurant
            db.collection("favorites")
            .where("idRestaurant", "==", restaurant.id)
            .where("idUser", "==", firebase.auth().currentUser.uid)
            .get()
            .then((response)=>{
                if(response.docs.length == 1){
                    setIsFavorite(true);
                }else{
                    setIsFavorite(false);
                }
            })
        }
    }, [userLogged, restaurant]) //cada vez q el userLoggen cambie o el restaurant sea diferente al actual, se ejecutara el useEffect

    const addFavorite = () => {
        if(!userLogged){
            toastRef.current.show("Debes estar autenticado");
        }else{
            const payload = {
                idUser: firebase.auth().currentUser.uid,
                idRestaurant: id,
            }
            db.collection("favorites")
            .add(payload)
            .then(()=>{
                setIsFavorite(true);
                toastRef.current.show("Añadido correctamente");
            })
            .catch(()=>{
                toastRef.current.show("Error al añadir restaurante a favoritos");
            })
        }
    }

    const removeFavorite = () => {
        db.collection("favorites")
            .where("idRestaurant", "==", restaurant.id)
            .where("idUser", "==", firebase.auth().currentUser.uid)
            .get()
            .then((response)=>{
                response.forEach((doc)=>{
                    const idFavorite = doc.id;
                    db.collection("favorites")
                    .doc(idFavorite)
                    .delete()
                    .then(()=>{
                        setIsFavorite(false);
                        toastRef.current.show("Eliminado de favoritos correctamente");
                    })
                    .catch(()=>{
                        toastRef.current.show("Error al eliminar");
                    });
                });
            });
    };

    if(!restaurant){
        return <Loading isVisible={true} text="Cargando..." />;
    }

    return (
        <ScrollView vertical style={styles.viewBody}>
            <View style={styles.viewFavorites}>
                <Icon 
                    type="material-community"
                    name={isFavorite ? "heart" : "heart-outline"}
                    onPress={ isFavorite ? removeFavorite : addFavorite}
                    color={isFavorite ? "#00a680" : "#000"}
                    size={35}
                    underlayColor="transparent"
                />
            </View>
            <Carousel 
                arrayImages={restaurant.images}
                height={250}
                width={screenWidth}
            /> 
            <TitleRestaurant 
                name={restaurant.name}
                description={restaurant.description}
                rating={rating}
            />   
            <RestaurantInfo
                location={restaurant.location}
                name={restaurant.name}
                address={restaurant.address}
            />
            <ListReviews
                navigation={navigation}
                idRestaurant={restaurant.id}
            />
            <Toast ref={toastRef} position="center" opacity={0.9} />
        </ScrollView>
    )
}

function TitleRestaurant(props){
    const {name, description, rating} = props;
    return (
        <View style={styles.viewResturantTitle}>
            <View style={{flexDirection: "row"}}>
                <Text style={styles.nameRestaurant}>{name}</Text>
                <Rating
                    style={styles.rating}
                    imageSize={20}
                    readonly
                    startingValue={parseFloat(rating)}
                />
            </View>
            <Text style={styles.descriptionRestaurant}>{description}</Text>
        </View>
    )
}

function RestaurantInfo(props){
    const { location, name, address } = props;

    const ListInfo = [
        {
            text: address,
            iconName: "map-marker",
            iconType: "material-community",
            action: null,
        }
    ]

    return (
        <View style={styles.viewResturantInfo}>
            <Text style={styles.restaurantInfoTitle}>
                Información sobre el restaurante
            </Text>
            <Map location={location} name={name} height={100} />
        {map(ListInfo, (item, index) => (
            <ListItem 
                key={index}
                title={item.text}
                leftIcon={{
                    name: item.iconName,
                    type: item.iconType,
                    color: "#00a680"
                }}
                containerStyle={styles.containerListItem}
            />
        ))}
        </View>
    )

}

const styles = StyleSheet.create({
    viewBody:{
        flex: 1,
        backgroundColor: "#fff"
    },
    viewResturantTitle:{
        padding: 15,
    },
    nameRestaurant:{
        fontSize: 15,
        fontWeight: "bold",
    },
    descriptionRestaurant:{
        marginTop: 5,
        color: "grey",
    },
    rating:{
        position: "absolute",
        right: 0,
    },
    viewResturantInfo:{
        margin: 15, 
        marginTop: 25,
    },
    restaurantInfoTitle:{
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    containerListItem:{
        borderBottomColor: "#d8d8d8",
        borderBottomWidth: 1,
    },
    viewFavorites:{
        position: "absolute",
        top: 0,
        right:0,
        zIndex: 2,
        backgroundColor: "#fff",
        borderBottomLeftRadius: 100,
        padding: 5,
        paddingLeft: 15,
    }
})
