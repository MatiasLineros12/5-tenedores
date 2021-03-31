import React, {useState, useEffect, useRef, useCallback} from "react";
import { View } from "react-native";
import Toast from 'react-native-easy-toast'
import { useFocusEffect } from '@react-navigation/native'
import ListTopRestaurants from '../components/Ranking/ListTopRestaurants'

import {firebaseApp} from '../utils/firebase'
import firebase from 'firebase'
import 'firebase/firestore'
const db = firebase.firestore(firebaseApp);

export default function TopRestaurants(props) {
  const {navigation} = props;
  const [restaurants, setRestaurants] = useState([]);
  const toastRef = useRef();

  useFocusEffect(
    useCallback(() => {
      db.collection("restaurants")
      .orderBy("rating", "desc")
      .limit(5)
      .get()
      .then((response)=>{
        const restaurantsArray = [];
        response.forEach((doc)=>{
          const data = doc.data();
          data.id = doc.id;
          restaurantsArray.push(data);
        });
        setRestaurants(restaurantsArray)
      })
    }, [restaurants])
  )

  return (
    <View>
      <ListTopRestaurants
        navigation={navigation}
        restaurants={restaurants}
      />
      <Toast ref={toastRef} position="center" opacity={0.9} />
    </View>
  );
}
