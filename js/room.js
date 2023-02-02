const currentUser=JSON.parse(sessionStorage.getItem('user'))
const key_room=JSON.parse(sessionStorage.getItem('key_room'))
const getDB= firebase.database()
const roomRef=getDB.ref('rooms').child(key_room)
const usersRef=getDB.ref('users')
const messagesRef=getDB.ref('messages')


roomRef.on('value',sn=>{
   if(!sn.exists()){
    msgWhenOutRoom('Phòng đã bị giải tán')
   }else{
    const room_creator=sn.val().room_creator
    const room_creator_status=sn.val().room_creator_status
    const room_creator_score=sn.val().room_creator_score

    const competitor=sn.val().competitor
    const competitor_status=sn.val().competitor_status
    const competitor_score=sn.val().competitor_score

    const turns=sn.val().turns

    //HIỂN THỊ THÔNG TIN PHÒNG, NGƯỜI CHƠI,VV...
    $('#key_room').text(key_room)
    $('#room_creator').text(room_creator)

    if(room_creator==currentUser.name || competitor==currentUser.name){
        $('#user_1 #user_name').text(currentUser.name+ '( Bạn)')

        if(room_creator==currentUser.name){
            $('#outRoomBtn').text("Giải tán phòng")
            if(competitor!='null'){
                //HÀM BẮT ĐẦU TRÒ CHƠI
startGame(room_creator,turns,room_creator,room_creator_status,room_creator_score,
    competitor,competitor_status,competitor_score)
//
                $('#user_2 #user_name').text(competitor)
                $('#user_2 #user_score').text("Điểm: "+competitor_score)
                $('#user_1 #user_score').text("Điểm: "+room_creator_score)
            }else{
                $('#user_2 #user_name').text("Chưa có người nào")
                $('#user_2 #user_score').text('')
            } 
        }else if(competitor==currentUser.name){
            $('#outRoomBtn').text("Thoát phòng")
            $('#user_2 #user_name').text(room_creator)
            $('#user_2 #user_score').text("Điểm: "+room_creator_score)
            $('#user_1 #user_score').text("Điểm: "+competitor_score)
            //HÀM BẮT ĐẦU TRÒ CHƠI
startGame(room_creator,turns,competitor,competitor_status,competitor_score,room_creator,room_creator_status,room_creator_score)
//
        }
    }
//


   }
})


