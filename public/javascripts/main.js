/* main페이지, root 페이지의 index.ejs와 연결되어 있는 페이지! 
    메인 지도화면 표시 
 */


var mapOptions = {
    center: new naver.maps.LatLng(37.3595704, 127.105399),
    zoom: 10
};

var map = new naver.maps.Map('map', mapOptions);


/* ajax로 location url로 부터 사용자가 업로드(등록)한 모든 장소정보 가져옴  (index.js 에서의 GET) */
$.ajax({
    url:"/location",
    type:"GET"
}).done(response=>{
    if(response.message!=="success"){
        return;
    }

    console.log(`main.js에서 ajax로 get한 데이터 - message: ${response.message}, data: ${JSON.stringify(response.data)}`);
    /*  response.data에 내용이 제대로 전달되지 않음
        index.js에서 db로 부터 값 찾는건 ok, 근데 res.json 으로 response 보낸 다음에 response.data가 제대로 전달 안된것같음  */


    //done후, response.message가 success라면 아래 과정들 수행! 
    const data=response.data;
    //index.js에서 db에서 데이터들을 가져오고, 그에 대한 메세지를 'message'에, 찾은 결과를 'data'에 저장해서 json으로 response 했으므로

    let markerList=[];
    let infoWindowList=[];

    const onClickHandler=(i)=>()=>{//함수에서 함수를 return
        //console.log('click marker number :',i);
        const marker=markerList[i];//마커리스트에서 클릭된 마커 정보 가져오고
        const infowin=infoWindowList[i];
        if(infowin.getMap()){//이미 infowindow가 열려있으면 닫고
            infowin.close();//이게 return 되거나
        }else{
            infowin.open(map,marker);//infowindow가 안열려있으면 열고
            //이게 return 된다! 
        }
    };

    const onClickMap=(i)=>()=>{
        const infowindow=infoWindowList[i];
        infowindow.close();
    }

    /*
    위와 동일한 구조: 함수를 return 한다! 
    function getClickHandler(i){
        return function)(){
        
        }
    }
    */

    for (let i in data){
        const target=data[i];
        const latlng=new naver.maps.LatLng(target.lat,target.lng);
        console.log(`lat lng: ${latlng}`);


        let marker=new naver.maps.Marker({
            map:map,
            position:latlng,
            icon:{
                content:`<div class="marker"></div>`,
                anchor:new naver.maps.Point(7.5,7.5),//마커의 넓이와 높이 1/2정도
            }
        });

        const content=`
        <div class='infowindow_wrap'>
            <div class='infowindow_title'>${target.title}</div>
            <div class='infowindow_address'>${target.address}</div>
        </div>
        `;

        const infowindow=new naver.maps.InfoWindow({
            content:content,
            backgroundColor:'#00ff0000',
            borderColor:'#00ff0000',
            anchorSize:new naver.maps.Size(0,8),
        });

        markerList.push(marker);
        infoWindowList.push(infowindow);
    }
    //data list 돌면서 marker 정보 체크 종료

    for (let i=0, ii=markerList.length;i<ii;i++){
        naver.maps.Event.addListener(markerList[i],"click",onClickHandler(i));
        naver.maps.Event.addListener(map,"click",onClickMap(i));
    }

    //cluster 될 마커 갯수에 따라 각각 사용 
    const cluster1={
        content:`<div class="cluster1"></div>`,
    };
    const cluster2={
        content:`<div class="cluster2"></div>`,
    };

    const cluster3={
        content:`<div class="cluster3"></div>`,
    };

    //MarkerClustering.js를 main.js 보다 앞에 import 해와서 가능한건가? 
    const markerClustering=new MarkerClustering({
        minClusterSize:2,
        maxZoom:12,
        map:map,//naver map에 표시할것임을 명시
        markers:markerList,
        disableClickZoom:false,//cluster클릭 시, 자세히 보기 가능
        gridSize:20,//cluster영역 설정
        icons:[cluster1,cluster2,cluster3],
        indexGenerator:[2,5,10],//마커 수 2개이상: c1, 5개이상 10개 이하: c2, 10개이상: c3 생성
        stylingFunction:(clusterMarker,count)=>{
            $[clusterMarker.getElement().find("div:first-child").text(count)];
        }
    })

});//end of done (ajax로 받아온 response.message가 success 일 때 수행)

const urlPrefix="https://navermaps.github.io/maps.js/docs/data/region";
const urlSuffix=".json";

let regionGeoJson=[];
let loadCount=0; //17개까지만 로드해 올 수 있도록?

const tooltip=$(
    `<div style="position:absolute;z-index:1000;padding:5px 10px; background:white; border:1px solid black; font-size:14px; display:none; pointer-events:none;"></div>`
);

tooltip.appendTo(map.getPanes().floatPane);

naver.maps.Event.once(map,"init_stylemap",()=>{
    for(let i=1;i<18;i++){
        let keyword=i.toString();
        if(keyword.length===1){
            keyword="0"+keyword;
        }
        $.ajax({
            url:urlPrefix+keyword+urlSuffix,
        }).done((geojson)=>{
            //ajax done 시, 결과 데이터가 geojson에 저장된다
            regionGeoJson.push(geojson);
            loadCount++;//불러올 region 갯수를 컨트롤 해주기 위해
            if(loadCount===17){
                //17개의 도에 대한 정보가 들어오게 된다! 
                startDataLayer();
            }
        });//end of done
    };//end of for
});


/* 17개 도 정보가 모두 불러와진 후에 실행되는 함수  */

function startDataLayer(){
    map.data.setStyle(feature=>{
        const styleOptions={
            fillColor:"#ff0000",
            fillOpacity:0.0001,
            strokeColor:"#ff0000",
            strokeWeight:2,
            strokeOpacity:0.4,
        };

        if(feature.getProperty("focus")){
            //클릭했을 때! 
            styleOptions.fillOpacity=0.6;
            styleOptions.fillColor="#0f0";
            styleOptions.strokeColor="#0f0";
            styleOptions.strokeWeight=4;
            styleOptions.strokeOpacity=1;
        }

        return styleOptions;
    });

    regionGeoJson.forEach((geojson)=>{
        map.data.addGeoJson(geojson);
        //addGeoJson: 도를 구역별로 나누어, 경계선을 표현해주는 함수! 
    })
};//end of function