import React, {useState, useRef, useCallback} from "react";
import { StyleSheet, View, Text, FlatList, ActivityIndicator, Touchable, Alert } from "react-native";
import { Image, Icon, Button } from 'react-native-elements'
import { useFocusEffect } from '@react-navigation/native'
import {size} from 'lodash'
import Toast  from 'react-native-easy-toast'
import Loading from '../components/Loading'

import {firebaseApp} from '../utils/firebase'
import firebase from 'firebase'
import 'firebase/firestore'
import { TouchableOpacity } from "react-native-gesture-handler";

const db = firebase.firestore(firebaseApp);

export default function Favorites(props) {
  const { navigation } = props;
  const [restaurants, setRestaurants] = useState(null)
  const [userLogged, setUserLogged] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [reloadData, setReloadData] = useState(false) //si cambia esto se actualizan los restaurantes favoritos
  const toastRef = useRef()
  console.log(restaurants);
  firebase.auth().onAuthStateChanged((user)=>{
    user ?  setUserLogged(true) : setUserLogged(false);
  })
  
  useFocusEffect(
    useCallback(() => {
        if(userLogged){
          const idUser = firebase.auth().currentUser.uid;
          db.collection("favorites")
          .where("idUser", "==", idUser)
          .get()
          .then((response)=>{
            const idRestaurantsArray = [];
            response.forEach((doc)=>{
              idRestaurantsArray.push(doc.data().idRestaurant);
            });
            getDataRestaurant(idRestaurantsArray).then((response)=>{
              const restaurants = [];
              response.forEach((doc)=>{
                const restaurant = doc.data();
                restaurant.id = doc.id;
                restaurants.push(restaurant);
              });
              setRestaurants(restaurants)
            });
          });
        }
        setReloadData(false);
      }, [userLogged, reloadData],) //se ejecuta cuando userlogged se modifique
  );

  const getDataRestaurant = (idRestaurantsArray) => {
    const arrayRestaurants = [];
    idRestaurantsArray.forEach((idRestaurant)=>{
      const result = db.collection("restaurants").doc(idRestaurant).get();
      arrayRestaurants.push(result);
    });
    return Promise.all(arrayRestaurants); //promise, para q la app espere q todos los datos esten cargados
  };

  if(!userLogged){
    return <UserNoLogged navigation={navigation} />
  }
  
  if(!restaurants){
    return <Loading isVisible={true} text="Cargando" />;
  } else if(size(restaurants) === 0){
    return <NotFoundRestaurants />;
  }

  return (
    <View style={styles.viewBody}>
      <FlatList 
        data={restaurants}
        renderItem={(restaurant) => <Restaurant 
                                      restaurant={restaurant} 
                                      setIsLoading={setIsLoading} 
                                      toastRef={toastRef} 
                                      setReloadData={setReloadData}
                                      navigation={navigation}
                                    />}
        keyExtractor={(item, index)=>index.toString()}
      />
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <Loading text="Eliminando" isVisible={isLoading}/>
    </View>
  );
}

function NotFoundRestaurants(){
  return (
    <View style={{ flex:1, alignItems:"center",justifyContent:"center" }}>
        <Icon type="material-community" name="alert-outline" size={50} />
        <Text style={{fontSize: 20, fontWeight:"bold"}}>
          Aún no tienes restaurantes favoritos
        </Text>
    </View>
  );
}

function UserNoLogged(props){
  const {navigation} = props;
  return (
    <View style={{ flex:1, alignItems:"center",justifyContent:"center" }}>
        <Icon type="material-community" name="alert-outline" size={50} />
        <Text style={{fontSize: 20, fontWeight:"bold", textAlign:"center"}}>
          Necesita estar logeado para ver esta sección
        </Text>
        <Button 
          title="Inicia sesión"
          containerStyle={{marginTop:20, width:"80%"}}
          buttonStyle={{backgroundColor: "#00a680"}}
          onPress={()=>{navigation.navigate("login")}} //si esto produce error, ver video 149.
        />
    </View>
  );
}

function Restaurant(props){
  const { restaurant, setIsLoading, toastRef, setReloadData, navigation } = props;
  const { id, name, images } = restaurant.item;

  const confirmRemoveFavorite = () => {
    Alert.alert(
      "Eliminar restaurante de favoritos",
      "¿Estás seguro?",
      [
        {
          text: "Cancelar",
          style: "Cancel"
        },
        {
          text: "Eliminar",
          onPress: removeFavorite
        }
      ],
      {
        cancelable: false
      }
    )
  }

  const removeFavorite = () => {
    setIsLoading(true);
    db.collection("favorites")
    .where("idRestaurant", "==", id)
    .where("idUser", "==", firebase.auth().currentUser.uid)
    .get()
    .then((response)=>{
      response.forEach((doc)=>{
        const idFavorite = doc.id;
        db.collection("favorites")
        .doc(idFavorite)
        .delete()
        .then(()=>{
          console.log("eliminado");
          setIsLoading(false);
          setReloadData(true);
          toastRef.current.show("Eliminado correctamente")
        })
        .catch(()=>{
          console.log("error");
          setIsLoading(false);
          toastRef.current.show("Error al eliminar correctamente")
        })
      })
    })
  }

  const goRestaurant = () => {
    navigation.navigate("restaurant", {
      id: id,
      name: name
    });
  }

  return (
    <View style={styles.restaurant}>
      <TouchableOpacity onPress={goRestaurant}>
        <Image 
          resizeMode="cover"
          style={styles.image}
          PlaceholderContent={<ActivityIndicator color="#fff" />}
          source={
            images[0] ? {uri:images[0]} : require("../../assets/img/no-image.png") 
          }
        />
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Icon
            type="material-community"
            name="heart"
            color="#00a680"
            containerStyle={styles.favorite}
            onPress={confirmRemoveFavorite}
            underlayColor="transparent"
          />
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  viewBody:{
    flex: 1,
    backgroundColor: "#f2f2f2"
  },
  restaurant:{
    margin: 10
  },
  image:{
    width: "100%",
    height: 180
  },
  info:{
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 10,
    paddingTop: 10,
    marginTop: -30,
    backgroundColor: "#fff"
  },
  name:{
    fontWeight: "bold",
    fontSize: 30
  },
  favorite:{
    marginTop: -35,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 100
  }
})