//HÀM BẮT ĐẦU TRÒ CHƠI
function startGame(room_creator,turns,player_name,player_status,player_score,enemy_name,
    enemy_status,enemy_score){

//KIỂM TRA LƯỢT CHƠI
if(turns!=0){

//ẨN NÚT SẴN SÀNG
if(player_status=='questioning' || player_status=="questioned" 
|| player_status=="waiting_for_answer" 
|| player_status=="answering" || player_status=="answered"){
    $('#readyBtn').fadeOut()
}

//TRẠNG THÁI NONE
if(player_status=='none'){
$('#readyBtn').removeClass('disabled').text('Sẵn sàng').attr('onclick','updatePlayerStatus("'+currentUser.name+'","ready")')
}
//

//TRẠNG THÁI READY
//người chơi 1
if(player_status=='ready'){
$('#readyBtn').addClass('disabled').removeClass('loading').text("Đã sẵn sàng")
}
//người chơi 2
if(enemy_status=='ready'){
}
//người chơi 1 và người chơi 2
if(player_status=='ready' && enemy_status=='ready'){
let second=4
const secondInterval= setInterval(()=>{
    second--
    if(second==-1){
        updatePlayerStatus(room_creator,'questioning')
        clearInterval(secondInterval)
    }else{
        userMsg("Cả 2 đã sẵn sàng, trò chơi sẽ bắt đầu sau "+second)
    }
   
},1000)
}   
//

//TRẠNG THÁI QUESTIONING
//player
if(player_status=='questioning'){
userMsg('Đến lượt bạn ra câu hỏi...')
$('#questioning_form').fadeIn()
animatingPlayer()
}
//người chơi 2
if(enemy_status=='questioning'){
    animatingEnemy()
userMsg(enemy_name+' đang ra câu hỏi cho bạn...')
}
//


//TRẠNG THÁI QUESTIONED
//người chơi 1
if(player_status=='questioned' ){
$('#questioning_form').fadeOut()
}
//enemy
if(enemy_status=='questioned' ){
}
//


//TRẠNG THÁI ANSWERING
//player
if(player_status=='answering' ){
    animatingPlayer()
userMsg('Tới lượt bạn trả lời câu hỏi...')
roomRef.get().then(sn=>{
    const question=sn.val().question
    const answer1=sn.val().answer1
    const answer2=sn.val().answer2
    $('#answer_form #question').text(question)
    $('#answer_form #answer1').text(answer1).attr('onclick','answerQuestion('+answer1+')')
    $('#answer_form #answer2').text(answer2).attr('onclick','answerQuestion('+answer2+')')
    $('#answer_form').fadeIn()
})
}
//enemy
if(enemy_status=='answering' ){
    animatingEnemy()
userMsg('Vui lòng đợi, '+enemy_name+' đang trả lời câu hỏi của bạn...')
}
//


//TRẠNG THÁI ANSWERED
//người chơi 1
if(player_status=='answered' ){
$('#answer_form').fadeOut()
}
//người chơi 2
if(enemy_status=='answered' ){
userMsg(enemy_name+" đã trả lời câu hỏi của bạn")
}
//


}else{
    //HÀM KIỂM TRA NGƯỜI THẮNG
checkWinner(player_score,enemy_name,enemy_score)
//
}

showMessages()

}
//

function animatingPlayer(){
    $('#user_1').css({'filter':'brightness(1.5)'}).transition('set looping').transition('pulse','2000ms')
    $('#user_2').css({'filter':'brightness(1)'}).transition('remove looping')
}

function animatingEnemy(){
    $('#user_2').css({'filter':'brightness(1.5)'}).transition('set looping').transition('pulse','2000ms')
    $('#user_1').css({'filter':'brightness(1)'}).transition('remove looping')
}


//KIỂM TRA NGƯỜI CHIẾN THẮNG
function checkWinner(player_score,enemy_name,enemy_score){
    if(player_score>enemy_score){
        userMsg('Bạn đã chiến thắng')
    }else{
        userMsg("Bạn đã thua, "+enemy_name+" đã chiến thắng")
    }
    let second=5;
    const interval=setInterval(()=>{
        second--
        if(second<=3){
             userMsg('Phòng sẽ được giải tán sau '+second)
        }
        if(second==0){
outRoom()
clearInterval(interval)
        }
    },1000)
}


//HÀM CẬP NHẬT TRẠNG THÁI PLAYER
function updatePlayerStatus(user,status){
    if(status=='none'){
         $('#readyBtn').addClass('loading')
    }
    roomRef.get().then(sn=>{
        if(sn.val().room_creator==user){
            roomRef.update({
                room_creator_status:status
            })
        }else{
            roomRef.update({
                competitor_status:status
            })
        }
    })
}
//

//HÀM CẬP NHẬT TRẠNG THÁI ENEMY
function updateEnemyStatus(status){
    roomRef.get().then(sn=>{
        if(sn.val().room_creator!=currentUser.name){
            roomRef.update({
                room_creator_status:status
            })
        }else{
            roomRef.update({
                competitor_status:status
            })
        }
    })
}
//


//RA CÂU HỎI
$('#questioning_form').submit(function(e){
    e.preventDefault()
    $('#questioningBtn').addClass('disabled loading')
    const question=$('#questioning_form #question').val()
    const answer1=$('#questioning_form #answer1').val()
    const answer2=$('#questioning_form #answer2').val()
    $('#true_answer #option1').val(answer1)
    $('#true_answer #option2').val(answer2)
    const true_answer=$( "#true_answer option:selected" ).val()
    roomRef.update({
question:question,
answer1:answer1,
answer2:answer2,
true_answer:true_answer
    }).then(()=>{
        $('#questioningBtn').removeClass('disabled loading')
        updatePlayerStatus(currentUser.name,'questioned')
    updateEnemyStatus('answering')
    })
    
})


