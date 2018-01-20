import React, { Component } from 'react';
import logo from './logo.svg';
import fetch from 'isomorphic-fetch';
import IrisDataset from 'ml-dataset-iris';
import firebase from 'firebase';
import {RandomForestClassifier} from 'ml-random-forest';
import './App.css';

var config = {
  apiKey: "AIzaSyArkniv60Lq__oV5lEbVmydEbzBodA1F0U",
  authDomain: "mljs-85ca7.firebaseapp.com",
  databaseURL: "https://mljs-85ca7.firebaseio.com",
  projectId: "mljs-85ca7",
  storageBucket: "",
  messagingSenderId: "449983097271"
};
var fire = firebase.initializeApp(config);
var db = fire.database();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      'isFree': true
    }
  }

  componentDidMount() {
    // task manager
    setInterval(() => {
      console.log(this.state);
      if (this.state.isFree) {
        console.log('checking tasks to do...');
        db.ref('task').once('value').then((snapshot) => {
          const taskIndex = snapshot.val().findIndex((item) => item.state === 'queued')
          if (taskIndex !== -1) {
            // get task and start training
            this.setState({ 'isFree': false });
            db.ref('task/' + taskIndex).update({ 'state': 'training' });
            db.ref('task/' + taskIndex).once('value').then((snapshot) => {
              const { data } = snapshot.val();
              const { model, metrics } = this.LR(data);
              db.ref('task/' + taskIndex).update({ 
                'state': 'done',
                'model': model,
                'metrics': metrics
              });
              this.setState({ 'isFree': true });
            });
          }
        });
      }
    }, 5000);
  }

  LR(data) {
    function f(w,x) { //array w, array x (single data)
        sum = 0;
        for (let i = 0; i < w.length; i++) {
            sum += w[i]*x[i] + b;
        }
        return 1/(1+Math.exp(-sum)); //logistic regression
        // return sum; //linear regression
    }
    
    function regression(w,y,x,b){ // full data
        for (let i = 0; i < w.length + 1; i++){
            //for each w[i]
            let temp = 0;
            for (let n = 0; n < y.length; n++){
                if (i === w.length) temp += (y[n] - f(w,x[n]))
                else temp += (y[n] - f(w,x[n]))*x[n][i];
            }
            if (i === w.length) b = b + sigma * temp;
            else w[i] = w[i] + sigma * temp;
        }
        return w;
    }

    const { x_train, y_train, x_test, y_test } = data;

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

    fetch('/result/lr', {
      method: 'post',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          weight: w,
          error: error
      })
    })

    return {
      'model': w,
      'metrics': { 'error': error }
    }
  }

  RF(data) {
    console.log('=================================')
    console.log('       Logistic_Regression       ')
    console.log('=================================')

    var trainingSet = IrisDataset.getNumbers();
    var predictions = IrisDataset.getClasses().map(
        (elem) => IrisDataset.getDistinctClasses().indexOf(elem)
    );

    var options = {
        seed: 3,
        maxFeatures: 0.8,
        replacement: true,
        nEstimators: 25
    };

    var classifier = new RandomForestClassifier(options);
    console.log('=================================')
    console.log('          Start training         ')
    console.log('=================================')
    classifier.train(trainingSet, predictions);
    console.log('=================================')
    console.log('          Start testing          ')
    console.log('=================================')
    var result = classifier.predict(trainingSet);
    console.log(result)
    console.log(typeof result)
    fetch('/result/rf', {
      method: 'post',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          result:result
      })
    })
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
