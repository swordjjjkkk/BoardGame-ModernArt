using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;

namespace Assets.Script.GamePanel
{
    public class MsgPlayer
    {
        public MsgPlayer(JToken obj)
        {
            buycard = new List<MsgCard>();
            handcards = new List<MsgCard>();
            actionlist = new List<string>();
            userid = obj["userid"].ToString();
            ready = (bool)obj["ready"];
            money = (int)obj["money"];
            buymoney = (int)obj["buymoney"];
            host = (bool)obj["host"];
            buyover = (bool)obj["buyover"];
            playermsg = obj["playermsg"].ToString();
            JArray jsonbuycard = (JArray)JsonConvert.DeserializeObject(obj["buycard"].ToString());
            buycard.Clear();
            foreach (var i in jsonbuycard)
            {
                buycard.Add(new MsgCard(i));
            }
            JArray jsonhandcards = (JArray)JsonConvert.DeserializeObject(obj["handcards"].ToString());
            handcards.Clear();
            foreach (var i in jsonhandcards)
            {
                handcards.Add(new MsgCard(i));
            }

            JArray jsonactionlist = (JArray)JsonConvert.DeserializeObject(obj["actionlist"].ToString());
            actionlist.Clear();
            foreach (var i in jsonactionlist)
            {
                actionlist.Add(i.ToString());
            }
        }
        public List<MsgCard> handcards;
        public string userid;
        public bool ready;
        public int money;
        public List<MsgCard> buycard;
        public int buymoney;
        public bool host;
        public List<string> actionlist;
        public string playermsg;
        public bool buyover;
    }
}
