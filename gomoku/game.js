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

/*********BOT*********/
//http://www.softholm.com/igra/Five-in-a-row.html

var machSq = -1;


var w = new Array(0,20,17,15.4,14,10);
var nPos = new Array();
var dirA = new Array();

var winningMove=9999999;
var openFour   =8888888;
var twoThrees  =7777777;


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

function winningPos(i,j,mySq) {
	var test3=0;

	L=1;
	m=1; while (j+m<Size  && f[i][j+m]==mySq) {L++; m++} m1=m;
	m=1; while (j-m>=0 && f[i][j-m]==mySq) {L++; m++} m2=m;   
	if (L>4) { return winningMove; }
	side1=(j+m1<Size && f[i][j+m1]==0);
	side2=(j-m2>=0 && f[i][j-m2]==0);

	if (L==4 && (side1 || side2)) test3++;
	if (side1 && side2) {
		if (L==4) return openFour;
		if (L==3) test3++;
	}

	L=1;
	m=1; while (i+m<Size  && f[i+m][j]==mySq) {L++; m++} m1=m;
	m=1; while (i-m>=0 && f[i-m][j]==mySq) {L++; m++} m2=m;   
	if (L>4) { return winningMove; }
	side1=(i+m1<Size && f[i+m1][j]==0);
	side2=(i-m2>=0 && f[i-m2][j]==0);
	if (L==4 && (side1 || side2)) test3++;
	if (side1 && side2) {
		if (L==4) return openFour;
		if (L==3) test3++;
	}
	if (test3==2) return twoThrees;

	L=1;
	m=1; while (i+m<Size && j+m<Size && f[i+m][j+m]==mySq) {L++; m++} m1=m;
	m=1; while (i-m>=0 && j-m>=0 && f[i-m][j-m]==mySq) {L++; m++} m2=m;   
	if (L>4) { return winningMove; }
	side1=(i+m1<Size && j+m1<Size && f[i+m1][j+m1]==0);
	side2=(i-m2>=0 && j-m2>=0 && f[i-m2][j-m2]==0);
	if (L==4 && (side1 || side2)) test3++;
	if (side1 && side2) {
	 if (L==4) return openFour;
	 if (L==3) test3++;
	}
	if (test3==2) return twoThrees;

	L=1;
	m=1; while (i+m<Size  && j-m>=0 && f[i+m][j-m]==mySq) {L++; m++} m1=m;
	m=1; while (i-m>=0 && j+m<Size && f[i-m][j+m]==mySq) {L++; m++} m2=m; 
	if (L>4) { return winningMove; }
	side1=(i+m1<Size && j-m1>=0 && f[i+m1][j-m1]==0);
	side2=(i-m2>=0 && j+m2<Size && f[i-m2][j+m2]==0);
	if (L==4 && (side1 || side2)) test3++;
	if (side1 && side2) {
	 if (L==4) return openFour;
	 if (L==3) test3++;
	}
	if (test3==2) return twoThrees;
	return -1;
}

function evaluatePos(a,mySq) {
 maxA=-1;
 for (var i=0;i<AmountX;i++) {
  for (var j=0;j<AmountY;j++) {
	if (f[i][j]!=0) {a[i][j]=-1; continue;}  
	if (hasNeighbors(i,j)==0) {a[i][j]=-1; continue;}
 
	wp=winningPos(i,j,mySq);
	if (wp==winningMove) {a[i][j]=winningMove; return winningMove;}
	if (wp>=twoThrees)   {a[i][j]=wp; if (maxA<wp) maxA=wp; continue;}

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

function machineMove(iUser, jUser) {
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

	f[iMach][jMach]=machSq;
	drawCicle(iMach, jMach);
	if(checkWin(c?1:-1)){
		var win = c?'Cross':'Cicle';
		alert("да ты же победил о_О "+win );
	}
	c = c == 1 ? 0 : 1;

/*
 if (winningPos(iMach,jMach,machSq)==winningMove) setTimeout("alert('Победил компьютер!')",900);
 else setTimeout("myTurn=false;",950);
*/
}


function Bot(){
	
}