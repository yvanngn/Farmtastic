import sys
from PIL import Image
SRC='/mnt/user-data/uploads/75a9b0e4-image.jpg'
im=Image.open(SRC).convert('RGB')
POSES={'front':(980,32,1076,202),'side':(1076,32,1168,202),'back':(1076,202,1166,356)}
H=int(sys.argv[1]) if len(sys.argv)>1 else 32
def cut(box):
    c=im.crop(box); px=c.load(); w,h=c.size
    bg=px[1,1]
    out=Image.new('RGBA',(w,h),(0,0,0,0)); po=out.load()
    for y in range(h):
        for x in range(w):
            r,g,b=px[x,y]
            d=abs(r-bg[0])+abs(g-bg[1])+abs(b-bg[2])
            if d>38: po[x,y]=(r,g,b,255)
    bb=out.getbbox(); return out.crop(bb)
def shrink(s):
    w,h=s.size; nw=max(1,round(w*H/h))
    # réduction par moyenne (sur pixels opaques), puis alpha seuillé
    small=s.resize((nw,H),Image.BOX)
    p=small.load()
    for y in range(H):
        for x in range(nw):
            r,g,b,a=p[x,y]
            p[x,y]=(min(255,int(r*255/a)) if a else 0,min(255,int(g*255/a)) if a else 0,min(255,int(b*255/a)) if a else 0,255 if a>110 else 0)
    return small
def outline(s):
    w,h=s.size; o=Image.new('RGBA',(w+2,h+2),(0,0,0,0)); o.paste(s,(1,1),s); p=o.load(); src=o.copy().load()
    for y in range(h+2):
        for x in range(w+2):
            if src[x,y][3]: continue
            nb=[src[x+a,y+b] for a,b in((1,0),(-1,0),(0,1),(0,-1)) if 0<=x+a<w+2 and 0<=y+b<h+2 and src[x+a,y+b][3]]
            if nb:
                r=sum(n[0] for n in nb)//len(nb); g=sum(n[1] for n in nb)//len(nb); b=sum(n[2] for n in nb)//len(nb)
                p[x,y]=(int(r*.38),int(g*.32),int(b*.3),255)
    return o
def walk(s, view, k):
    # k : 0 repos, 1 jambe gauche levée / en avant, 2 jambe droite
    if k==0: return s
    w,h=s.size; out=s.copy(); hip=int(h*.72)
    legs=s.crop((0,hip,w,h))
    out.paste((0,0,0,0),(0,hip,w,h))
    if view=='side':
        half=w//2
        back=legs.crop((0,0,half,h-hip)); front=legs.crop((half,0,w,h-hip))
        dx=1 if k==1 else -1
        out.alpha_composite(legs,(0,0+hip)) if False else None
        out.alpha_composite(back,(max(0,-dx),hip)); out.alpha_composite(front,(half+max(0,dx)-0,hip))
    else:
        half=w//2
        L=legs.crop((0,0,half,h-hip)); R=legs.crop((half,0,w,h-hip))
        out.alpha_composite(L,(0,hip-(1 if k==1 else 0))); out.alpha_composite(R,(half,hip-(1 if k==2 else 0)))
    return out
frames={v:outline(shrink(cut(b))) for v,b in POSES.items()}
FW=max(f.size[0] for f in frames.values())+2; FH=max(f.size[1] for f in frames.values())+2
sheet=Image.new('RGBA',(FW*4,FH*3),(0,0,0,0))
for row,v in enumerate(['front','back','side']):
    for col,k in enumerate([0,1,0,2]):
        f=walk(frames[v],v,k); x=col*FW+(FW-f.size[0])//2; y=row*FH+(FH-f.size[1])
        sheet.alpha_composite(f,(x,y))
sheet.save('/home/claude/farmwest/assets/sprites/manu.png')
print(FW,FH,sheet.size)
