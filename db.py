import argparse
import json
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

def get_db():
    cred = credentials.Certificate('mljs-9c8d3a5283c3.json')
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://mljs-85ca7.firebaseio.com/'
    })
    ref = db.reference('/task')  
    return ref

def reset_db():
    db = get_db()
    db.set(json.load(open('data.json'))['task'])

def list_all_tasks():
    db = get_db().get()
    for i in range(len(db)):
        task = db[i]
        print('Task {0}: {1:>8s}'.format(
            i, task['state']
        ))

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Access to firebase database')
    parser.add_argument('--reset', action='store_true',
        help='reset database')
    parser.add_argument('--state', action='store_true',
        help='list all tasks')
    args = parser.parse_args()

    if args.reset:
        reset_db()

    if args.state:
        list_all_tasks()
        