import React, { useEffect, useRef, useState } from 'react';
//import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { BottomSheetFlashList } from "@gorhom/bottom-sheet";

type ChatBotProps = {
    requestAi : (userInput: string) => Promise<void>;
    keywordGallerySearchList : (keyword: string) => Promise<void>;
};

export default function ChatBot({requestAi, keywordGallerySearchList,} : ChatBotProps) {

  const listRef = useRef<any>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd?.({ animated: true });
    });
  };

  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', text: '안녕하세요. 관광지를 추천해드릴게요.' },
  ]);
  const [input, setInput] = useState('');

  const handlePress = async () =>{
    if (!input.trim()) return;

    const userMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text: input,
    };

    const botMessage = {
      id: `${Date.now()}-response`,
      role: 'assistant',
      text: '추천할 관광지를 찾는 중이에요.',
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);

    let test = `{"responseAi": {"analysis": {"교통": "특정 조건 없음 (추론: 대중교통 이용 편리한 곳 위주)", "기타": "없음", "지역": "서울", "테마": "특정 테마 없음 (추론: 입력 부재로  일반적인 관광지 선호)"}, "key": "사용자 입력이 없어 서울의 대표적이고 접근성이 좋은 관광지를 추천합니다.", "keywords": ["반포대교", "경복궁", "코엑스"], "reasons": {"경복궁": "서울의 역사와 문화를 대표하는 가장 중요한 궁궐입니다. 고궁의 아름다움과 함께 '경복궁 수문장 교대의식' 등 다양한 볼거리를 제공하여, 특별한 요구
사항이 없을 때 추천하기 좋은 서울의 상징적인 장소입니다. '경복궁'은 관광지 목록에 있습니다.", "반포대교": "사용자 위치인 서초구와 인접하여 접근성이 좋고, 한강 
의 아름다운 경관과 야경을 즐길 수 있는 서울의 대표적인 명소입니다. '반포대교'는 관광지 목록에 있습니다.", "코엑스": "강남 지역에 위치하여 서초구에서 비교적 접 
근성이 좋고, 쇼핑, 문화, 엔터테인먼트 등 다양한 활동을 한 곳에서 즐길 수 있는 복합 문화 공간입니다. '코엑스'는 관광지 목록에 있습니다."}}}`

    const mockAiResponse = {
      responseAi : {
        keywords: ["경복궁", "남산타워"],
        analysis: {"교통": "특정 조건 없음 (추론: 대중교통 이용 편리한 곳 위주)", "기타": "없음", "지역": "서울", "테마": "특정 테마 없음 (추론: 입력 부재로  일반적인 관광지 선호)"},
        key: "사용자 입력이 없어 서울의 대표적이고 접근성이 좋은 관광지를 추천합니다.",
        reasons: {"경복궁": "서울의 역사와 문화를 대표하는 가장 중요한 궁궐입니다. 고궁의 아름다움과 함께 '경복궁 수문장 교대의식' 등 다양한 볼거리를 제공하여, 특별한 요구사항이 없을 때 추천하기 좋은 서울의 상징적인 장소입니다. '경복궁'은 관광지 목록에 있습니다.", "반포대교": "사용자 위치인 서초구와 인접하여 접근성이 좋고, 한강의 아름다운 경관과 야경을 즐길 수 있는 서울의 대표적인 명소입니다. '반포대교'는 관광지 목록에 있습니다.", "코엑스": "강남 지역에 위치하여 서초구에서 비교적 접근성이 좋고, 쇼핑, 문화, 엔터테인먼트 등 다양한 활동을 한 곳에서 즐길 수 있는 복합 문화 공간입니다. '코엑스'는 관광지 목록에 있습니다."}
      }
    };

    let text = mockAiResponse;

    let test2 = JSON.stringify(text);
    let test3 = JSON.parse(test2);
    let final = test3.responseAi.reasons;
    console.log("final : ",final);
    
    let str = "";
    for(let key in final){
        str = str + "\r\n" + '['+key+']' + " : " + final[key];
    }

    const responseMessage = {
        id: `${Date.now()}-response`,
        role: 'assistant',
        text: str,
    };

    setMessages((prev) => [...prev, responseMessage]);

    setInput('');
  }
  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
    };

    const botMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: '추천할 관광지를 찾는 중이에요.',
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput('');
  };

  useEffect(() => {
  requestAnimationFrame(() => {
    listRef.current?.scrollToEnd?.({ animated: true });
  });
}, [messages]);

  const styles = StyleSheet.create({
        wrapper: {
            flex: 1,
        },
        chatContainer: {
            flex: 1,
        },
        listContent: {
            padding: 16,
            paddingBottom: 8,
        },
        messageBox: {
            marginBottom: 10,
            padding: 12,
            borderRadius: 12,
            maxWidth: '80%',
        },
        userBox: {
            alignSelf: 'flex-end',
            backgroundColor: '#dbeafe',
        },
        botBox: {
            alignSelf: 'flex-start',
            backgroundColor: '#f3f4f6',
        },
        roleText: {
            fontWeight: '700',
            marginBottom: 4,
        },
        inputArea: {
            borderTopWidth: 1,
            borderColor: '#e5e7eb',
            padding: 12,
            backgroundColor: '#fff',
        },
        input: {
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            padding: 10,
            minHeight: 44,
            maxHeight: 100,
            marginBottom: 10,
            backgroundColor: '#fff',
        },
        sendButton: {
            backgroundColor: 'blue',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
        },
        sendButtonText: {
            color: 'white',
            fontWeight: '600',
        },
        listArea: {
            flex: 1,
            minHeight: 0,
        },
    })

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={20}
    >
    <View style={styles.chatContainer}>
        <View style={styles.listArea}>
            <BottomSheetFlashList
            ref={listRef}
            data={messages}
            style={{ flex: 1 }}
            keyExtractor={(item) => item.id}
            estimatedItemSize={80}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
                <View
                style={[
                    styles.messageBox,
                    item.role === 'user' ? styles.userBox : styles.botBox,
                ]}
                >
                <Text style={styles.roleText}>
                    {item.role === 'user' ? '나' : '봇'}
                </Text>
                <Text>{item.text}</Text>
                </View>
            )}
            />
        </View>

        <View style={styles.inputArea}>
        <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="메시지를 입력하세요"
            style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            padding: 10,
            marginBottom: 10,
            }}
        />

        <TouchableOpacity
            onPress={handlePress}
            style={{
            backgroundColor: 'blue',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            }}
        >
            <Text style={{ color: 'white' }}>전송</Text>
        </TouchableOpacity>
        </View>
    </View>
    </KeyboardAvoidingView>
  );
}