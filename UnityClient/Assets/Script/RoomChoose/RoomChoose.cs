using System.Collections;
using System.Collections.Generic;
using UnityEngine.SceneManagement;
using UnityEngine;
using UnityEngine.UI;
using FairyGUI;
using SimpleJson;
using Pomelo.DotNetClient;
using System;
using Newtonsoft.Json.Linq;

public class RoomChoose : MonoBehaviour
{
    private PomeloClient pclient = Login.pomeloClient;
    private GComponent _mainView;
    private GObject _CreateBtn;
    private GObject _JoinBtn;
    public static string rid;
    public static string playernum;
    private int iplayernum;

    private string username = Login.username;
    private GTextField roomidobj;
    private GTextField playernumobj;
    protected bool _bNeedLoadScene = false;

    // Start is called before the first frame update
    void Start()
    {
      
        // 找到各个控件
        _mainView = this.GetComponent<UIPanel>().ui;

        _CreateBtn = _mainView.GetChild("n3");
        _JoinBtn = _mainView.GetChild("n4");
        roomidobj = _mainView.GetChild("n8").asCom.GetChild("n2").asTextField;
        playernumobj = _mainView.GetChild("n7").asCom.GetChild("n2").asTextField;
        _CreateBtn.onClick.Add(BtnCreateRoom);
        _JoinBtn.onClick.Add(BtnJoinRoom);
        

    }

    // Update is called once per frame
    void Update()
    {
        if (_bNeedLoadScene)
        {
            // 场景切换
            if(iplayernum==3)
                SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex + 1);
            if (iplayernum == 4)
                SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex + 2);
            if (iplayernum == 5)
                SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex + 3);
        }

    }
    void BtnCreateRoom()
    {
        Debug.unityLogger.Log("button clicked");
        //SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex + 1);
        JsonObject msg = new JsonObject();
        rid = (roomidobj.text);
        
        playernum = playernumobj.text;
        if (playernum == "")
        {
            playernum = "4";
        }
        msg["rid"] = rid;
        msg["playernum"] = playernum;
        pclient.request("game.gameHandler.CreateRoom", msg, JoinRoom);
    }
    void BtnJoinRoom()
    {
        Debug.unityLogger.Log("button clicked");
        JsonObject msg = new JsonObject();
        rid = (roomidobj.text);
        
        msg["rid"] = rid;
       
        pclient.request("game.gameHandler.JoinRoom", msg, JoinRoom);

        //SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex + 1);
    
    }

    void JoinRoom(JsonObject res)
    {
        JObject jobject = (Newtonsoft.Json.Linq.JObject)Newtonsoft.Json.JsonConvert.DeserializeObject(res.ToString());
        if (jobject["result"].ToString()=="success")
        {
            _bNeedLoadScene = true;
            iplayernum = (int)jobject["playernum"];
        }
      
    }
}
