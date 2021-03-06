﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;

namespace Assets.Script.GamePanel
{
    public class MsgData
    {
        public MsgData(JToken obj)
        {
            playerlist = new List<MsgPlayer>();
            sellcard = new List<MsgCard>();
            cardvalue = new List<int>();
            state = obj["state"].ToString();
            playernum = (int)(obj["playernum"]);
            turn = obj["turn"].ToString();
            action = obj["action"].ToString();
            commonmsg = obj["commonmsg"].ToString();
            JArray jsonplayerlist = (JArray)JsonConvert.DeserializeObject(obj["playerlist"].ToString());
            JArray cardvaluelist = (JArray)JsonConvert.DeserializeObject(obj["cardvalue"].ToString());
            playerlist.Clear();
            cardvalue.Clear();
            foreach (var i in cardvaluelist)
            {
                cardvalue.Add((int)i);
            }
            foreach (var i in jsonplayerlist)
            {
                playerlist.Add(new MsgPlayer(i));
            }

            JArray jsonsellcard = (JArray)JsonConvert.DeserializeObject(obj["sellcard"].ToString());
            sellcard.Clear();
            foreach (var i in jsonsellcard)
            {
                sellcard.Add(new MsgCard(i));
            }


        }
        public string state;
        public int playernum;
        public List<MsgPlayer> playerlist;
        public string turn;
        public string action;
        public List<MsgCard> sellcard;
        public string commonmsg;
        public List<int> cardvalue;

    }
}
