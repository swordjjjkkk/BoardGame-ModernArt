using System.Collections;
using System.Collections.Generic;
using UnityEngine.SceneManagement;
using UnityEngine;
using UnityEngine.UI;
using FairyGUI;
using SimpleJson;
using Pomelo.DotNetClient;
using System;

public class Login : MonoBehaviour
{

    public static PomeloClient pomeloClient = null;
    public static string username ;

    private GComponent _mainView;
    private GComponent infield_username;

    private GButton btn_login;
    private GTextField obj_username;


    protected bool _bNeedLoadScene = false;

    // Start is called before the first frame update
    void Start()
    {
     
        // 找到各个控件
        _mainView = this.GetComponent<UIPanel>().ui;

        btn_login = _mainView.GetChild("n2").asButton;

        infield_username= _mainView.GetChild("n1").asCom;
        obj_username=infield_username.GetChild("n2").asTextField;
        

        btn_login.onClick.Add(BtnLogin);
        

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
    void BtnLogin()
    {

        username = obj_username.text;
        string host = "127.0.0.1"; // gate的host和port
        int port = 15014;

        pomeloClient = new PomeloClient();

        //listen on network state changed event
        pomeloClient.NetWorkStateChangedEvent += (state) =>
        {
            Debug.unityLogger.Log("CurrentState is:" + state);
        };

        // 请求gate服务器，得到connector服务器的host和clientPort
        pomeloClient.initClient(host, port, () =>
        {
           
            // user 消息传递给 gate.gateHandler.queryEntry
            JsonObject user = new JsonObject();
           
            pomeloClient.connect(user, data =>
            {
                //process handshake call back data
                JsonObject msg = new JsonObject();
                msg["uid"] = obj_username.text;
                pomeloClient.request("gate.gateHandler.queryEntry", msg, OnQuery);
            });
        });
        //SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex + 1);
        //SceneManager.LoadScene("Assets/Scenes/RoomChoose", LoadSceneMode.Single);
    }

    void OnQuery(JsonObject result)
    {
        if (Convert.ToInt32(result["code"]) == 200)
        {
        
            pomeloClient.disconnect();

            string connectorHost = (string)result["host"];
            int connectorPort = Convert.ToInt32(result["port"]);

            Debug.unityLogger.Log(connectorHost);
            Debug.unityLogger.Log(connectorPort);
            pomeloClient.initClient(connectorHost, connectorPort, () =>
            {
                //The user data is the handshake user params
                JsonObject user = new JsonObject();
                pomeloClient.connect(user, data =>
                {
                    Entry();
                });
            });


        }
    }

    void Entry()
    {
      
        Debug.unityLogger.Log("entry1");
        Debug.unityLogger.Log("entry2");
        _bNeedLoadScene = true;
        Debug.unityLogger.Log("entry3");
        Debug.unityLogger.Log("entry4");
    }
}
