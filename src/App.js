import React, { Component } from 'react';
import logo from './logo.svg';
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
      if (this.state.isFree) {
        console.log('checking tasks to do...');
        db.ref('task').once('value').then((snapshot) => {
          for (var taskID in snapshot.val()) {
            const taskState = snapshot.val()[taskID].state;
            if (taskState === 'queued' || taskState === 'canParallel') {
              return taskID;
            }
          }
          return -1;
        }).then((taskID) => {
          if (taskID !== -1) {
            // get task and start training
            this.setState({ 'isFree': false });
            db.ref('task/'+taskID).once('value').then((snapshot) => {
              const { model, data } = snapshot.val();
              const { result, metrics } = ((model, data) => {
                switch (model.name) {
                  case "LR": 
                    db.ref('task/'+taskID).update({ 'state': 'training' });
                    return this.LR(data);
                  case "RF": 
                    const leftCount = model.count - 25;
                    const updateState = {
                      'state': leftCount > 0 ? 'canParallel' : 'training',
                      'model': {
                        'name': model.name,
                        'count': leftCount
                      } 
                    }
                    db.ref('task/'+taskID).update(updateState);
                    return this.RF(data);
              }})(model, data);
              const d = new Date().getTime()
              db.ref('task/'+taskID+'/result/id-'+d).set(result);
              db.ref('task/'+taskID+'/metrics/id'+d).set(metrics);
              db.ref('task/'+taskID).once('value').then((snapshot) => {
                const { model } = snapshot.val();
                db.ref('task/'+taskID).update({ 
                  'state': (model.name == 'RF' && model.count > 0) ? 'canParallel' : 'done',
                });
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

    return {
      'result': w,
      'metrics': { 'error': error }
    }
  }

  RF(data) {
    const { x_train, y_train, x_test, y_test } = data;
    
    console.log('=================================')
    console.log('       Logistic_Regression       ')
    console.log('=================================')

    const trainingSet = x_train;
    const predictions = y_train;
    const d = new Date().getTime() % 100;

    const options = {
        seed: d,
        maxFeatures: 0.8,
        replacement: true,
        nEstimators: 25
    };

    const classifier = new RandomForestClassifier(options);

    console.log('=================================')
    console.log('          Start training         ')
    console.log('=================================')
    classifier.train(trainingSet, predictions);

    console.log('=================================')
    console.log('          Start testing          ')
    console.log('=================================')
    const y_pred = classifier.predict(x_test);
    
    let match_count = 0;
    for (let k = 0; k < y_test.length; k++) {
      if (y_pred[k] == y_test[k]) match_count++;
    }

    return {
      'result': JSON.stringify(classifier.toJSON()),
      'metrics': { 'test_accuracy': match_count / y_test.length }
    };
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
