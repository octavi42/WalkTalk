import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Platform, NativeModules, NativeEventEmitter } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

// import HomeScreen from '.';


export default function Layout() {
  const colorScheme = useColorScheme();
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const getCompletion = async (message: string) => {
    // console.log("getting completion for: ", message);
    // if (!openAI) return;
    // console.log("openai");

    

    // openAI.chat.stream({
    //   messages: [{ role: 'user', content: message }],
    //   model: 'gpt-4'
    // });

    // openAI.chat.addListener('onChatMessageReceived', (payload: any) => {
    //   setMessages((prevMessages) => [...prevMessages, payload.content]);
    //   console.log("Received message: ", payload.content);
    // });
  };

  const handleSend = async () => {
    console.log("dasdasdasdasdas");
    

    const response = await fetch ('http://localhost:5001/api/completion/', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/event-stream'
      }
    })

    console.log('response body', response.body)
  };

  // useEffect(() => {
  //   return () => {
  //     openAI?.chat.removeListener('onChatMessageReceived');
  //   };
  // }, [openAI]);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* <HomeScreen /> */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>Test OpenAI Chat</Text>
      <TextInput
        style={{
          borderColor: Colors[colorScheme].border,
          borderWidth: 1,
          padding: 10,
          marginBottom: 10,
        }}
        placeholder="Type your message here"
        value={inputMessage}
        onChangeText={setInputMessage}
      />
      <Button title="Send Message" onPress={handleSend} />
      
      <View style={{ marginTop: 20 }}>
        {messages.map((msg, index) => (
          <Text key={index} style={{ padding: 5, borderBottomWidth: 1, borderColor: Colors[colorScheme].border }}>
            {msg}
          </Text>
        ))}
      </View>
    </View>
  );
}
