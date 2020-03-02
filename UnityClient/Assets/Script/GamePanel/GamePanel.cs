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
using Assets.Script.GamePanel;



public class GamePanel : MonoBehaviour
{
    private PomeloClient pclient = Login.pomeloClient;
    private GComponent _mainView;
    private GComponent userpanel;
    private GComponent deskpanel;
    private GComponent cards;
    private GComponent _message;
    private GButton sendMessageButton;
    private GButton SellButton;
    private GButton BuyButton;
    private GButton DealButton;
    private GButton TestButton;
    private GButton AgreeButton;
    private GButton DisAgreeButton;
    private GButton UnionButton;
    private GButton GiveupButton;
    private GButton ReadyButton;
    private GTextField playermsg;
    

    private GTextField messageText;
    private GTextField chatText;
    private GTextField Money;
    private GTextField Asset;
    private string rid = RoomChoose.rid;
    private string username = Login.username;


    private UserCardRender usercardrender;
    private CardRender sellcardrender;
    private CardRender localbuycardrender;

    private List<CardRender> buycardrender;

    private MsgData olddata;
    private MsgData newdata;
    private GButton[] BtnCard;

    // Start is called before the first frame update
    void Start()
    {


        
        // 找到各个控件

        _mainView = this.GetComponent<UIPanel>().ui;
    
        userpanel = _mainView.GetChild("userpanel").asCom;
        deskpanel = _mainView.GetChild("deskarea").asCom;
        cards= _mainView.GetChild("cards").asCom;



        AgreeButton = userpanel.GetChild("agree").asButton;
        DisAgreeButton = userpanel.GetChild("disagree").asButton;
        DealButton = userpanel.GetChild("deal").asButton;
        SellButton = userpanel.GetChild("n2").asButton;
        UnionButton = userpanel.GetChild("union").asButton;
        GiveupButton = userpanel.GetChild("giveup").asButton;
        BuyButton = userpanel.GetChild("n11").asButton;
        ReadyButton = userpanel.GetChild("n12").asButton;
        Money = userpanel.GetChild("n10").asTextField;
        Asset = userpanel.GetChild("n14").asTextField;
        playermsg = userpanel.GetChild("n16").asTextField;
        

        ReadyButton.onClick.Add(BtnReady);
        SellButton.onClick.Add(SellCard);
        BuyButton.onClick.Add(BuyCard);
        DealButton.onClick.Add(DealCard);
        AgreeButton.onClick.Add(BuyChooseAgree);
        DisAgreeButton.onClick.Add(BuyChooseDisAgree);
        UnionButton.onClick.Add(UnionAgree);
        GiveupButton.onClick.Add(UnionDisagree);

        buycardrender = new List<CardRender>();

        //初始化CardRender

        BtnCard = new GButton[70];



        for (int i = 0; i < BtnCard.Length; i++)
        {
            BtnCard[i] = (cards.GetChild("card" + i.ToString()).asButton);
    

        }
        GGraph sellarea = deskpanel.GetChild("n13").asGraph;
        GGraph cardarea = userpanel.GetChild("n17").asGraph;
        GGraph localbuyarea = userpanel.GetChild("n15").asGraph;
        usercardrender = new UserCardRender((int)(cardarea.x + userpanel.x), (int)(cardarea.y + userpanel.y) - 3, (int)cardarea.width, (int)cardarea.height, 100, 130, BtnCard);
        sellcardrender = new CardRender((int)(sellarea.x + deskpanel.x), (int)(sellarea.y + deskpanel.y) - 3, (int)sellarea.width, (int)sellarea.height, 100, 130, BtnCard);
        localbuycardrender = new CardRender((int)(localbuyarea.x + userpanel.x), (int)(localbuyarea.y + userpanel.y) - 3, (int)localbuyarea.width, (int)localbuyarea.height, 30, 40, BtnCard);

        JsonObject msg = new JsonObject();
        pclient.request("game.gameHandler.GetPlayerNum", msg, (data1)=>
        {
            JObject jobject = (Newtonsoft.Json.Linq.JObject)Newtonsoft.Json.JsonConvert.DeserializeObject(data1.ToString());
            int playernum = (int)(jobject["playernum"]);
            for(int i=1;i<playernum;i++)
            {
                GComponent otherplayer = _mainView.GetChild("otherplayer" + i.ToString()).asCom;
                GGraph otherbuyarea = otherplayer.GetChild("n3").asGraph;
                buycardrender.Add(new CardRender((int)(otherbuyarea.x + otherplayer.x), (int)(otherbuyarea.y + otherplayer.y) - 3, (int)otherbuyarea.width, (int)otherbuyarea.height, 30, 40, BtnCard));
            }
        });

        pclient.on("onGameStart", (data) =>
        {
            
            Debug.unityLogger.Log("game start");
            Debug.unityLogger.Log(data["money"]);
            Asset.text = (string)data["money"];


        });
   
            
         

        pclient.on("GameNotify", (data) =>
        {

            OnProcessGameState(data);
           


        });
        JsonObject msg2 = new JsonObject();
        pclient.request("game.gameHandler.GetGameState", msg2, null);

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
            //显示准备按钮
            if(newdata.state=="waiting")
            {
                Loom.QueueOnMainThread(() => {//切换为主线程

                    ReadyButton.visible = true;
                    
                    if(newdata.playerlist[pos].ready)
                    {
                        ReadyButton.color = new Color(255, 0, 255);
                    }
                    else
                    {
                        ReadyButton.color = new Color(0, 0, 0);
                    }
                    
                });

            }
            //资金和姓名显示
            GTextField money = userpanel.GetChild("n14").asTextField;
            GTextField name = userpanel.GetChild("n18").asTextField;
            money.text = newdata.playerlist[pos].money.ToString();
            name.text = newdata.playerlist[pos].userid;
            for(int i=1;i<newdata.playernum;i++)
            {
                int realpos = (i + pos) % newdata.playernum;
                if (realpos>=newdata.playerlist.Count)
                    continue;
                GComponent otherplayer = _mainView.GetChild("otherplayer"+i.ToString()).asCom;
                GTextField playername = otherplayer.GetChild("playername").asTextField;
                playername.text = newdata.playerlist[realpos].userid+(newdata.playerlist[realpos].ready?"已准备":"未准备");
            }
            //手牌显示
            usercardrender.Clear();
            foreach (var i in newdata.playerlist[pos].handcards)
            {
                usercardrender.addcards(i);
            }
            usercardrender.Init();
            for(int i=1;i<newdata.playerlist.Count;i++)
            {
                int otherpos = (i + pos) % newdata.playerlist.Count;
                GComponent otherplayer = _mainView.GetChild("otherplayer" + i.ToString()).asCom;
                foreach(var j in newdata.playerlist[otherpos].handcards)
                {
                    int temp = j.id;
                    Loom.QueueOnMainThread(() => {//切换为主线程

                        BtnCard[temp].SetPosition(otherplayer.x, otherplayer.y, 0);
                    });
                    
                }

            }

            //显示正在售卖的牌
            sellcardrender.Clear();
            foreach(var i in newdata.sellcard)
            {
                sellcardrender.addcards(i);
            }
            sellcardrender.Init();

            //显示提示信息
            GComponent deskarea = _mainView.GetChild("deskarea").asCom;
            GTextField commonmsg = deskarea.GetChild("commonmsg").asTextField;
            commonmsg.text = newdata.commonmsg;
            GTextField localmsg = userpanel.GetChild("n16").asTextField;
            localmsg.text = newdata.playerlist[pos].playermsg;
            for(int i=1;i<newdata.playerlist.Count;i++)
            {
                GTextField othermsg = _mainView.GetChild("otherplayer" + i.ToString()).asCom.GetChild("n4").asTextField;
                othermsg.text = newdata.playerlist[(i + pos) % newdata.playerlist.Count].playermsg;
            }

            //显示购买钱数
            GTextInput localbuymoney = userpanel.GetChild("n10").asTextInput;
            string tempstring = newdata.playerlist[pos].buymoney.ToString();

            Loom.QueueOnMainThread(() => {//切换为主线程

                localbuymoney.text = tempstring;
            });

            //显示一口价选择按钮
            if (newdata.playerlist[pos].actionlist.Contains("choose"))
            {
                Loom.QueueOnMainThread(() => {//切换为主线程

                    AgreeButton.visible = true;
                    DisAgreeButton.visible = true;
                });
                if (newdata.playerlist[pos].host)
                {
                    Loom.QueueOnMainThread(() => {//切换为主线程

                        
                        DisAgreeButton.visible = false;
                    });
                }
            }
            else
            {
                Loom.QueueOnMainThread(() => {//切换为主线程

                    AgreeButton.visible = false;
                    DisAgreeButton.visible = false;
                });
            }

        }
        //游戏开始隐藏准备按钮
        if (newdata.state=="running")
        {
            Loom.QueueOnMainThread(() => {//切换为主线程

                ReadyButton.visible = false;
            });
            
        }

