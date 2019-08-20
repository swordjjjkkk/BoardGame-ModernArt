using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using FairyGUI;
using SimpleJson;
using Pomelo.DotNetClient;
using System;

public class GamePanel : MonoBehaviour
{
    private PomeloClient pclient = Login.pomeloClient;
    private GComponent _mainView;
    private GComponent _chatArea;
    private GComponent _message;
    private GButton sendMessageButton;
    private GTextField messageText;
    private GTextField chatText;
    private string rid = RoomChoose.rid;
    private string username = Login.username;

    // Start is called before the first frame update
    void Start()
    {
        // 找到各个控件
        _mainView = this.GetComponent<UIPanel>().ui;
        _chatArea = _mainView.GetChild("n18").asCom;

        sendMessageButton = _chatArea.GetChild("n5").asButton;
        _message = _chatArea.GetChild("n6").asCom;
        messageText = _message.GetChild("n2").asTextField;
        chatText = _chatArea.GetChild("n7").asTextField;

        sendMessageButton.onClick.Add(BtnSendMessage);
        pclient.on("onChat", (data)=>
        {
            chatText.text += data["msg"] + "\n";
        });

    }

    void GetMessage(JsonObject obj)
    {
        
    }

    void BtnSendMessage()
    {
        JsonObject msg = new JsonObject();
     
        msg["content"] = messageText.text;
        msg["from"] = username;
        msg["target"] = "*";
        pclient.request("chat.chatHandler.send", msg, OnSendMessage);
   
    }

    void OnSendMessage(JsonObject obj)
    {
        Debug.unityLogger.Log("send over");
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
