/*
 * Class for 7x7 game
 * TODO
 * level map
 * cookie remember 
 * cross the box
 * welcome page
 * move anywhere
 * undo
 *
 * */
Game = {
    createNew:function(map){
    var game={};
    game.map = $(map).find("#map");//game div 
    game.upnext_map = $(map).find("#upnext_map");
    game.undrop_backgroud = "";
    game.box_width = 50;// color
    game.box_height = 50;// color
    game.boxs = new Array(7);// 7x7
    game.colors = [{color:"223,1,58"},{color:"0,191,255"},{color:"255,128,0"},{color:"58,223,0"}];// 4 colors
    game.levels = [{boxs:3,line:10},{boxs:4,line:10},{boxs:5,line:10},{boxs:6,line:100}];// levels
    game.level  =  0;// current level
    game.line    =  0;// current line of level
    game.score = 0;
    game.undo_num = 0;
    game.move_any_where_num = 0;
    game.next_arr = [0,1,2];// next colors
    game.tmp_index = -1; //tmp box index
    game.live_boxs = [];//live boxs
    game.init = function(divname){
        d('Here comes 7x7');
        game.map_width = game.box_width*7+16;
        game.map_height = game.box_height*7+16;
        game.draw_backgroud();
        game.init_boxs();
        game.next();
    };
    //make background row lines
    game.draw_backgroud =function(){
        this.map.append('<canvas id="game_bg_canvas" width="'+this.map_width+'" height="'+this.map_height+'"></canvas>');
        tmp_ctx = $('#game_bg_canvas')[0].getContext("2d");
        tmp_ctx.fillStyle="#FFF";
        for(i=0;i<=7;i++){
            tmp_ctx.fillRect(0,i*this.box_height+(i*2),this.map_width,2);
            tmp_ctx.fillRect(i*this.box_width+(i*2),0,2,this.map_height);
        }
        //draw upnext map
        this.upnext_map.append('<canvas id="upnext_bg_canvas" width="'+(this.box_width*3+8)+'" height="'+(this.box_height*2+6)+'"></canvas>');
        tmp_ctx = $('#upnext_bg_canvas')[0].getContext("2d");
        tmp_ctx.fillStyle="#FFF";
        for(i=0;i<=3;i++){
            tmp_ctx.fillRect(0,i*this.box_height+(i*2),this.map_width,2);
            tmp_ctx.fillRect(i*this.box_width+(i*2),0,2,this.map_height);
        }
        for(i=0;i<6;i++)
        {
            this.upnext_map.append('<canvas width="'+(this.box_width)+'" height="'+(this.box_height)+'" style="position:absolute;left:'+(this.box_width*(i%3)+(2*((i%3)+1)))+'px;top:'+(this.box_height*(i/3|0)+2*((i/3|0)+1))+'px;background:rgba(0, 0, 0, 0);"></canvas>');
        }
        //draw undropable background
        tmp_ctx = $('<canvas id="tmp_canvas" width="'+this.box_width+'" height="'+this.box_height+'"></canvas>').appendTo('body')[0].getContext("2d");
        tmp_ctx.strokeStyle="#FFF";
        tmp_ctx.lineWidth=2;
        tmp_ctx.beginPath();   
        tmp_ctx.moveTo(0,0);   
        tmp_ctx.lineTo(this.box_width,this.box_height);   
        tmp_ctx.moveTo(this.box_height,0);   
        tmp_ctx.lineTo(0,this.box_width);   
        tmp_ctx.stroke(); 
        game.undropable_background = "url(" + $('#tmp_canvas')[0].toDataURL()+ ")";
        $('#tmp_canvas').remove();
    };
    //make colors arrays
    game.init_boxs = function()
    {
        //init game map
        update_arr = [];
        for(i=0;i<7;i++){
            this.boxs[i] = new Array();
            for(j=0;j<7;j++){
                this.boxs[i][j]=0;
                this.map.append('<canvas  class="box" width="'+this.box_width+'" height="'+this.box_height+'" style="position:absolute;left:'+(this.box_width*j+(2*(j+1)))+'px;top:'+(this.box_height*i+2*(i+1))+'px;background:rgba(0, 0, 0, 0);"></canvas>'); 
                update_arr.push([i,j,0]);
            }
        }
        game.draw_update_boxs(update_arr);

   };
    //next game
    game.next = function()
    {
        tmp_arr = [];
        update_arr = [];
        this.boxs.filter(function(v,k,arr1){
                  x = v.filter(function(vv,kk,arr2){
                  if(vv == 0)
                       tmp_arr.push([k,kk]);
                  }); 
        });
        if(tmp_arr.length==0){
            //game.game_over = 1;
            game.gameover();
            console.log('GAME OVER'); //TODO
            return;
        }
        var ii= this.next_arr.length > tmp_arr.length ? tmp_arr.length : this.next_arr.length;
        for(var i=0;i<ii;i++)
        {
            x = Math.random()*tmp_arr.length|0;
            this.boxs[tmp_arr[x][0]][tmp_arr[x][1]] = this.next_arr[i]+1;
            update_arr.push([tmp_arr[x][0],tmp_arr[x][1],this.next_arr[i]+1])
            //update game.boxs
            var tmp = game.boxs_recount(tmp_arr[x][0],tmp_arr[x][1]);
            //draw_update_boxs
            if(!tmp)
            game.draw_update_boxs([[tmp_arr[x][0],tmp_arr[x][1],this.next_arr[i]+1]]);
        }
        for(i=0;i<this.levels[this.level].boxs;i++){
            this.next_arr[i] = (Math.random()*game.colors.length)|0;
        }
        game.draw_upnext_boxs();
        };
    //draw update boxs
    game.draw_update_boxs = function(update_arr){
        //update game.score 
        $('#score_text').html(game.score);
        //update_arr[i] = [x,y,color]
        for(i=0;i<update_arr.length;i++){
            index = update_arr[i][0]*7+update_arr[i][1];
            $($(this.map).find('.box')[index])
                .clone()
                .insertBefore($(this.map).find('.box')[index]);
                $(this.map).find('.box')[index+1].remove();
                tmp = $($(this.map).find('.box')[index]);
                if(update_arr[i][2]==0){
                    tmp.removeClass('drag').addClass('drop');
                    //if just move
                    if(update_arr.length<3)
                        tmp.css({background:'rgba(0,0,0,0)'});
                    //if need clear
                    tmp.animate({
                        height:"+=100",
                        width:"+=100",
                        top:'-=50',
                        left:'-=50',
                        opacity:0
                    },300,function(){
                        $(this).css({
                            height:"-=100",
                            width:'-=100',
                            top:'+=50',
                            left:'+=50',
                            background:'rgba(0,0,0,0)'
                        });
                    });

                    tmp.drop('start',function(ev,dd){

                        
                        var tmp_index = $(this.parentNode).find('.box').index(this);
                        //console.log((tmp_index/7|0)+","+tmp_index%7);
                        //console.log(game.live_boxs.indexOf(tmp_index/7|0+","+tmp_index%7));
                        if(game.live_boxs.indexOf((tmp_index/7|0)+","+tmp_index%7)<0)
                        return false;
                       


                       $('.box_clone').remove();
                        $(dd.proxy).clone().css({
                            opacity:0.5,
                            width:100,
                            height:100,
                            top:$(this).context.offsetTop-25,
                            left:$(this).context.offsetLeft-25,
                        }).addClass('box_clone').appendTo(this.parentNode);
                    })
                    .drop(function(ev,dd){
                        game.tmp_index = $(this.parentNode).find('.box').index(this);
                    });
                }else
                {   // add drag event
                    tmp.removeClass('drop').addClass('drag');
                    tmp.css({
                        background:'rgba('+this.colors[update_arr[i][2]-1].color+',1)',
                        height:"+=20",
                        width:"+=20",
                        top:'-=10',
                        left:'-=10',
                        opacity:0.2
                    });
                    tmp.animate({
                        height:"-=20",
                        width:"-=20",
                        top:'+=10',
                        left:'+=10',
                        opacity:1
                    },300,function(){
                       if($(this).css('width')!='50px'){//TODO need change
                        $(this).css({
                            width:game.box_width,
                            height:game.box_height,
                            left:'+=10',
                            top:'+=10'
                        });
                       }
                    });

                    tmp.drag("start",function(ev,dd){
                        var this_index = $(this.parentNode).find('.box').index(this);
                        game.live_boxs=[];
                        game.live_boxs=game.find_way(this_index/7|0,this_index%7,true);
                        for(var live_i =0;live_i<49;live_i++)
                        {
                            var x=live_i/7|0;
                            var y=live_i%7;
                            if(game.live_boxs.indexOf(x+","+y)<0 && game.boxs[x][y]==0)
                    {
                        $($(this.parentNode).find('.box')[live_i]).addClass('undropable').css({'background-image':game.undropable_background,opacity:1});
                    }
                        }//end for
                        return $(this).clone()
                        .css({
                            opacity: 0.3,
                        })
                    .appendTo($('body'));//TODO need change
                    }).drag(function( ev, dd ){
                        $( dd.proxy ).css({
                            top: dd.offsetY,
                            left: dd.offsetX,
                        });
                    }).drag("end",function( ev, dd ){
                    $('.undropable').css({'background-image':""}).removeClass('.undropable');
                        $( dd.proxy ).remove();
                        $('.box_clone').remove();
                        if(game.tmp_index<0)return;
                        t1 = $(this.parentNode).find('.box')[game.tmp_index];
                        this_index = $(this.parentNode).find('.box').index(this);
                        game.boxs[game.tmp_index/7|0][game.tmp_index%7] = game.boxs[this_index/7|0][this_index%7]; 
                        game.boxs[this_index/7|0][this_index%7]=0;

                        var tmp = game.boxs_recount(game.tmp_index/7|0,game.tmp_index%7);
                        //call it self
                        game.draw_update_boxs([[game.tmp_index/7|0,game.tmp_index%7,game.boxs[game.tmp_index/7|0][game.tmp_index%7]],[(this_index/7|0),this_index%7,0]]);
                        game.tmp_index = -1;
                        if(!tmp)
                        game.next();
                    });
                }//end if

        }//end for
    };//end game.draw_update_boxs
    //recount box array if there is any box to clear
    game.boxs_recount = function(x,y)
    {
        n=[[],[],[],[]];
        l=r=l1=r1=true;
        for(i=0;i<7;i++){
            //line
            if(game.boxs[x][i]==game.boxs[x][y])
            {
                n[0].push([x,i]);
            }
            else
            {
                if(n[0].length>3)break;else n[0]=[];
            }
                    //row
            if(game.boxs[i][y]==game.boxs[x][y])
            {
                n[1].push([i,y]);
            }
            else
            {
                if(n[1].length>3)break;else n[1]=[];
            }
            //line cross
            if(l1&& (x-i)>=0 && (y-i)>=0  && game.boxs[x-i][y-i]==game.boxs[x][y])
            {
                n[2].push([x-i,y-i]);
            }else
            {
                l1=false;
            }
            if(r1 && (x+i)<=6 && (y+i)<=6 && game.boxs[x+i][y+i]==game.boxs[x][y])
            {
                if(i>0)
                n[2].push([x+i,y+i]);
            }else
            {
                r1=false;
            }

            //row cross
            if(l&& (x+i)<=6 && (y-i)>=0  && game.boxs[x+i][y-i]==game.boxs[x][y])
            {
                n[3].push([x+i,y-i]);
            }else
            {
                l=false;
            }
            if(r && (x-i)>=0 && (y+i)<=6 && game.boxs[x-i][y+i]==game.boxs[x][y])
            {
                if(i>0)
                n[3].push([x-i,y+i]);
            }else
            {
                r=false;
            }


        }//end for 

        for(i=0;i<n.length;i++)
        {
            if(n[i].length>3){
                update_arr=[];
                for(j=0;j<n[i].length;j++)
                {
                    game.boxs[n[i][j][0]][n[i][j][1]]=0;
                    update_arr.push([n[i][j][0],n[i][j][1],0]);
                }

                // update boxs every time
                if(game.line<game.levels[game.level].line){
                    game.line++;
                }else{
                    game.level++;
                    game.line = 0;
                }

                game.score += update_arr.length;
                game.draw_update_boxs(update_arr);
                return true;
            }
        }//end for
        return false;
    };
    //find the useable drop boxs for an box [x,y,true]
    game.find_way =function(x,y,under){
        var tmp_arr=[[1,0],[-1,0],[0,1],[0,-1]];
        for(var i=0;i<tmp_arr.length;i++){
            var tmp = tmp_arr[i];
            if((x+tmp[0])>=0 && (x+tmp[0])<=6 && (y+tmp[1])>=0 && (y+tmp[1])<=6 && game.live_boxs.indexOf([x+tmp[0],y+tmp[1]].join())<0 && game.boxs[x+tmp[0]][y+tmp[1]] == 0)
            {
                    game.live_boxs.push([x+tmp[0],y+tmp[1]].join());
                    game.find_way(x+tmp[0],y+tmp[1],false);
            }
        }//end for

        if(under)
            return game.live_boxs;
    };
    //draw upnext canvas
    game.draw_upnext_boxs =function(){
        for(i=0;i<this.next_arr.length;i++){
            $(this.upnext_map.find('canvas')[i+1]).css({background:'rgba('+this.colors[this.next_arr[i]].color+',1)'});                    
        }
    };
    //game start
    game.start = function(){
    
    }
    //when game is over
    game.game_over = function(){
    
    };
    //undo
    game.undo = function(){
    
    }
    //move any where
    game.move_any_where = function(){
    }
    return game;
    }
};
