using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;

namespace Assets.Script.GamePanel
{
    public class MsgCard
    {
        public MsgCard(MsgCard c)
        {
            this.id = c.id;
            this.priority = c.priority;
            this.type = c.type;
        }
        public MsgCard(int id, int priority, int type)
        {
            this.id = id;
            this.priority = priority;
            this.type = type;
        }

        public MsgCard(JToken i)
        {
            id = (int)(i["id"]);
            priority = (int)(i["priority"]);
            type = (int)(i["type"]);

        }

        public int id;
        public int priority;
        public int type;


        public static bool operator ==(MsgCard first, MsgCard second)
        {
            return first.id == second.id ? true : false;
        }
        public static bool operator !=(MsgCard first, MsgCard second)
        {
            return first.id != second.id ? true : false;
        }
        public bool Equals(MsgCard second)
        {
            return id == second.id ? true : false;
        }
    }
}