//HÀM TRẢ LỜI CÂU HỎI
function answerQuestion(answer){
    updatePlayerStatus(currentUser.name,'answered')
    roomRef.get().then(sn=>{
        let room_creator_score=sn.val().room_creator_score
        let competitor_score=sn.val().competitor_score
        let turns=sn.val().turns
        turns--
        roomRef.update({turns:turns})
        const true_answer=sn.val().true_answer
        if(true_answer==answer){
            userMsg('Bạn đã trả lời đúng')
            if(sn.val().room_creator==currentUser.name){
                room_creator_score++
                roomRef.update({room_creator_score:room_creator_score})
            }else{
                competitor_score++
                roomRef.update({competitor_score:competitor_score})
            }
        }else{
            userMsg('Bạn đã trả lời sai')
            if(sn.val().room_creator==currentUser.name && room_creator_score>0){
                room_creator_score--
                roomRef.update({room_creator_score:room_creator_score})
            }else{
                if(competitor_score>0){
                    competitor_score--
                roomRef.update({competitor_score:competitor_score})
                }  
            }
        }
    })
    setTimeout(()=>{
        updatePlayerStatus(currentUser.name,'questioning')
    },1000)
}


$('#message_form').submit(function(e){
    e.preventDefault()
    $('#message_form #sendMsgBtn').addClass('disabled loading')
    const message=$('#message_form #message').val()
    const time=new Date().toLocaleString()
    messagesRef.push({
        message:message,
        room_key:key_room,
        sender:currentUser.name,
        time: time
    }).then(()=>{
        $('#message_form #message').val('')
        $('#message_form #sendMsgBtn').removeClass('disabled loading')
    })
})


function showMessages(){
    messagesRef.on('value',sn=>{
        if(sn.exists()){
            let html=``
            sn.forEach(message=>{
                if(message.val().room_key==key_room){
                    html+=`<div class="comment">
        <div class="content">
          <a class="author">`
if(message.val().sender==currentUser.name){
    html+=`<span style="color:#2185d0">Bạn</span>`
}else{
   html+= `<span style="color:rgb(219, 40, 40)">${message.val().sender}</span>`
}
          
          html+=`</a>
          <span class="text">
        : ${message.val().message}
          </span>
          <div class="metadata">
            <span class="date">Vào lúc ${message.val().time}</span>
          </div>
        </div>
      </div>`
                }
             
        })
        $('#messages').html(html)
        document.getElementById('messages').scrollTo(0,document.getElementById('messages').scrollHeight)
        }else{
            $('#messages').html('Chưa có tin nhắn nào...')
        }
        
    })
}


//HÀM THÔNG BÁO NGƯỜI CHƠI
function userMsg(msg){
    $('#main #msg .text').text(msg)
}




//HÀM THOÁT HOẶC GIẢI TÁN PHÒNG
function outRoom(){
    $('#outRoomBtn').addClass('disabled loading')
   roomRef.get().then(sn=>{
    if(sn.val().room_creator==currentUser.name){
        messagesRef.get().then(sn=>{
            sn.forEach(message=>{
                if(message.val().room_key==key_room){
                    messagesRef.child(message.key).remove()
                }
            })
        })
        roomRef.remove()
    }else if(sn.val().competitor==currentUser.name){
roomRef.update({
    competitor:'null'
}).then(()=>{
    msgWhenOutRoom('Bạn đã thoát phòng')
})
    }
   })
}

function msgWhenOutRoom(msg){
   let second=4
   const interval=setInterval(()=>{
    second--
    userMsg(msg+', Bạn sẽ thoát ra sau '+second)
    if(second==0){
        location.href="home.html"
    }
   },1000)

}