        //显示联合选择按钮
        if (newdata.playerlist[pos].actionlist.Contains("chooseunion"))
        {
            
            if (newdata.playerlist[pos].host)
            {
                Loom.QueueOnMainThread(() => {//切换为主线程

                    UnionButton.visible = false;
                    GiveupButton.visible = true;
                });
            }
            else
            {
                Loom.QueueOnMainThread(() => {//切换为主线程

                    UnionButton.visible = true;
                    GiveupButton.visible = true;
                });
            }

        }
        else
        {
            Loom.QueueOnMainThread(() => {//切换为主线程
                UnionButton.visible = false;
                GiveupButton.visible = false;
            });
        }

        //显示成交按钮
        if (newdata.playerlist[pos].actionlist.Contains("deal"))
        {
            Loom.QueueOnMainThread(() => {//切换为主线程

                DealButton.visible = true;
            });

        }
        else
        {
            Loom.QueueOnMainThread(() => {//切换为主线程

                DealButton.visible = false;
            });
        }

        //显示画的价值
        deskpanel.GetChild("n8").text = newdata.cardvalue[0].ToString();
        deskpanel.GetChild("n9").text = newdata.cardvalue[1].ToString();
        deskpanel.GetChild("n10").text = newdata.cardvalue[2].ToString();
        deskpanel.GetChild("n11").text = newdata.cardvalue[3].ToString();
        deskpanel.GetChild("n12").text = newdata.cardvalue[4].ToString();

