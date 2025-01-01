package com.chat.controller;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import java.util.Objects;

@Controller
public class WsChatController {

    @Autowired
    SimpMessageSendingOperations messagingTemplate;
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public WsChatMessage sendMessage(@Payload WsChatMessage msg){
        // Log the sender and content of the message for debugging
        System.out.println("Message received from "+ msg.getSender()+": "+msg.getContent());

        //Broadcast the user join event to all subscribers on the "/topic/public" topic
        return msg;
    }

    @MessageMapping("chat.addUser")
    @SendTo("/topic/chat")
    public WsChatMessage addUser(@Payload WsChatMessage msg, SimpMessageHeaderAccessor headerAccessor){
        // Store the username in the WebSocket session attributes
        //Objects.requireNonNull(headerAccessor.getSessionAttributes()).put("username", msg.getSender());
        headerAccessor.getSessionAttributes().put("username", msg.getSender());
        msg.setType(WsChatMessageType.JOIN);
        messagingTemplate.convertAndSend("/topic/public", msg);

        //Log when a user joins the chat
        System.out.println("User joined: "+msg.getSender());

        //Broadcast the user join event to the all subscribers on the "/topic/chat" topic
        return msg;
    }
}
