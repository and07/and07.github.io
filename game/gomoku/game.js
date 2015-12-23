var AmountX=20;
var AmountY=20;
var Size=20;

var canvas;
var game;
var bot = 1;
var c = 1; 
var count2win = 5;
var server = 0;

var f = new Array();
var s = new Array();
var q = new Array();

function init(){

drawPos=0;
myTurn=0;
autoplayOn=0;
gameOver=0;
timerAP=0;
buf='';

	for (i=0;i<AmountX;i++) {
		f[i]=new Array();
		s[i]=new Array();
		q[i]=new Array();
		for (j=0;j<AmountY;j++) {
			f[i][j]=0;
			s[i][j]=0;
			q[i][j]=0;
		}
	}
}

function getClickPosition(e){

    var x;
    var y;

    if (e.pageX != undefined && e.pageY != undefined) {

        x = e.pageX;
        y = e.pageY;

    }else {
        x = e.clientX + document.body.scrollLeft +
        document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop +
        document.documentElement.scrollTop;
    }

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    var xy=new Array(2);
    xy[0]=x;
    xy[1]=y;
    return xy;

}

function clickCellPosition(e){
    
    xy = getClickPosition(e);
    x_px = xy[0];
    y_px = xy[1];
   
    x=Math.floor(x_px/Size);
    y=Math.floor(y_px/Size);
    
    xy_px=Array(2);
    xy_px[0]=x;
    xy_px[1]=y;
    return xy_px;
    
}

var id=1;

function listenTurns(){
    
    $.getJSON("game.php?id="+id,function(data){

        $.each(data, function(id_msg, msg) {

            if(id<parseInt(msg[0], 10)+1){id = parseInt(msg[0], 10)+1;}

                if(msg[3]=='1')drawCicle(parseInt(msg[1], 10),parseInt(msg[2], 10));
                else drawCross(parseInt(msg[1], 10),parseInt(msg[2], 10));

        });

        
        setTimeout(listenTurns, 1000);

    });
    
    
}

function drawCicle(x, y){
    
    game.strokeStyle = 'red';
    game.beginPath();      
    game.arc(Size/2+Size*x, Size/2+Size*y, Size*4/11, 0, Math.PI*2, true);            
    game.lineWidth = Size/5;
    game.stroke();
    
}

function drawCross(x, y){
    
    game.strokeStyle = 'green';
    game.beginPath();      
    
    game.moveTo(Size*x+4, Size*y+4);
    game.lineTo(Size*(x+1)-4, Size*(y+1)-4);
    
    game.moveTo(Size*(x+1)-4, Size*y+4);
    game.lineTo(Size*(x)+4, Size*(y+1)-4);
    
    game.lineWidth = Size/5;
    game.stroke();
    
    
}


function checkLine(x,y,c){
    
    var n=0;
    for(var i=x;i<AmountX && f[i][y]==c;i++){
        n++;
    }
    if(n>=count2win) return true; else n=0;
    for(i=y;i<AmountY && f[x][i]==c;i++){
        n++;
    }
    if(n>=count2win) return true; else n=0;
    for(i=y,j=x;i<AmountX && j<AmountY && f[j][i]==c;i++,j++){
        n++;
    }
    if(n>=count2win) return true; else n=0;
    for(i=y,j=x;i<AmountX && j>-1 && f[j][i]==c;i++,j--){
        n++;
    }
    if(n>=count2win) return true;
    return false;
    
}

function checkWin(c){
  
    for(var i=0;i<AmountX;i++){
        for(var j=0;j<AmountY;j++){
            if(checkLine(i,j,c)) return true;
        }
    }
    return false;
}


function canvasClick(e){
    
    xy=clickCellPosition(e);
    
    x=xy[0];
    y=xy[1];
    if(x>=0 && x<AmountX && y>=0 && y<AmountY && !f[x][y]){
		if(server){
			f[x][y]= c ;
			$.post("game.php", { "p":c, "x":x, "y":y, "f":JSON.stringify(f) }, function(data){

				var position = data['position'];

				var _player =  c == 1 ? 'Cross' : 'Cicle';
				window['draw'+_player](parseInt(position[0], 10),parseInt(position[1], 10));

				if(data.winner){
					alert("да ты же победил о_О "+ _player);
					return;
				}
				c = c == 1 ? 2 : 1;
			});
		}else{
				
				if(c==1){
					drawCross(x, y);
					f[x][y]=1;
					if(bot){
						machineMove(x, y);
					}
				}else{
					drawCicle(x, y);
					f[x][y]=-1;
					
				}
				if(checkWin(c?1:-1)){
					var win = c?'Cross':'Cicle';
					alert("да ты же победил о_О "+win );
				}
				c = c == 1 ? 0 : 1;
				
		}
    /**/
    }
    
}
/*********************/
var drawPos=0;
var myTurn=0;
var autoplayOn=0;
var gameOver=0;
var timerAP=0;
var buf='';
var hintShown=false;
var iHint=jHint=6;

var machSq = -1;
var userSq = 1;
var iMax=new Array();
var jMax=new Array();
var nMax=0;
var blinkSq="b-1";
var blinkHint="b1";


