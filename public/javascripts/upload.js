/*   upload.ejs에 대한 javascript!  */

const mapContainer=document.getElementById("map");
console.log(mapContainer);
const mapOption={
    center:new kakao.maps.LatLng(37.554477,126.970419),
    level:3,
};

/* 지도표시 */
let map=new kakao.maps.Map(mapContainer,mapOption);

let infoWindow=new kakao.maps.InfoWindow({
    zIndex:1,
});

let markerList=[];

let ps=new kakao.maps.services.Places();

searchPlaces();

function searchPlaces(){
    let keyword=$("#keyword").val(); 
    //id가 keyword인 text 안의 내용을, keyword란 변수에 저장. 
    //jquery 문법! 
    ps.keywordSearch(keyword,placesSearchCB);
    //keyword기반으로 검색, 결과값을 placeSearchCB라는 함수를 통해 callback
}

function placesSearchCB(data,status){
    //입력받은 결과 데이터: data, 결과상태 반환: status
    if(status===kakao.maps.services.Status.OK){
        //status ok 라면
        displayPlaces(data);
    }
    else if(status===kakao.maps.services.Status.ZERO_RESULT){
        alert("no serach result");
        return;
    }else if(status===kakao.maps.services.Status.ERROR){
        alert("error while search");
        return;
    }
}

function displayPlaces(data){
    let listEl=document.getElementById("placesList");
    let bounds=new kakao.maps.LatLngBounds();//검색했을 때 해당 지역으로 이동할 때, 마커에 담아지게?

    removeAllChildNodes(listEl);//place 들 정보가 담긴 리스트의 자식(item들)을 모두 지운다
    removeMarker();

    for (let i=0;i<data.length;i++){
        let lat=data[i].y;
        let lng=data[i].x;
        let address_name=data[i]["address_name"];
        let place_name=data[i]["place_name"];
        console.log(`lat: ${lat}, long: ${lng}, add: ${address_name}, place name: ${place_name}`);

        const placePosition=new kakao.maps.LatLng(lat,lng);
        bounds.extend(placePosition);//bounds에 추가

        let marker=new kakao.maps.Marker({
            position:placePosition,
        });

        marker.setMap(map);
        markerList.push(marker);

        const el=document.createElement("div");
        const itemStr=`
        <div class="info">
            <div class="info_title">
                ${place_name}
            </div>
            <span>${address_name}</span>
        </div>`;

        el.innerHTML=itemStr;
        el.className="item";

        kakao.maps.event.addListener(marker,"click",function(){
            console.log('marker clicked! '+el.innerHTML);
            displayInfoWindow(marker,place_name,address_name,lat,lng);
        });

        kakao.maps.event.addListener(map,"click",function(){
            infoWindow.close();
        });

        el.onclick=function(){
            console.log('el clicked! '+el.innerHTML);
            displayInfoWindow(marker,place_name,address_name,lat,lng);
        }

        listEl.appendChild(el);
    }//end of for

    map.setBounds(bounds);//인근영역으로 이동(마커주위로 지도 이동)
}

function displayInfoWindow(marker,place_name,address_name,lat,lng){
    let content=`
    <div style="padding:25px;">
        ${place_name}<br>
        ${address_name}<br>
        <button onClick="onSubmit('${place_name}','${address_name}',${lat},${lng});">등록</button>
    </div>`;
    
    map.panTo(marker.getPosition());//위도경도 변환 필요없이 해당 마커 주변으로 지도 초점 이동? 
    infoWindow.setContent(content);
    infoWindow.open(map,marker);//infowindow 표시
}

/* /upload에서 한 마커에 대해 "등록" 할 경우, /location으로 해당 마커주소의 정보를 !!!!!post!!!!!! 한다 */
function onSubmit(title,address,lat,lng){
    console.log(`onsubmit from upload.js / title: ${title}, address: ${address}, lat: ${lat}, long: ${lng}`);
    $.ajax({
        url:"/location",
        data:{title,address,lat,lng},
        type:"POST",
    }).done((response)=>{
        /* done은 data 요청이 제대로 이루어졌을 때 실행  */
        //response에 담긴게 뭐지???? index.js에서 보내는 success 메세지가 담겨있을 것임! 
        console.log("location으로 등록 성공!"+"post 한 data: "+response);
        alert('success');
    }).fail((error)=>{
        console.log("fail은 data 요청이 실패했을 때 발생");
        alert('fail');
    });
};

function removeAllChildNodes(el){
    while(el.hasChildNodes()){//el, 즉 place list에 child 노드가 있다면
        el.removeChild(el.lastChild);//el에서 맨 마지막 child를 지운다
    }
}

function removeMarker(){
    for(let i=0;i<markerList.length;i++){
        markerList[i].setMap(null);//마커들을 저장해둔 리스트에서, 각 마커에 대해 지도에서 표시를 지움
    }
    markerList=[];//markerList를 빈 배열로 초기화
}