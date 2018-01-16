//implement logistic regression using javascript

function f(w,x) { //array w, array x (single data)
    sum = 0;
    for (let i = 0; i < w.length; i++) {
        sum += w[i]*x[i] + b;
    }
    return 1/(1+exp(-sum))
}

function L(f,y) {
    sum = 0
    for (let i = 0; i < f.length; i++) {
        sum -= (y[i]*log(f[i]) + (1-y[i])*log(1-f[i]))
    }
    return sum
}

function regression(w,y,x){ // for single w value
    temp = 0;
    for (let j = 0; j < y.length; i++){
        temp += y[i] - f()
    }
    return temp
}

var sigma = 0.01;
var iter = 10000;

const x = [[]]; //data x
const y = [];   //data y
var b = 0;

var w = [];
for (i = 0; i < x[0].length; i++){
    w.push(0);
}