var w = new Array(0,20,17,15.4,14,10);
var nPos = new Array();
var dirA = new Array();

function showHint () {
 if (myTurn && autoplayOn) return;
 if (hintShown) {hideHint();return;}
 hintShown=1;
 getBestUserMove();

 if (document.images) {
  drawCross(iHint,jHint,blinkHint);
 }
};

function hideHint() {
 hintShown=0;
 drawCross(iHint,jHint,f[iHint][jHint]);
};

function autoplay() {
 if (autoplayOn) {
  if (myTurn) {
   getBestMachMove();
   f[iMach][jMach]=machSq;
   drawCross(iMach,jMach,blinkSq);
   //timerDR=setTimeout("drawCross(iMach,jMach,machSq);",900);
   if (checkWin(machSq)) {gameOver=1;alert("Player X won!");}
   else if (drawPos) {alert("It\'s a draw!");}
   else { myTurn=false; timerAP=setTimeout("autoplay()",950); }
  }
  else {
   getBestUserMove();
   f[iHint][jHint]=userSq;
   drawCicle(iHint,jHint,blinkHint);
   //timerDR=setTimeout("drawCicle(iHint,jHint,userSq)",900);
   if (checkWin(userSq)) {gameOver=1;alert("Player O won!");}
   else if (drawPos) {alert("It\'s a draw!");}
   else { myTurn=true; timerAP=setTimeout("autoplay()",950); }
  }
 }
};


function setAutoplay() {
 if (gameOver) initBoard();
 if (autoplayOn) {
  if (myTurn) { setAutoplay(); return; }
  autoplayOn=0;clearTimeout(timerAP);return;
 }
 if (document.images) setTimeout("hideHint();autoplayOn=1;autoplay();",100);
 else alert('Sorry, Autoplay Mode is not supported for your browser!');
}


/*********BOT*********/





function hasNeighbors(i,j) {
	if (j>0 && f[i][j-1]!=0) return 1;
	if (j+1<Size && f[i][j+1]!=0) return 1; 
	if (i>0) {
		if (f[i-1][j]!=0) return 1;
		if (j>0 && f[i-1][j-1]!=0) return 1;
		if (j+1<Size && f[i-1][j+1]!=0) return 1;
	}
	if (i+1<Size) {
		if (f[i+1][j]!=0) return 1;
		if (j>0 && f[i+1][j-1]!=0) return 1;
		if (j+1<Size && f[i+1][j+1]!=0) return 1;
	}
	return 0;
}


function evaluatePos(a, mySq) {
 maxA=-1;
 for (var i=0;i<AmountX;i++) {
  for (var j=0;j<AmountY;j++) {
	if (f[i][j]!=0) {a[i][j]=-1; continue;}  
	if (hasNeighbors(i,j)==0) {a[i][j]=-1; continue;}

   minM=i-4; if (minM<0) minM=0;
   minN=j-4; if (minN<0) minN=0;
   maxM=i+5; if (maxM>Size) maxM=Size;
   maxN=j+5; if (maxN>Size) maxN=Size;

   nPos[1]=1; A1=0;
   m=1; while (j+m<maxN  && f[i][j+m]!=-mySq) {nPos[1]++; A1+=w[m]*f[i][j+m]; m++}
   if (j+m>=Size || f[i][j+m]==-mySq) A1-=(f[i][j+m-1]==mySq)?(w[5]*mySq):0;
   m=1; while (j-m>=minN && f[i][j-m]!=-mySq) {nPos[1]++; A1+=w[m]*f[i][j-m]; m++}   
   if (j-m<0 || f[i][j-m]==-mySq) A1-=(f[i][j-m+1]==mySq)?(w[5]*mySq):0;

   nPos[2]=1; A2=0;
   m=1; while (i+m<maxM  && f[i+m][j]!=-mySq) {nPos[2]++; A2+=w[m]*f[i+m][j]; m++}
   if (i+m>=Size || f[i+m][j]==-mySq) A2-=(f[i+m-1][j]==mySq)?(w[5]*mySq):0;
   m=1; while (i-m>=minM && f[i-m][j]!=-mySq) {nPos[2]++; A2+=w[m]*f[i-m][j]; m++}   
   if (i-m<0 || f[i-m][j]==-mySq) A2-=(f[i-m+1][j]==mySq)?(w[5]*mySq):0;

   nPos[3]=1; A3=0;
   m=1; while (i+m<maxM  && j+m<maxN  && f[i+m][j+m]!=-mySq) {nPos[3]++; A3+=w[m]*f[i+m][j+m]; m++}
   if (i+m>=Size || j+m>=Size || f[i+m][j+m]==-mySq) A3-=(f[i+m-1][j+m-1]==mySq)?(w[5]*mySq):0;
   m=1; while (i-m>=minM && j-m>=minN && f[i-m][j-m]!=-mySq) {nPos[3]++; A3+=w[m]*f[i-m][j-m]; m++}   
   if (i-m<0 || j-m<0 || f[i-m][j-m]==-mySq) A3-=(f[i-m+1][j-m+1]==mySq)?(w[5]*mySq):0;

   nPos[4]=1; A4=0;
   m=1; while (i+m<maxM  && j-m>=minN && f[i+m][j-m]!=-mySq) {nPos[4]++; A4+=w[m]*f[i+m][j-m]; m++;}
   if (i+m>=Size || j-m<0 || f[i+m][j-m]==-mySq) A4-=(f[i+m-1][j-m+1]==mySq)?(w[5]*mySq):0;
   m=1; while (i-m>=minM && j+m<maxN  && f[i-m][j+m]!=-mySq) {nPos[4]++; A4+=w[m]*f[i-m][j+m]; m++;} 
   if (i-m<0 || j+m>=Size || f[i-m][j+m]==-mySq) A4-=(f[i-m+1][j+m-1]==mySq)?(w[5]*mySq):0;

   dirA[1] = (nPos[1]>4) ? A1*A1 : 0;
   dirA[2] = (nPos[2]>4) ? A2*A2 : 0;
   dirA[3] = (nPos[3]>4) ? A3*A3 : 0;
   dirA[4] = (nPos[4]>4) ? A4*A4 : 0;

   A1=0; A2=0;
   for (k=1;k<5;k++) {
    if (dirA[k]>=A1) {A2=A1; A1=dirA[k]}
   }
   thisA=A1+A2;

   a[i][j]=thisA;
   if (thisA>maxA) {
    maxA=thisA;
   }
  }
 }
 return maxA;
}

