//implement logistic regression using javascript
function f(w,x) { //array w, array x (single data)
    sum = 0;
    for (let i = 0; i < w.length; i++) {
        sum += w[i]*x[i] + b;
    }
    return 1/(1+Math.exp(-sum)); //logistic regression
    // return sum; //linear regression
}

// function L(f,y) {
//     sum = 0
//     for (let i = 0; i < f.length; i++) {
//         sum -= (y[i]*log(f[i]) + (1-y[i])*log(1-f[i]))
//     }
//     return sum
// }

function regression(w,y,x,b){ // full data
    for (let i = 0; i < w.length + 1; i++){
        //for each w[i]
        temp = 0;
        for (let n = 0; n < y.length; n++){
            if (i === w.length) temp += (y[n] - f(w,x[n]))
            else temp += (y[n] - f(w,x[n]))*x[n][i];
        }
        if (i === w.length) b = b + sigma * temp;
        else w[i] = w[i] + sigma * temp;
    }
    return w;
}

console.log('=================================')
console.log('       Logistic_Regression       ')
console.log('=================================')

var sigma = 0.01;
var iter = 1000;
var b = 0;
var w = [];
for (let i = 0; i < x_train[0].length; i++){
    w.push(0.0);
}

console.log('=================================')
console.log('          Start training         ')
console.log('=================================')

for (let count = 0; count < iter; count++) {
    if (count % 100 === 99)
        console.log('iteration ' + (count+1));
    w = regression(w,y_train,x_train,b);
}

console.log('=================================')
console.log('          Start testing          ')
console.log('=================================')

var sum = 0
for (let k = 0; k < y_test.length; k++){
    // console.log(sum)
    if (y_test[k] == 1 && f(w,x_test[k]) >= 0.5) sum += 1;
    else if (y_test[k] == 0 && f(w,x_test[k]) < 0.5) sum += 1;
}
// console.log('correct = ' + sum);
// console.log('# of test cases = ' + y_test.length)
var error = sum / y_test.length
console.log('Error = ' + error);

// fetch('/result/lr', {
//     method: 'post',
//     headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//         weight: w,
//         error: error
//     })
// })