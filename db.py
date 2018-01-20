import argparse
import json
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

def initFirebase():
    cred = credentials.Certificate('mljs-9c8d3a5283c3.json')
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://mljs-85ca7.firebaseio.com/'
    })

def resetDB():
    data = json.load(open('data.json'))
    db.reference('/task').set(data['task'])
    db.reference('/global').set(data['global'])

def listAllTasks():
    print('TaskID  Model  Status')
    print('==========================')
    for taskID, task in sorted(db.reference('/task').get().items()):
        print('{0:<7s} {1:<6s} {2:<8s}'.format(
            taskID[1:], task['model']['name'], task['state']
        ))

def printTask(taskID):
    if not 't{}'.format(taskID) in db.reference('/task').get().keys():
        print('Task {} does not exists.'.format(taskID))
        return
    task = db.reference('/task/t{}'.format(taskID)).get()
    print('Task ID       {}'.format(taskID))
    print('Task model    {}'.format(task['model']['name']))
    print('Task status   {}'.format(task['state']))
    if 'metrics' in task.keys():
        print('Eval metrics  {}'.format(task['metrics']))
    #print(task['model'])

def addTask(taskFile='newData.json'):
    currentTaskCount = db.reference('/global/taskCount').get()
    data = json.load(open(taskFile))
    data['state'] = 'queued'
    db.reference('/task/t{}'.format(currentTaskCount + 1)).set(data)
    

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Access to firebase database')
    parser.add_argument('--reset', action='store_true',
        help='reset database')
    parser.add_argument('--state', action='store_true',
        help='list all tasks')
    parser.add_argument('-t', type=int, metavar='taskID',
        help='get status of specific task')
    parser.add_argument('-a', metavar='filename', default='newData.json',
        help='add new task with task description JSON file')
    args = parser.parse_args()

    initFirebase()

    if args.reset:
        resetDB()

    if args.state:
        listAllTasks()

    if args.t:
        printTask(args.t)

    if args.a:
        addTask(args.a)
        