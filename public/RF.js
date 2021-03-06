import IrisDataset from 'ml-dataset-iris';
import {RandomForestClassifier} from 'ml-random-forest';
import fetch from 'isomorphic-fetch';

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
classifier.train(trainingSet, predictions);
var result = classifier.predict(trainingSet);
console.log(result)