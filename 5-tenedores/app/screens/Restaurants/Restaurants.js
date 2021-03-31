import React, {useState, useEffect, useCallback} from "react";
import { StyleSheet, View, Text } from "react-native";
import { Icon } from 'react-native-elements'
import {firebaseApp} from "../../utils/firebase"
import firebase from "firebase/app";
import "firebase/firestore";
import {useFocusEffect} from "@react-navigation/native";
import ListRestaurants  from "../../components/Restaurants/ListRestaurants";

const db = firebase.firestore(firebaseApp);

export default function Restaurants(props) {
  const { navigation } = props;
  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [totalRestaurants, setTotalRestaurants] = useState(0);
  const [startRestaurants, setStartRestaurants] = useState(null); //por donde empezará
  const [isLoading, setIsLoading] = useState(false);
  const limitRestaurants = 10;

  useEffect(() => { //si estamos logeados
    firebase.auth().onAuthStateChanged((userInfo) => {
      console.log(userInfo);
      setUser(userInfo);
    })
  }, [])

  useFocusEffect( //trae los datos de restaurantes y lo actualiza... remplazo de useEffect useFocusEffect
    useCallback(()=>{
      db.collection("restaurants").get().then((snap) =>{ //then... pq devuelve una promise
        setTotalRestaurants(snap.size); //cantidad de restaurantes almacenados en la bd
      });
  
      const resultRestaurants = [];
  
      db.collection("restaurants")
        .orderBy("createdAt", "desc")
        .limit(limitRestaurants)
        .get()
        .then((response) => {
          //console.log(response); //trae los 10 ultimos restaurants ingresados
          setStartRestaurants(response.docs[response.docs.length - 1]);
  
          response.forEach((doc) => {
            //console.log(doc.data); //trae los datos
            //console.log(doc.id);
            const restaurant = doc.data(); //convierte en objeto
            restaurant.id = doc.id; //agrega un id a cada objeto
            resultRestaurants.push(restaurant); //lo agrega al arreglo
          })
          setRestaurants(resultRestaurants); //guarda el arreglo en la constante principal de la screen
          console.log(restaurants);
        });
    }, [])
  );

  const handleLoadMore = () => {
    const resultRestaurants = [];
    restaurants.lenght < totalRestaurants &&  setIsLoading(true);

    db.collection("restaurants").orderBy("createdAt", "desc")
    .startAfter(startRestaurants.data().createdAt)
    .limit(limitRestaurants)
    .get()
    .then((response) => {
      if(response.docs.length > 0){
        setStartRestaurants(response.docs[response.docs.length - 1]);
      }else{
        setIsLoading(false);
      }
      response.forEach((doc)=>{
        const restaurant = doc.data();
        restaurant.id = doc.id;
        resultRestaurants.push(restaurant);
      });
      setRestaurants([...restaurants, ...resultRestaurants]);
    });
  }

  return (
    <View style={styles.viewBody}>
      <ListRestaurants 
        restaurants={restaurants}
        handleLoadMore={handleLoadMore}
        isLoading={isLoading}
      />
      {user && (
        <Icon 
          type="material-community"
          name="plus"
          color="#00a680"
          reverse
          containerStyle={styles.btnContainer}
          onPress={()=> navigation.navigate("add-restaurant")} //nombre de screen
        />
      )}
      
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody:{
    flex:1,
    backgroundColor: "#fff",
  },
  btnContainer:{
    position: "absolute",
    bottom: 10,
    right: 10,
    shadowColor: "black",
    shadowOffset:{
      width:2, height:2 //positivo y negativo, derecha-arriba e izquierda-abajo
    },
    shadowOpacity: 0.5,
  }
})