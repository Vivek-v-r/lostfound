//

function app() {
  console.log("hello");
}

app();

function app(a, b) {
  console.log(a + b);
}

app(5,5);

const hello=()=>{
    console.log("hi")
}

hello()


let gg=function(){
    console.log("fuk u ");
}

gg()


function add(a,b){
    return a+b
}

function calculate(callback){
    let b = callback(10,10)
    console.log(b);
}

calculate(add)

