using System.Collections;
using System.Collections.Generic;
using UnityEngine.SceneManagement;
using UnityEngine;
using UnityEngine.UI;
using FairyGUI;
using SimpleJson;
using Pomelo.DotNetClient;
using System;

public class RoomChoose : MonoBehaviour
{
    private PomeloClient pclient = Login.pomeloClient;
    private GComponent _mainView;
    private GObject _CreateBtn;
    private GObject _JoinBtn;
    public static string rid;

    private string username = Login.username;
    private GTextField roomidobj;
    protected bool _bNeedLoadScene = false;
    // Start is called before the first frame update
    void Start()
    {
      
        // 找到各个控件
        _mainView = this.GetComponent<UIPanel>().ui;

        _CreateBtn = _mainView.GetChild("n3");
        _JoinBtn = _mainView.GetChild("n4");
        roomidobj = _mainView.GetChild("n5").asCom.GetChild("n2").asTextField;
        _CreateBtn.onClick.Add(BtnCreateRoom);
        _JoinBtn.onClick.Add(BtnJoinRoom);
        

    }

    // Update is called once per frame
    void Update()
    {
        if (_bNeedLoadScene)
        {
            // 场景切换
            SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex + 1);
        }

    }
    void BtnCreateRoom()
    {
        Debug.unityLogger.Log("button clicked");
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex + 1);
    }
    void BtnJoinRoom()
    {
        Debug.unityLogger.Log("button clicked");
        JsonObject msg = new JsonObject();
        rid = (roomidobj.text);
        msg["rid"] = rid;
        msg["username"] = username;
        pclient.request("connector.entryHandler.enter", msg, OnConnect);

        //SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex + 1);
    
    }

    void OnConnect(JsonObject result)
    {
        _bNeedLoadScene = true;
    }
}
