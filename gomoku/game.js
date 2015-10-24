var AmountX=17;
var AmountY=17;
var Size=20;

var canvas;
var game;

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

var c=0;

var field;

function check5Line(x,y,c){
    
    var n=0;
    for(var i=x;i<AmountX && field[i][y]==c;i++){
        n++;
    }
    if(n>4) return true; else n=0;
    for(i=y;i<AmountY && field[x][i]==c;i++){
        n++;
    }
    if(n>4) return true; else n=0;
    for(i=y,j=x;i<AmountX && j<AmountY && field[j][i]==c;i++,j++){
        n++;
    }
    if(n>4) return true; else n=0;
    for(i=y,j=x;i<AmountX && j>-1 && field[j][i]==c;i++,j--){
        n++;
    }
    if(n>4) return true;
    return false;
    
}

function checkWin(c){
  
    for(var i=0;i<AmountX;i++){
        for(var j=0;j<AmountY;j++){
            if(check5Line(i,j,c)) return true;
        }
    }
    return false;
}


function canvasClick(e){
    
    xy=clickCellPosition(e);
    
    x=xy[0];
    y=xy[1];
    if(x>=0 && x<AmountX && y>=0 && y<AmountY && !field[x][y]){
        $.get("new.php?x="+x+"&y="+y);
        /*if(c==0){
            drawCross(x, y);
            c=1;
            field[x][y]=1;
        }else{
            drawCicle(x, y);
            c=0;
            field[x][y]=-1;
        }
     
        if(checkWin(c?1:-1)) alert("да ты же победил о_О");
    */
    }
    
}


window.onload=function(){
    
    
    //document.getElementById("game").style.width=AmountX*Size+"px";
    //document.getElementById("game").style.height=AmountY*Size+"px";
    
    
    canvas=document.getElementById("game");
    game = canvas.getContext("2d");
           
    for(i=0;i<AmountX+1;i++){
        
        game.moveTo(Size*i, 0);
        game.lineTo(Size*i, AmountY*Size);
        
    }
    
    for(i=0;i<AmountY+1;i++){
        
        game.moveTo(0, Size*i);
        game.lineTo(AmountY*Size, Size*i);
        
    }
    
    field=new Array(AmountX);
    for (i=0; i<AmountX; i++) {
        field[i]=new Array(AmountY);
    }

    for(i=0;i<AmountX;i++){
        for(j=0;j<AmountY;j++){
            field[i][j]=0;
        }
    }
    
    game.strokeStyle="#000";
    game.stroke();
    
    listenTurns();
    
    canvas.addEventListener("click", canvasClick, false);
      
        
}