function getBestMachMove() {
 maxS=evaluatePos(s,1);
 maxQ=evaluatePos(q,-1);

 // alert ('maxS='+maxS+', maxQ='+maxQ);

 if (maxQ>=maxS) {
  maxS=-1;
  for (i=0;i<Size;i++) {
   for (j=0;j<Size;j++) {
    if (q[i][j]==maxQ) {
     if (s[i][j]>maxS) {maxS=s[i][j]; nMax=0}
     if (s[i][j]==maxS) {iMax[nMax]=i;jMax[nMax]=j;nMax++} 
    }
   }
  }
 }
 else {
  maxQ=-1;
  for (i=0;i<Size;i++) {
   for (j=0;j<Size;j++) {
    if (s[i][j]==maxS) {
     if (q[i][j]>maxQ) {maxQ=q[i][j]; nMax=0}
     if (q[i][j]==maxQ) {iMax[nMax]=i;jMax[nMax]=j;nMax++} 
    }
   }
  }
 }
 // alert('nMax='+nMax+'\niMax: '+iMax+'\njMax: '+jMax)

 randomK=Math.floor(nMax*Math.random());
 iMach=iMax[randomK];
 jMach=jMax[randomK];
}

function getBestUserMove() {
 maxQ=evaluatePos(q,-1);
 maxS=evaluatePos(s,1);

 if (maxS==-1) {
  center=Math.floor(Size/2);
  s[center][center]=1
  maxS=1; 
 }

 if (maxS>=maxQ) {
  maxQ=-1;
  for (i=0;i<Size;i++) {
   for (j=0;j<Size;j++) {
    if (s[i][j]==maxS) {
     if (q[i][j]>maxQ) {maxQ=q[i][j]; nMax=0}
     if (q[i][j]==maxQ) {iMax[nMax]=i;jMax[nMax]=j;nMax++} 
    }
   }
  }
 }
 else {
  maxS=-1;
  for (i=0;i<Size;i++) {
   for (j=0;j<Size;j++) {
    if (q[i][j]==maxQ) {
     if (s[i][j]>maxS) {maxS=s[i][j]; nMax=0}
     if (s[i][j]==maxS) {iMax[nMax]=i;jMax[nMax]=j;nMax++} 
    }
   }
  }
 }

 // alert('nMax='+nMax+'\niMax: '+iMax+'\njMax: '+jMax)

 randomK=Math.floor(nMax*Math.random());
 iHint=iMax[randomK];
 jHint=jMax[randomK];
}

function Move(){
	maxS=evaluatePos(s,1);
	maxQ=evaluatePos(q,-1);

	if (maxQ>=maxS) {
	 maxS=-1;
	 for (i=0;i<AmountX;i++) {
	  for (j=0;j<AmountY;j++) {
	   if (q[i][j]==maxQ && s[i][j]>maxS) {
		maxS=s[i][j]; 
		iMach=i;
		jMach=j;
	   }
	  }
	 }
	} else {
	 maxQ=-1;
	 for (i=0;i<Size;i++) {
	  for (j=0;j<Size;j++) {
	   if (s[i][j]==maxS && q[i][j]>maxQ) {
		maxQ=q[i][j]; 
		iMach=i;
		jMach=j;
	   }
	  }
	 }
	}
    return [iMach,jMach];
    
};

function machineMove(iUser, jUser) {

    var position = Move();
	f[position[0]][position[1]]=machSq;
	drawCicle(position[0], position[1]);
	if(checkWin(c?1:-1)){
		var win = c?'Cross':'Cicle';
		alert("you win о_О "+win );
	}
	c = c == 1 ? 0 : 1;

}


function Bot(){
	
}
