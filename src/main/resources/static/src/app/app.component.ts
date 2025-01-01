import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WebsocketService } from './services/websocket.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { timestamp } from 'rxjs';
import { animationService } from './services/animation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';  
  username: string='';  //Stores the username entered by the user
  message: string='';  //Stores the message being typed by the user
  messages: any[] = []; //Stores all the chat messages
  isConnected = false; //Tracks whether the user is connected to the WebSocket
  connectingMessage = 'Connceting...';  //Message to show while connecting
  showOnlineUsers: boolean = false;
  onlineUsers: any[] = [];  // Populate this based on your app's user data structure
  currentUser: string = ''; // Update with the logged-in username
  newMessage: string = '';
  onlineUserCount: number = 0;
  constructor(private websocketService:WebsocketService, private backgroundAnimationService: animationService){
    console.log("AppComponent constructor called")
  }

  ngOnInit():void{
    console.log('AppComponent ngOnInit called');
    this.backgroundAnimationService.addBackgroundEffect

    //Subscribe to messages observable to receive messages from the WebSocket service
    this.websocketService.message$.subscribe((message) => {
      if (message) {
        // Check if the message type is 'JOIN' or 'LEAVE' and display appropriate message
        if (message.type === 'JOIN') {
          console.log(`User joined: ${message.sender}`);
          this.messages.push({ sender: message.sender, type: 'JOIN' });
        } else if (message.type === 'LEAVE') {
          console.log(`User left: ${message.sender}`);
          this.messages.push({ sender: message.sender, type: 'LEAVE' });
        } else if (message.type === 'CHAT') {
          if (!message.timestamp) {
            message.timestamp = new Date(); // Add current time if missing
          }
          console.log(`Message received from ${message.sender}: ${message.content}`);
          this.messages.push(message);
        }
      }
    });

    //Subscribe to connection status observable to monitor connection status
  this.websocketService.connectionStatus$.subscribe((connected: boolean | Boolean) => {
    this.isConnected = !!connected;  // Convert the Boolean object to a boolean primitive using double negation
    if (this.isConnected) {
    this.connectingMessage = '';
    console.log('WebSocket connection established');
  }
});
this.updateOnlineUserCount();
  }

  // Method to calculate the count of online users
  updateOnlineUserCount() {
    this.onlineUserCount = this.onlineUsers.filter(u => u.isOnline).length;
  }
  connect(){

    if (!this.username.trim()) {
      // Show an alert if the username is empty
      alert("Please enter a username to start chatting!");
      return;
    }

    console.log('Attempting to connect to WebSocket at http://localhost:8081/ws with username',this.username);
    this.websocketService.connect(this.username);
  }



  sendMessage(){
    if(this.message.trim()){
      const message = {
        sender: this.message,
        content: this.message,
        type:'CHAT',
        timestamp:new Date().toISOString()
      };
      
      this.websocketService.sendMessage(this.username, this.message);
      this.message = '';
      
    }

  }

  getAvatarColor(sender:string):string{
    //Array of colors to choose from
    const colors = ['#2196F3', '#32c787', '#00BCD4', '#ff5652', '#ffc107', '#ff85af', '#39bbb0'];
    let hash = 0;
    for(let i = 0; i<sender.length; i++ ){
      //Generate a hash from the sender's name
      hash = 31*hash + sender.charCodeAt(i);
    }

    //Return a color from the array based on the hash value
    return colors[Math.abs(hash % colors.length)];   
  }
  // Toggle method for online users sidebar
toggleOnlineUsers() {
  this.showOnlineUsers = !this.showOnlineUsers;
}
}
