using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using FairyGUI;
using SimpleJson;
using Pomelo.DotNetClient;
using System;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.Threading;

public class Card
{
    public Card(Card c)
    {
        this.id = c.id;
        this.priority = c.priority;
        this.type = c.type;
    }
    public Card(int id,int priority,int type)
    {
        this.id = id;
        this.priority = priority;
        this.type = type;
    }

    public Card(JToken i)
    {
        id = (int)(i["id"]);
        priority = (int)(i["priority"]);
        type = (int)(i["type"]);
        
    }

    public int id;
    public int priority;
    public int type;


    public static bool operator ==(Card first, Card second)
    {
        return first.id == second.id ? true : false;
    }
    public static bool operator !=(Card first, Card second)
    {
        return first.id != second.id ? true : false;
    }
    public bool Equals(Card second)
    {
        return id == second.id ? true : false;
    }
}
public class CardManager
{
    public CardManager(int x,int y,int width,int height,int cardwidth,int cardheight, GButton[] BtnCardList)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.cardwidth = cardwidth;
        this.cardheight = cardheight;
        this.BtnCardList = BtnCardList ;
      
        cards = new List<Card>();
        
        for (int i=0;i<BtnCardList.Length;i++)
        {
            BtnCardList[i].data = i;
            BtnCardList[i].onClick.Add(CardClicked);
        }
   
    }
    int x;
    int y;
    int width;
    int height;
    int cardwidth;
    int cardheight;
    GComponent poker;
    GButton[] BtnCardList;

    int choosen=-1;

    private List<Card> cards;

    public void addcards(Card newcard)
    {
        cards.Add(newcard);
    }

 
    public void deletecards(Card oldcard)
    {
        foreach(Card i in cards)
        {
            if(i==oldcard)
            {
                cards.Remove(i);
            }
        }
    }
    public void SetPosition(int x ,int y,int index)
    {
        Loom.QueueOnMainThread(() => {//切换为主线程

            BtnCardList[index].visible = true;
            BtnCardList[index].SetPosition(x, y, 0);
        });
        
    }
    public void Init()
    {

        cards.Sort((a, b) =>
        {
            return a.id-b.id;
        });
        int totalwidth = ((this.cards.Count + 1) * (this.cardwidth / 2));
        int X = (this.width - totalwidth) / 2 + this.x;
        int Y = (this.y + this.height - this.cardheight);
        for(int i = 0; i < cards.Count; i++)
        {
            
            SetPosition(X, Y, cards[i].id);
            X += (this.cardwidth / 2);
        }
    
    }


    void CardClicked(EventContext context)
    {

        this.Init();
        int index = (int)((GObject)context.sender).data;
        //BtnCardList[index].SetPosition(0, 0, 0);
        if(choosen==index)
        {
            choosen = -1;
        }
        else
        {
            BtnCardList[index].SetPosition(BtnCardList[index].position.x, BtnCardList[index].position.y - 20, BtnCardList[index].position.z);
            choosen = index;
        }
        
        this.choosen = index;

        


    }
}
public class Player
{
    public CardManager cardmanager;
    public GButton[] BtnCard;
    public Player(GComponent _mainView)
    {
        UIPanel = _mainView;
        BtnCard = new GButton[70];
        GComponent cards;
        cards = _mainView.GetChild("cards").asCom;

        for (int i = 0; i < BtnCard.Length; i++)
        {
            BtnCard[i]=(cards.GetChild("card" + i.ToString()).asButton); 
            //BtnCard[i].visible = false;
            //BtnCard[i].SetPosition(0, 0, -1);
           
        }

        cardmanager = new CardManager(20, 450,680,150,100,130, BtnCard);
    }
    private GComponent UIPanel;
}

//this.gamestate = {
//            state: "wating",// wating  running
//            playernum:parseInt(playernum),
//            playerlist: [],//new Player
//            turn: 'all', //uid  all
//            action: 'sell',//sell buy
//            sellcard: [],//new Card

//        };


//class Card
//{
//    constructor(id, priority, type)
//    {
//        this.id = id;
//        this.priority = priority;
//        this.type = type;
//    }
//}
//class Player
//{
//    constructor(session)
//    {
//        this.userid = session.uid;
//        this.frontendId = session.frontendId;
//        this.ready = false;
//        this.money = 100; //资金
//        this.buycard = []; //买到的画作
//        this.buymoney = 0; //购买画作的钱
//        this.host = false; //是否为主持
//    }
//}

class MsgPlayer
{
    public MsgPlayer(JToken obj)
    {
        buycard = new List<Card>();
        userid = obj["userid"].ToString();
        ready = (bool)obj["ready"];
        money = (int)obj["money"];
        buymoney = (int)obj["buymoney"];
        host = (bool)obj["host"];
        JArray jsonbuycard = (JArray)JsonConvert.DeserializeObject(obj["buycard"].ToString());
        foreach (var i in jsonbuycard)
        {
            buycard.Add(new Card(i));
        }

    }
    public string userid;
    public bool ready;
    public int money;
    public List<Card> buycard;
    public int buymoney;
    public bool host;
  
    
}


