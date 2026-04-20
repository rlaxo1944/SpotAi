import { Image } from 'expo-image';
import { FlatList, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import * as Location from 'expo-location';

//import ChatBot from './RequestApi';
import ChatBot from '@/components/ChatBot';
import LoadingOverlay from '@/components/Loading';
import React, { useMemo, useRef, useCallback, useEffect, useState } from 'react';
import { GoogleGenAI } from "@google/genai";
//import BottomSheet from '@gorhom/bottom-sheet';
import BottomSheet, { BottomSheetView, BottomSheetFlashList } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


export default function HomeScreen() {
  const [articles, setArticles] = useState([]);
  const [AI_RecommendAtion, setAI_RecommendAtion] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requestPermission] = Location.useForegroundPermissions();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const [city, setCity] = useState("위치 가져오는중 ...");
  const [userCity, setUserCity] = useState("");
  const [userChat, setuserChat] = useState("");
  const [gallerySearchList1, setgallerySearchList1] = useState("");
  const [aiBtnVisible, setaiBtnVisible] = useState(true);
  const refSpotList = useRef('');

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['15%', '50%', '85%'], []);  

  let responseAi;

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMsg("위치 권한을 허용해야 합니다.");
        setLocationEnabled(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: 5 });
      const { latitude, longitude } = location.coords;
      const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      const currentCity = `${reverseGeocode[0].region} ${
        reverseGeocode[0].street || reverseGeocode[0].district
      }`;

      setCity(`${reverseGeocode[0].region}`);
      setUserCity(currentCity);

      let keyword = `${reverseGeocode[0].region}`;
      console.log('keyword : ', keyword);

      let url = "https://apis.data.go.kr/B551011/PhotoGalleryService1/gallerySearchList1?numOfRows=1000&MobileOS=AND&MobileApp=test&keyword="+keyword+"&serviceKey=e333fb79fc097309d2d79815ec3e35f17c0868160bf002459401c94a6be7ecbb&_type=json"
      url = encodeURI(url);

      setgallerySearchList1(url);

      console.log(url)
      console.log(currentCity);

      return url;

    } catch (error) {
      console.error("위치 정보를 가져오는 중 오류 발생:", error);
      setErrorMsg("위치 정보를 가져오는 중 오류가 발생했습니다.");
    }
  };

  const ai = new GoogleGenAI({
    apiKey: "AIzaSyC-Wzc1QuVwo3bDyvLBVj5rBrEMGVzsss8"
  });
  
  const requestAi = async (userInput: string) =>{

    const spotList = refSpotList.current.map(v => v.galTitle).join(', ');

    const prompt = `너는 여행 추천 AI 야.

      반드시 사용자의 요구사항을 가장 우선으로 반영해야 한다.
      사용자 요구사항과 맞지 않는 관광지는 추천하면 안 된다.
      관광지 목록에 없는 장소는 절대 추천하면 안 된다.

      사용자의 입력을 먼저 분석해서 아래 항목으로 분류하고 다음 정보를 반드시 추출해야 한다

      [사용자입력]
      ${userChat}

      [분석해야 할 요소]
      - 지역
      - 테마 (예: 벚꽃, 야경, 맛집, 자연)
      - 교통 조건 (예: 지하철 노선, 교통 조건 인근까지 허용)
      - 기타 요구사항

      추출이 어려운 경우에도 추론해서 채워야 한다.
      이 정보를 기반으로 관광지를 추천해야 한다.

      사용자 위치 : ${userCity}
      관광지 목록 : ${spotList}

      작업 규칙:
      1. 사용자 요구사항을 먼저 분석한다.
      2. 관광지 목록 안에서만 고른다.
      4. 요구사항에 가장 맞는 관광지를 추려서 추천한다.
      5. 각 추천마다 왜 추천했는지 이유를 적는다.
      6. 답변은 반드시 JSON만 출력한다.

      출력 형식:
      {
        "keywords": ["관광지1", "관광지2", "관광지3"],
        "reasons": [
          "관광지1": "추천 이유",
          "관광지2": "추천 이유",
          "관광지3": "추천 이유"
        ],
        "analysis": {
          "지역": "",
          "테마": "",
          "교통": "",
          "기타": ""
        }
        "key": "요구사항 핵심 요약 설명",
      }
      `;

    setIsLoading(true);

    console.log(userInput);
    setuserChat(userInput);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      contents: prompt
    })

    let text = JSON.stringify(response.text);

    // ```json 제거
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    console.log(text);

    //---------------------------------------------------------------------------------

    // const mockAiResponse = {
    //   keywords: ["경복궁", "남산타워"]
    // };

    // let text = JSON.stringify(mockAiResponse);
    
    try {
      responseAi = text;
      
      return text;

    } catch (e) {
      console.error("JSON 파싱 실패:", text);
    }
  };

  const keywordGallerySearchList = async (keyword: string) => {
    try{
      setAI_RecommendAtion([]);

      let data = {responseAi};
      //console.log(data.responseAi.replace("", ""));
      let data2 = JSON.parse(data.responseAi.trim())
      let final = JSON.parse(data2)
      console.log(final.keywords)
      console.log(final)
      
      for(let i = 0; i < final.keywords.length; i++)
      {
        console.log("i :", i);
        let keyword = final.keywords[i].toString()
        console.log(keyword);
        let url = "https://apis.data.go.kr/B551011/PhotoGalleryService1/gallerySearchList1?MobileOS=AND&MobileApp=test&keyword="+keyword+"&serviceKey=e333fb79fc097309d2d79815ec3e35f17c0868160bf002459401c94a6be7ecbb&_type=json"
        url = encodeURI(url);

        fetch(url)
        .then(res => res.json())
        .then(data => {
          //setArticles(data.response.body.items.item);
          setIsLoading(false);
          //console.log(data.response.body.items.item)
          //setAI_RecommendAtion(data.response.body.items.item);
          setAI_RecommendAtion(prev => [...prev, ...data.response.body.items.item])
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
      }
    } catch (error) {

    }
  };

  const aiTouch = async () =>{
    if(aiBtnVisible) setaiBtnVisible(false);
    else setaiBtnVisible(true);
  };

  useEffect(() => {
    setaiBtnVisible(false);
    setIsLoading(true);

    console.log('시작');
    getLocation()
    .then(result => {
      fetch(result)
        .then(res => res.json())
        .then(data => {
          setArticles(data.response.body.items.item);
          setAI_RecommendAtion(data.response.body.items.item);
          refSpotList.current = data.response.body.items.item;
          setIsLoading(false);
          //requestAi()
          //.then(data => {
          //keywordGallerySearchList();
          //})
        })
        .catch(err => {
          console.error(err);
          //setIsLoading(false);
        }
      );
    })
  }, []);

  const openChat = () => {
    //bottomSheetRef.current?.expand();
    if(aiBtnVisible){
      bottomSheetRef.current?.close();
    } else {
      bottomSheetRef.current?.snapToIndex(1);
    }
  }

  if (isLoading) {
    return <LoadingOverlay />;
  }

  const styles = StyleSheet.create({
    container: {
      flex: 0.3,
      position: 'absolute',
      width: '20%',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      marginLeft:'auto',
      marginTop:'10%',
    },

    touchable: {
      width: 64,
      height: 64,
    },

    image: {
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },

    floatingButton: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      zIndex: 999,
      elevation: 999, // 안드로이드용
    },
  });

  return (
  <GestureHandlerRootView style={{ flex: 1 }}>
  <View style={{ flex: 1 }}>

    <View style={{ flex: 1 }}>
      <FlatList
          data={AI_RecommendAtion}
          keyExtractor={(item) => item.galContentId.toString()}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 20 }}>
              <Image
                source={{ uri: item.galWebImageUrl }}
                style={{ width: '100%', height: 200 }}
              />
              <Text>{item.galTitle}</Text>
            </View>
          )}
      />

      <View style={styles.floatingButton}>
        <TouchableOpacity style={styles.touchable}
          onPress={openChat}
          >
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.image}
          />
        </TouchableOpacity>
      </View>
    </View>
    
    
      
      <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
          onChange={(index) => {
            setaiBtnVisible(index >= 0);
          }}
          backgroundStyle={{ backgroundColor: 'white' }}
        >
        <BottomSheetView style={{ flex:1}}>
          {
            <ChatBot
              requestAi={requestAi}
              keywordGallerySearchList={keywordGallerySearchList}
              />
          }
        </BottomSheetView>
      </BottomSheet>
  </View>
  </GestureHandlerRootView>
  );
};
