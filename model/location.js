//noSQL은 반정형 데이터이므로, 다른 데이터타입이 들어와도 오류아님
//서버 상에서는 위의 장점이 단점이 되므로, 스키마를 지정해주자 
const mongoose=require('mongoose');

const locationSchema=new mongoose.Schema({
    title:{type:String,required:true},
    address:{type:String,required:true},
    lat:{type:Number,required:true},
    lng:{type:Number,required:true},

});

module.exports=mongoose.model("location",locationSchema);
//location.js 파일 내에 있는 locationSchema 라는 값을 location이라는 이름의 mongoose model로 export 한다!
//다른 파일에서 location이라는 이름으로 해당 모델을 사용할 수 있게됨