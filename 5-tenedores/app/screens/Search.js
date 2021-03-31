import React, {useState, useEffect} from "react";
import { View, StyleSheet, FlatList, Image } from "react-native";
import { SearchBar, ListItem, Icon } from 'react-native-elements'
import { FireSQL } from 'firesql'
import firebase from 'firebase/app'

const fireSQL = new FireSQL(firebase.firestore(), {includeId: "id"}); 

export default function Search(props) {
  const { navigation } = props;
  const [search, setSearch] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  console.log(restaurants);

  useEffect(() => {
    console.log(search);
    if(search){
      fireSQL.query(`SELECT * FROM restaurants WHERE name LIKE '${search}%'`)
      .then((response)=>{
        setRestaurants(response);
      })
    }
  }, [search]) //si se actualiza search se ejecuta el efecto

  return (
    <View>
      <SearchBar
        placeholder="Busca tu restaurante..."
        onChangeText={(e) => setSearch(e)}
        value={search}
        containerStyle={styles.searchBar}
      />
      {restaurants.length === 0 || search.length === 0 ? (
        <NoFoundRestaurants/>
      ) : (
      <FlatList
      data={restaurants}
      renderItem={(restaurant)=> <Restaurant restaurant={restaurant} navigation={navigation} />}
      keyExtractor={(item, index) => index.toString()}
      >
      </FlatList>
      )}

    </View>
  );
}

function NoFoundRestaurants() {
  return (
  <View style={{flex: 1, alignItems: "center", marginTop:50}}>
    <Image
      source={require("../../assets/img/no-result-found.png")}
      resizeMode="cover"
      style={{width:200,height:200}}
    />
  </View>
  )
}

function Restaurant(props){
  const {restaurant, navigation} = props;
  const { id, name, images, } = restaurant.item;

  return (
    <ListItem
      title={name}
      leftAvatar={{
        source: images[0] ? {uri:images[0]} : require("../../assets/img/no-image.png")
      }}
      rightIcon={<Icon type="material-community" name="chevron-right" />}
      onPress={()=> navigation.navigate("restaurants",{screen:"restaurant", params:{id, name}})} //stack, screen, params
    />
  )
}

const styles = StyleSheet.create({
  searchBar:{
    marginBottom: 20,
  },
})