class MsgData
{
    public MsgData(JToken obj)
    {
        playerlist = new List<MsgPlayer>();
        sellcard = new List<Card>();
        state = obj["state"].ToString();
        playernum = (int)(obj["playernum"]);
        turn = obj["turn"].ToString();
        action = obj["action"].ToString();
        JArray jsonplayerlist = (JArray)JsonConvert.DeserializeObject(obj["playerlist"].ToString());
        foreach(var i in jsonplayerlist)
        {
            playerlist.Add(new MsgPlayer(i));
        }

        JArray jsonsellcard = (JArray)JsonConvert.DeserializeObject(obj["sellcard"].ToString());
        foreach (var i in jsonsellcard)
        {
            sellcard.Add(new Card(i));
        }


    }
    public string state;
    public int playernum;
    public List<MsgPlayer> playerlist;
    public string turn;
    public string action;
    public List<Card> sellcard;


}
public class GamePanel : MonoBehaviour
{
    private PomeloClient pclient = Login.pomeloClient;
    private GComponent _mainView;
    private GComponent userpanel;
    private GComponent cards;
    private GComponent _message;
    private GButton sendMessageButton;
    private GButton SellButton;
    private GButton BuyButton;
    private GButton TestButton;
    private GButton ReadyButton;
    

    private GTextField messageText;
    private GTextField chatText;
    private GTextField Money;
    private GTextField Asset;
    private string rid = RoomChoose.rid;
    private string username = Login.username;
    private Player LocalPlayer;

    private MsgData olddata;
    private MsgData newdata;

    // Start is called before the first frame update
    void Start()
    {


        
        // 找到各个控件

        _mainView = this.GetComponent<UIPanel>().ui;
        LocalPlayer = new Player(_mainView);
        userpanel = _mainView.GetChild("userpanel").asCom;
        cards= _mainView.GetChild("cards").asCom;
   




        SellButton = userpanel.GetChild("n2").asButton;
        BuyButton = userpanel.GetChild("n11").asButton;
        ReadyButton = userpanel.GetChild("n12").asButton;
        Money = userpanel.GetChild("n10").asTextField;
        Asset = userpanel.GetChild("n14").asTextField;
        

        ReadyButton.onClick.Add(BtnReady);

        

        //sendMessageButton.onClick.Add(BtnSendMessage);
        //pclient.on("onChat", (data)=>
        //{
        //    chatText.text += data["msg"] + "\n";
        //});
        pclient.on("onGameStart", (data) =>
        {
            
            Debug.unityLogger.Log("game start");
            Debug.unityLogger.Log(data["money"]);
            Asset.text = (string)data["money"];


        });
        pclient.on("onAddCard", (data) =>
        {
            Debug.unityLogger.Log(data);
            JArray cards = (JArray)JsonConvert.DeserializeObject(data["cards"].ToString());
            foreach (var i in cards)
            {
                LocalPlayer.cardmanager.addcards(new Card((int)i["id"], (int)i["priority"], (int)i["type"]));
            }
            //for (int i=0;i<3;i++)
            //{
            //    LocalPlayer.cardmanager.addcards(new Card(i, i,i));
            //}
            LocalPlayer.cardmanager.Init();
            
            
         
        });
        pclient.on("GameNotify", (data) =>
        {

            OnProcessGameState(data);
           


        });
        JsonObject msg = new JsonObject();
        pclient.request("game.gameHandler.GetGameState", msg, null);

    }
    int GetPosition()
    {
        for(int i=0;i<newdata.playerlist.Count;i++)
        {
            if(newdata.playerlist[i].userid==Login.username)
            {
                return i;
            }
        }
        return -1;
       
    }
    void TransferMsg(JToken obj)
    {
        newdata = new MsgData(obj);
    }

    void ProcessMsg()
    {
        int pos = GetPosition();
        if(pos!=-1)
        {
            for(int i=1;i<newdata.playernum;i++)
            {
                int realpos = (i + pos) % newdata.playernum;
                if (realpos>=newdata.playerlist.Count)
                    continue;
                GTextField playername = _mainView.GetChild("playername"+i.ToString()).asTextField;
                playername.text = newdata.playerlist[realpos].userid;
            }
        
        }
        if(newdata.state=="running")
        {
            Loom.QueueOnMainThread(() => {//切换为主线程

                ReadyButton.visible = false;
            });
            
        }
        
    }
    private void OnProcessGameState(JsonObject obj)
    {
        JObject jobject = (Newtonsoft.Json.Linq.JObject)Newtonsoft.Json.JsonConvert.DeserializeObject(obj.ToString());
        TransferMsg(jobject["data"]);
        ProcessMsg();
        olddata = newdata;
     



    }

    void BtnReady()
    {
        JsonObject msg = new JsonObject();
        msg["type"] = "prepare";
        pclient.request("game.gameHandler.GameAction", msg, OnPrePare);
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
        pclient.request("game.gameHandler.prepare", msg, OnPrePare);

    }

    void OnPrePare(JsonObject obj)
    {
        
        ReadyButton.color = new Color(255, 0, 255);
  
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
