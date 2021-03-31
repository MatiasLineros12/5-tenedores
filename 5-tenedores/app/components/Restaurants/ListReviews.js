import React, {useState, useEffect, useCallback} from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Button, Avatar, Rating } from 'react-native-elements'
import { useFocusEffect } from '@react-navigation/native'
import { map } from 'lodash'

import {firebaseApp} from '../../utils/firebase'
import firebase from 'firebase/app'
import 'firebase/firestore'

const db = firebase.firestore(firebaseApp);

export default function ListReviews(props) {
    const {navigation, idRestaurant} = props;
    const [userLogged, setUserLogged] = useState(false) //estado para verificar usuario logeado
    const [reviews, setReviews] = useState([])

    firebase.auth().onAuthStateChanged((user)=>{ //pregunta a firebase backend 
        user ?  setUserLogged(true) : setUserLogged(false);
    })

    useFocusEffect(
        useCallback(() => {
            db.collection("reviews")
            .where("idRestaurant", "==", idRestaurant)
            .get()
            .then((response)=>{
                const resultReview = []
                response.forEach(doc => {
                    //console.log(doc.data()); //trae las reviews
                    const data = doc.data();
                    data.id = doc.id;
                    resultReview.push(data);
                });
                setReviews(resultReview);
            });
        }, [reviews])
    );

    return (
        <View>
            {userLogged ? (
                <Button
                    title="Escribe una opinión"
                    buttonStyle={styles.btnAddReview}
                    titleStyle={styles.btnTitleAddReview}
                    icon={{
                        type: "material-community",
                        name: "square-edit-outline",
                        color: "#00a680"
                    }}
                    onPress={()=> navigation.navigate("add-review-restaurant",{idRestaurant:idRestaurant})}
                />
            ) : (
                <View>
                    <Text 
                    style={{textAlign: "center", color:"#00a680", padding:20}}
                    onPress={()=>navigation.navigate("login")}
                    >Es necesario iniciar sesión para comentar{" "}
                        <Text style={{fontWeight: "bold"}}>pulsa AQUÍ para iniciar sesión</Text>
                    </Text>
                </View>
            )}
            {map(reviews, (review, index) => (
                <Review key={index} review={review} />
            ))}
        </View>
    )
}

function Review(props){
    const { title, review, rating, createdAt, avatarUser } = props.review;
    const createdReview = new Date(createdAt.seconds * 1000);
    return(
        <View style={styles.viewReview}>
            <View style={styles.viewImageAvatar}>
                <Avatar
                    size="large"
                    rounded
                    containerStyle={styles.imageAvatar}
                    source={avatarUser ? {uri:avatarUser} : require("../../../assets/img/avatar-default.jpg")}
                />
            </View>
            <View style={styles.viewInfo}>
                <Text style={styles.reviewTitle}>{title}</Text>
                <Text style={styles.reviewText}>{review}</Text>
                <Rating
                    imageSize={15}
                    startingValue={rating}
                    readonly
                />
                <Text style={styles.reviewDate}>
                    {createdReview.getDate()}/{createdReview.getMonth() + 1}/{createdReview.getFullYear()}
                    -
                    {createdReview.getHours()}:{createdReview.getMinutes() < 10 ? "0" : ""}{createdReview.getMinutes()}
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    btnAddReview:{
        backgroundColor: "transparent",
    },
    btnTitleAddReview:{
        color: "#00a680",
    },
    viewReview:{
        flexDirection: "row",
        padding: 10,
        paddingBottom:20,
        borderBottomColor: "#e3e3e3",
        borderBottomWidth: 1
    },
    viewImageAvatar:{
        marginRight: 15,
    },
    imageAvatar:{
        width: 50,
        height: 50,
    },
    viewInfo:{
        flex: 1,
        alignItems: "flex-start"
    },
    reviewTitle:{
        fontWeight: "bold"
    },
    reviewText:{
        padding: 2,
        color: "grey",
        marginBottom: 5,
    },
    reviewDate:{
        marginTop: 5,
        color: "grey",
        fontSize: 12,
        position: "absolute",
        right:0,
        bottom:0
    }
})
