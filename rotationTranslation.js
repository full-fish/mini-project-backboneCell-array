const fileName = "S2 Br P5 epo";
const fs = require("fs");
const file_csv = fs.readFileSync(`./${fileName}.csv`); //readFile은 비동기 이건 동기
const string_csv = file_csv.toString();

const arr_json = csvToJSON(string_csv);
arr_json.pop(); // 마지막 빈값있길래 지움

// 처음 V값
let originV = [JSON.parse(arr_json[0].X), JSON.parse(arr_json[0].Y)]; // json.parse해서 string을 number로 바꿈

// V를 원점으로 삼기위한 값
let parallelTranslationForOrigin = originV.map((e) => -e);

// 모든 x,y에 대한 데이터
let allXY = [];
arr_json.forEach((e) => allXY.push([JSON.parse(e.X), JSON.parse(e.Y)]));

// 평행이동 시킨 x,y들의 데이터
let parallelTranslationAllXY = allXY.map((e) => [round(e[0] + parallelTranslationForOrigin[0], 1000), round(e[1] + parallelTranslationForOrigin[1], 1000)]);

//시계방향회전인지 여부 판별
let clockwise = true;
if (parallelTranslationAllXY[1][0] < 0) clockwise = false;

// 평행이동한 D값
let parallelTranslationD = [parallelTranslationAllXY[1][0], parallelTranslationAllXY[1][1]];

//V와 D사이거리 구하기
let lengthV_D = round(Math.sqrt(Math.pow(parallelTranslationD[0], 2) + Math.pow(parallelTranslationD[1], 2)), 1000);

//세타 구하기
let Θ = round(90 - (Math.asin(parallelTranslationD[1] / lengthV_D) * 180) / Math.PI, 1000);
if (!clockwise) Θ = -Θ;

//회전시킨 데이터 값들
let rotationTranslationAllXY = parallelTranslationAllXY.map((e) => rotationTranslation(e[0], e[1], Θ));

//기준으로 삼을 최대 Lx, Dy값
let ratioReferenceXY = [200, 530];

//각 데이터에 곱해줄 비율
let rateXY = [Math.abs(ratioReferenceXY[0] / rotationTranslationAllXY[2][0]), Math.abs(ratioReferenceXY[1] / rotationTranslationAllXY[1][1])];

//회전시킨 데이터에 비율따라 곱하기
let resultXY = rotationTranslationAllXY.map((e) => [Math.abs(round(e[0] * rateXY[0], 1)), round(e[1] * rateXY[1], 1)]);

//csv 형식으로 만들기
let result = `,X,Y\r`;
resultXY.forEach((e, index) => {
  result += `${index + 1},${e[0]},${e[1]}\r`;
});

//csv 파일 만들기
fs.writeFileSync(`chaged_${fileName}.csv`, result);

//csv를 JSON으로 바꿔주는 함수
function csvToJSON(csv_string) {
  const rows = csv_string.split("\r\n");
  const jsonArray = [];
  const header = rows[0].split(",");
  for (let i = 1; i < rows.length; i++) {
    let obj = {};
    let row = rows[i].split(",");
    for (let j = 0; j < header.length; j++) {
      obj[header[j]] = row[j];
    }
    jsonArray.push(obj);
  }
  return jsonArray;
}

//소수점 반올림 함수
function round(num, digit) {
  return Math.round(num * digit) / digit;
}

//데이터 회전 시키는 함수
function rotationTranslation(x, y, Θ) {
  let rotationTranslationX = x * Math.cos((Θ * Math.PI) / 180) - y * Math.sin((Θ * Math.PI) / 180);
  let rotationTranslationY = x * Math.sin((Θ * Math.PI) / 180) + y * Math.cos((Θ * Math.PI) / 180);
  return [round(rotationTranslationX, 1000), round(rotationTranslationY, 1000)];
}
//https://curryyou.tistory.com/252
