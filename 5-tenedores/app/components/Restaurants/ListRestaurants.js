import React from 'react'
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native'
import { Image } from 'react-native-elements'
import { size } from 'lodash'
import { useNavigation } from '@react-navigation/native'

export default function ListRestaurants(props) {
    const { restaurants, handleLoadMore, isLoading } = props;
    const navigation =  useNavigation();

    return (
        <View>
            {size(restaurants) > 0 ? ( //si viene algo en restaurants...
                <FlatList
                    data={restaurants}
                    renderItem={(restaurant) => //cada restaurant diferente - iteracion
                        <Restaurant 
                            restaurant={restaurant}
                            navigation={navigation}
                        />
                    }
                    keyExtractor={(item, index)=> index.toString()}
                    onEndReachedThreshold={0.5}
                    onEndReached={handleLoadMore}
                    ListFooterComponent={<FooterList isLoading={isLoading}/>}
                />
            ) : ( //si no "cargando"
                <View style={styles.loaderRestaurants}>
                    <ActivityIndicator size="large" /> 
                    <Text>Cargando restaurantes</Text>
                </View>
            )}
        </View>
    )
}

function Restaurant(props){
    const {restaurant, navigation} = props;

    const {id, images, name, description, address} = restaurant.item;
    console.log(name);

    const imageRestaurant = images[0];

    const goRestaurant = () => { //ver restaurant detaller
        console.log("ver restaurant");
        navigation.navigate("restaurant", {
            id: id,
            name: name
        });
    }
    return (
        <TouchableOpacity onPress={goRestaurant}>
            <View style={styles.viewRestaurant}>
                <View style={styles.viewRestaurantImage}>
                    <Image
                        resizeMode="cover"
                        PlaceholderContent={<ActivityIndicator color="#fff"/>}
                        source={
                            imageRestaurant ? {uri:imageRestaurant} : require("../../../assets/img/no-image.png") 
                        }
                        style={styles.imageRestaurant}
                    />
                </View>
                <View>
                    <Text style={styles.restaurantName}>{name}</Text>
                    <Text style={styles.restaurantAddress}>{address}</Text>
                    <Text style={styles.restaurantDescription}>{description.substr(0, 60)}...</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

function FooterList(props){
    const { isLoading } = props;
    if(isLoading){
        return (
            <View style={styles.loaderRestaurants}>
                <ActivityIndicator size="large"/>
            </View>
        )
    }else{
        return(
            <View style={styles.notFoundRestaurant}>
                <Text>No quedan restaurantes por cargar</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    loaderRestaurants:{
        marginTop: 10,
        marginBottom: 10,
        alignItems: "center",
    },
    viewRestaurant:{
        flexDirection: "row",
        margin: 10,
    },
    viewRestaurantImage:{
        marginRight: 15,
    },
    imageRestaurant:{
        width: 80,
        height: 80,
    },
    restaurantName:{
        fontWeight: "bold",
    },
    restaurantAddress:{
        paddingTop: 2,
        color: "grey",
    },
    restaurantDescription:{
        paddingTop: 2, 
        color: "grey",
        width: 300,
    },
    notFoundRestaurant:{
        marginTop: 10,
        marginBottom: 20,
        alignItems:"center",
    },  
})
