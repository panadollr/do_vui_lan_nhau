const getDB= firebase.database()
const currentUser=JSON.parse(sessionStorage.getItem('user'))
const roomRef=getDB.ref('rooms')

/* getDB.ref("users/"+"lan2k2").set({
    name:"lan2k2",
    score:0,
    status:"none"
    }) */

    $('#user_name').text(currentUser.name)

    //KIỂM TRA PHÒNG
    roomRef.on('value',sn=>{
        if(sn.numChildren()>0){
             sn.forEach(room=>{
            if(room.val().room_creator==currentUser.name || room.val().competitor==currentUser.name){
                goToRoom(room.key)
            }else{
                $('#createRoomBtn').show()
            }
        })  
        }else{
            $('#createRoomBtn').show()
        }
         
//SHOW DANH SÁCH PHÒNG
showRoom(sn)
//
    })

    function showRoom(rooms){
        let number_of_players
   let html=``
   rooms.forEach(room=>{
     const key_room=room.key
     const room_creator=room.val().room_creator
     const competitor=room.val().competitor
     let turns=room.val().turns

if(competitor!='null'){
    number_of_players=2
    }else{
    number_of_players=1 
    }

html+=`<div class="item">
<div class="right floated content">`
if(number_of_players==1){
    html+=`<br><br><button onclick="joinRoom('${key_room}')" class="ui blue button">Tham gia phòng</button>`
    }
  html+=`</div>
<div class="content">
  <p><div class="ui blue inverted tag label">Mã phòng</div> ${key_room}</p>
  <p><div class="ui red inverted tag label">Người tạo phòng</div> ${room_creator}</p>
  <p><div class="ui green inverted tag label">Số lượng người trong phòng</div>${number_of_players}/2</p>
</div>
</div>`

   })
   $('#rooms_list').html(html)
}


function createRoom(){
    roomRef.push({
        room_creator:currentUser.name,
        room_creator_status:'none',
        room_creator_score:0,
        competitor:'null',
        competitor_status:'none',
        competitor_score:0,
        question:'null',
        answer1:'null',
        answer2:'null',
        true_answer:'null',
        turns:10
    })
}

function goToRoom(key_room){
    sessionStorage.setItem('key_room',JSON.stringify(key_room))
                location.href="room.html"
}

function joinRoom(key_room){
    roomRef.child(key_room).update({
        competitor:currentUser.name
    }).then(()=>{
        goToRoom(key_room)
    })
}
