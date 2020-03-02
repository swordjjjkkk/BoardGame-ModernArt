using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;
using FairyGUI;

namespace Assets.Script.GamePanel
{
    public class CardRender
    {
        protected int x;
        protected int y;
        protected int width;
        protected int height;
        protected int cardwidth;
        protected int cardheight;
        protected GComponent poker;
        protected GButton[] BtnCardList;
        protected List<MsgCard> cards;
        public CardRender(int x, int y, int width, int height, int cardwidth, int cardheight, GButton[] BtnCardList)
        {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.cardwidth = cardwidth;
            this.cardheight = cardheight;
            this.BtnCardList = BtnCardList;
            

            cards = new List<MsgCard>();

            for (int i = 0; i < BtnCardList.Length; i++)
            {
                BtnCardList[i].data = i;
               
            }

        }
        

        public MsgCard GetCard(int id)
        {
            for (int i = 0; i < cards.Count; i++)
            {
                if (cards[i].id == id)
                {
                    return cards[i];
                }
            }
            return null;
        }
        

        

        public virtual void addcards(MsgCard newcard)
        {
            BtnCardList[newcard.id].onClick.Clear();
            Loom.QueueOnMainThread(() => {//切换为主线程

                BtnCardList[newcard.id].size = new Vector2(this.cardwidth, this.cardheight);
            });
       
            cards.Add(newcard);
        }
        public void Clear()
        {
            List<int> temp =new List<int>();
            for (int i = 0; i < cards.Count; i++)
            {
                temp.Add(cards[i].id);
            }
            Loom.QueueOnMainThread(() => {//切换为主线程
                for (int i = 0; i < temp.Count; i++)
                {
                    BtnCardList[temp[i]].visible = false;
                }
            });
            cards.Clear();
        }


        public void deletecards(MsgCard oldcard)
        {
            foreach (MsgCard i in cards)
            {
                if (i == oldcard)
                {
                    cards.Remove(i);
                }
            }
        }
        public void SetPosition(int x, int y, int index,bool flag=false)
        {
            Loom.QueueOnMainThread(() => {//切换为主线程
                BtnCardList[index].visible = true;
                if (flag)
                {
                    BtnCardList[index].SetPosition(x, y, 0);
                }
                else
                {
                    BtnCardList[index].TweenMove(new Vector2(x, y), (float)0.5);
                }
      
            });

        }
        public virtual void Init()
        {

            cards.Sort((a, b) =>
            {
                return a.id - b.id;
            });
            int totalwidth = ((this.cards.Count ) * (this.cardwidth  +8));
            int X = (this.width - totalwidth) / 2 + this.x;
            int Y = (this.y + this.height - this.cardheight);
            for (int i = 0; i < cards.Count; i++)
            {
                SetPosition(X, Y, cards[i].id);
                X += (this.cardwidth )+8;
            }

        }
 
    }
    public class UserCardRender : CardRender
    {
        public List<int> choose;
        public UserCardRender(int x, int y, int width, int height, int cardwidth, int cardheight, GButton[] BtnCardList) : base(x, y, width, height, cardwidth, cardheight, BtnCardList)
        {
            choose = new List<int>();

        }
        public override void addcards(MsgCard newcard)

        {

            BtnCardList[newcard.id].onClick.Clear();
            cards.Add(newcard);
            Loom.QueueOnMainThread(() => {//切换为主线程

                BtnCardList[newcard.id].size = new Vector2(this.cardwidth, this.cardheight);
            });
            
            BtnCardList[newcard.id].onClick.Add(CardClicked);
        }
        void CardClicked(EventContext context)
        {


            int index = (int)((GObject)context.sender).data;
            //BtnCardList[index].SetPosition(0, 0, 0);
            if (choose.Contains(index))
            {
                choose.Remove(index);
            }
            else
            {
                choose.Add(index);
            }



            this.Init();

        }
        public override void Init()
        {

            cards.Sort((a, b) =>
            {
                return a.id - b.id;
            });
            int totalwidth = ((this.cards.Count + 1) * (this.cardwidth / 2));
            int X = (this.width - totalwidth) / 2 + this.x;
            int Y = (this.y + this.height - this.cardheight);
            for (int i = 0; i < cards.Count; i++)
            {
                if (choose.Contains(cards[i].id))
                {
                    SetPosition(X, Y - 20, cards[i].id,true);
                }
                else
                {
                    SetPosition(X, Y, cards[i].id,true);
                }

                X += (this.cardwidth / 2);
            }

        }
    }
}