        //显示购买到的牌
        localbuycardrender.Clear();
        foreach(var i in buycardrender)
        {
            i.Clear();
        }
      
        for(int i=0;i<newdata.playerlist.Count;i++)
        {
            
            for (int j = 0; j < newdata.playerlist[i].buycard.Count; j++)
            {
                GImage temp = BtnCard[newdata.playerlist[i].buycard[j].id].GetChild("n1").asImage;
                Loom.QueueOnMainThread(() => {//切换为主线程
                    temp.visible = false;
                });


                if (i == pos)
                {
                    localbuycardrender.addcards(newdata.playerlist[i].buycard[j]);
                    localbuycardrender.Init();
                }
                else
                {
                    if(i<pos)
                    {
                        buycardrender[i + newdata.playernum - pos-1].addcards(newdata.playerlist[i].buycard[j]);
                        buycardrender[i + newdata.playernum - pos-1].Init();
                    }
                    else
                    {
                        buycardrender[i - pos-1].addcards(newdata.playerlist[i].buycard[j]);
                        buycardrender[i - pos-1].Init();
                    }
                    
                }
            }
            
        }
        


    }
    private void OnProcessGameState(JsonObject obj)
    {
        JObject jobject = (Newtonsoft.Json.Linq.JObject)Newtonsoft.Json.JsonConvert.DeserializeObject(obj.ToString());
        TransferMsg(jobject["data"]);
        ProcessMsg();
        if(olddata.state=="waiting" && newdata.state == "running")
        {
            Loom.QueueOnMainThread(() => {//切换为主线程
                
                for (int i = 0; i < BtnCard.Length; i++)
                {
                    GImage temp = BtnCard[i].GetChild("n1").asImage;
                    temp.visible = true;
                }
            });
        }
        olddata = newdata;
     



    }
    private void DealCard(EventContext context)
    {
        JsonObject msg = new JsonObject();
        msg["type"] = "deal";
        pclient.request("game.gameHandler.GameAction", msg, null);
    }

    void BtnReady()
    {
        JsonObject msg = new JsonObject();
        msg["type"] = "prepare";
        pclient.request("game.gameHandler.GameAction", msg, OnPrePare);
    }
    int GetSellType()
    {
        int type = -1;
        foreach(var i in usercardrender.choose)
        {
            if (usercardrender.GetCard(i).type == 2)
            {
                continue;
            }
            else
            {
                type = usercardrender.GetCard(i).type;
            }
        }
        return type;
    }
    int GetMaxBuyMoney()
    {
        int max = 0;
        foreach(var i in newdata.playerlist)
        {
            if (i.buymoney > max)
                max = i.buymoney;
        }
        return max;
    }
    private void SellCard(EventContext context)
    {

        JsonObject msg = new JsonObject();
        msg["type"] = "sellcard";
        List<int> choosen= usercardrender.choose;

        if(choosen.Count==1||(choosen.Count==2 && 
            usercardrender.GetCard(choosen[0]).priority== usercardrender.GetCard(choosen[1]).priority &&
            ((usercardrender.GetCard(choosen[0]).type==2 && usercardrender.GetCard(choosen[1]).type!=2)||
            (usercardrender.GetCard(choosen[0]).type != 2 && usercardrender.GetCard(choosen[1]).type == 2))))
        {
            
            msg["data"] = usercardrender.choose;
            if (GetSellType() == 4)
            {
                msg["money"] = Money.text;
            }
            
            pclient.request("game.gameHandler.GameAction", msg, null);
            playermsg.text = "";
            usercardrender.choose.Clear();
            usercardrender.Init();
        }
        else
        {
            playermsg.text = "出牌不符合规则，请重新选择";
        }
          

        
    }
    private void UnionDisagree(EventContext context)
    {
        JsonObject msg = new JsonObject();
        msg["type"] = "chooseunion";
        msg["chooseunion"] = "disagree";
        pclient.request("game.gameHandler.GameAction", msg, null);
    }

    private void UnionAgree(EventContext context)
    {
        JsonObject msg = new JsonObject();
        msg["type"] = "chooseunion";
        msg["chooseunion"] = "agree";
        List<int> choosen = usercardrender.choose;

        if (choosen.Count == 1 && usercardrender.GetCard(choosen[0]).type != 2 &&
            usercardrender.GetCard(choosen[0]).priority == newdata.sellcard[0].priority) 
        {

            msg["data"] = usercardrender.choose;
            msg["money"]= Money.text;


            pclient.request("game.gameHandler.GameAction", msg, null);
            playermsg.text = "";
            usercardrender.choose.Clear();
            usercardrender.Init();
        }
        else
        {
            playermsg.text = "出牌不符合规则，请重新选择";
        }
    }
    private void BuyCard(EventContext context)
    {
        JsonObject msg = new JsonObject();
        msg["type"] = "buycard";
        msg["data"] = Money.text;
        switch(GetNowSellType())
        {
            case 1:
                if(int.Parse(Money.text)<=GetMaxBuyMoney() && int.Parse(Money.text) != 0)
                {
                    GTextField localmsg = userpanel.GetChild("n16").asTextField;
                    localmsg.text = "请出更大价格";
                    return;
                }
                break;
            case 5:
                if (int.Parse(Money.text) <= GetMaxBuyMoney() && int.Parse(Money.text)!=0)
                {
                    GTextField localmsg = userpanel.GetChild("n16").asTextField;
                    localmsg.text = "请出更大价格";
                    return;
                }
                break;
        }
        pclient.request("game.gameHandler.GameAction", msg, null);
    }

    private int GetNowSellType()
    {
        int type = -1;
        if(newdata.sellcard.Count==1)
        {
            type = newdata.sellcard[0].type;
        }
        if(newdata.sellcard.Count==2)
        {
            if(newdata.sellcard[0].type==2)
            {
                type = newdata.sellcard[1].type;
            }
            else
            {
                type = newdata.sellcard[0].type;
            }
        }
        return type;
    }

    private void BuyChooseDisAgree(EventContext context)
    {
        JsonObject msg = new JsonObject();
        msg["type"] = "choose";
        msg["data"] = "disagree";
        pclient.request("game.gameHandler.GameAction", msg, null);
    }

    private void BuyChooseAgree(EventContext context)
    {
        JsonObject msg = new JsonObject();
        msg["type"] = "choose";
        msg["data"] = "agree";
        pclient.request("game.gameHandler.GameAction", msg, null);
    }
    void OnPrePare(JsonObject obj)
    {

        ReadyButton.color = new Color(255, 0, 255);

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



    void OnSendMessage(JsonObject obj)
    {
        Debug.unityLogger.Log("send over");
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
