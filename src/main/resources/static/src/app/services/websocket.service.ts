import { CSP_NONCE, Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  stompclient:Client | null = null;

  //Subject to manage the stream of incoming messages
  private messageSubject = new BehaviorSubject<any>(null);
  public message$ = this.messageSubject.asObservable();

  //Subject to track the connection status (connected/disconnected)
  private connectionSubject = new BehaviorSubject<Boolean>(false);
  public connectionStatus$ = this.connectionSubject.asObservable();

  connect (username:string){
    const socket = new SockJS('http://localhost:8081/ws');//Initialize the SockJS websocket connection to the server

    //Configure the STOMP-Client with connection details
    this.stompclient = new Client({
      webSocketFactory:() =>socket,   //Use SockJS as the WebSocket factory
      reconnectDelay:5000,            //Reconnect delay if connection is lost
      debug:(str) => console.log(str)//log STOMP debug messages for troubleshooting
    });

    //On successful connection
    this.stompclient.onConnect = (frame)=>{
      console.log('Connected to WebSocket server');
      this.connectionSubject.next(true);   //notify that the conncection is successful

      //Subscribe to the '/topic/public' topic to recieve public messages
      this.stompclient?.subscribe('/topic/public', (message:Message)=>{
        this.messageSubject.next(JSON.parse(message.body));
      });

      //Send a "JSON" message to notify the server that a user has joined
      this.stompclient?.publish({
        destination: '/app/chat.addUser',
        body:JSON.stringify({sender:username, type:'JOIN'})
      });
    };

    //Handle errors reported by the STOMP broaker
    this.stompclient.onStompError = (frame) =>{
      console.error('Broker reported error: '+frame.headers['message']);
      console.error('Additional details: '+ frame.body);
    };

    this.stompclient?.activate();
  }

  sendMessage(username:string, content:string){
    if(this.stompclient && this.stompclient.connected){
      //Create achat message object
      const chatMessage = {sender:username, content:content, type:'CHAT'};

      //Publish (send) the message to the '/app/chat.sendMessage' destination
      this.stompclient.publish({
        destination:'/app/chat.sendMessage',
        body: JSON.stringify(chatMessage)
      });
    }else{
      // Log an error if the WebSocket connection is not active
      console.error('WebSocket is not connected. Unable to send message.');
    }
  }

  disconnect(){
    if(this.stompclient){
      this.stompclient.deactivate();
    }
  }

}
