var express = require('express');
var router = express.Router();
const locationModel=require('../model/location');//location 저장하는 스키마 가져옴 
//뒤에 js를 안붙이는거? js파일은 형식 안붙여도 require할 수 있다

/* GET home page. */


//root directory를 라우팅 한 것!!!! 나중에 다른 js파일에서 파일 경로 연결할 때, 이런식으로 
//라우팅 해준 것을 통해 연결해준다. 
router.get('/', (req, res, next)=>{//루트라우터( index.ejs 파일을 띄워주는것)
  //   / 라는 경로로 라우팅 요청이 오면
  console.log('index!');
  res.render('index', { title: 'Express' });
  //response, 즉 서버측에서 index.js로 렌더링해준다 
});


//upload라는 라우터 요청 처리
router.get('/upload',(req,res,next)=>{//upload요청이 오면
  res.render('upload');//response, 즉 서버측에서 upload페이지 (upload.ejs)를 렌더링 해준다 
}
)

/* upload.js에서 마커등록 후, 데이터 ajax로 전달하면 얘가 실행됨!!!!! */
router.post('/location',(req,res,next)=>{
  console.log('location post');
  const {title,address,lat,lng}=req.body;
  let location=new locationModel();
  location.title=title;
  location.address=address;
  location.lat=lat;
  location.lng=lng;
  //client로 부터 받아온 내용을 location schema에 저장

  //이제 schema의 틀에 맞게 들어간 내용을 mongodb에 저장해 줄것임! 
  location.save().then((result)=>{
    console.log(result);//save된 후, result를 console로 출력  : 이거는 정상 출력! 
    //result에는 save한 내용, 즉 location 모델의 내용이 저장되어 있음
    res.json({
      message:"success"
    });
  }).catch(error=>{
    console.log(error);
    res.json({
      message:"error"
    });
  });
  //저장이 완료된 후에 json이 가야한다 -> promise 사용!!!!!
  
});

/* main.js에서 ajax로 location 정보 가져오는 부분!  */
router.get("/location",(req,res,next)=>{
  //get메소드를 location url에 사용하면, 아래의 과정에 따라 locationModel에 있는 모든 값들을 찾아와서
  //찾은 모든 결과값들이 result에 저장된다! 
  locationModel.find({},{_id:0,_v:0})
  .then((result)=>{
    console.log(`/location에서 schema에 저장된 값을 불러온 결과: ${result}`);//여기까지는 정상동작 (서버사이드)
    res.json({
      message:"success",
      data:result,
    });
  })
  .catch((error)=>{
      res.json({
        message:"error",
      })
  });//db에서 값 찾아오는 법! id와 v는 0으로 지정했으므로 검색할 때 해당 부분은 생략? 
})





/*
router.get('/test',(req,res,next)=>{
  console.log('enter test url!');
  //get으로 /test url로 요청이 들어왔을 때, 해당 동작 실행
  res.json({
    message:"response from test server"
  });
})
*/




/*
router.post('/test2',(req,res,next)=>{
  //data가 body에 담겨 전달
  const test=req.body.test;//body에 담긴 test라는 이름의 값, client가 "test":"어쩌구" 이렇게 보낸거
  const test2=req.body.test2;
  console.log(`test: ${test}, test2: ${test2}`);
  res.json({
    message:'post to test2 success!'
  })
})
*/ 
//위는 각 body에 담긴 내용들을 각각 가져오는 것

/*
router.post('/test2',(req,res,next)=>{
  const {test,test2}=req.body;//한번에 가져올 수 있따! 
  console.log(`test: ${test}, test2: ${test2}`);

  res.json({
    message:"post succeded in test2 server"
  })
})
*/
module.exports = router;
