NMLAB Final Project
===

## Introduction

#### Machine Learning Website: React
將我們想要進行的machine learning任務放到雲端上，並使用連進此網站user的CPU資源來幫助我們進行machine learning。

#### Database: Firebase
Database使用的是[Google Firebase](https://www.google.com.tw/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&ved=0ahUKEwjc1-Pe-ObYAhUChrwKHXB_Cw0QFggmMAA&url=https%3A%2F%2Ffirebase.google.com%2F&usg=AOvVaw3fzCjfkgyYXdUPCdS8VWFg)所提供的實時資料庫服務，搭配其javascript與python的API來進行前後端的資料儲存與交換。機器學習的任務以task包裝:主控者可以藉由上傳task到資料庫，而user在前端會自動去向資料庫取得新的task，將task接收後執行並回傳結果到資料庫。

#### Machine Learning Task Management
一個task由JSON格式包裝，結構如下
```
{
    "state": "queued/training/canParallel/done",
    "model": {
        "name": training_model,
        "count": number_of_estimators_for_random_forest
    },
    "data": {
        "x_train": [training_data...]
        "y_train": [training_label...]
        "x_test": [testing_data...]
        "y_test": [testing_label..]
    }
}
```
User端自動定期檢查databse中`state`為閒置(`queued`)的任務，並將閒置任務下載下來後修改`state`為`training`來避免其他user重複處理同樣的任務；若是random forest的訓練方法，則視情況修改`state`為`canParallel`來讓其他user也能同時訓練相同任務，最後再將各自的model整合在一起。任務結束後將`state`改為`done`，並將訓練好的模型參數包裝在`result`下、訓練evaluation結果包裝在`metrics`下，兩者再傳回到task中。

## Usage

`db.py`為由python實作的一個可以與database互動的介面。
```shell
python3 db.py -h

# usage: db.py [-h] [--reset] [--state] [-t taskID] [-a filename]
# 
# Access to firebase database
#
# optional arguments:
#   -h, --help   show this help message and exit
#   --reset      reset database
#   --state      list all tasks
#   -t taskID    get status of specific task
#   -a filename  add new task with task description JSON file
```
為了方便測試，`--reset`指令可以重置database(預設送出一些task放到database中，內容如`data.json`所示)。而`--state`可以顯示出所有在database中的task狀態
```shell
python3 db.py --state

# TaskID  Model  Status
# ==========================
# 1       LR     done
# 2       RF     canParallel
# 3       RF     training
# 4       RF     queued
# 5       LR     queued
```
`-t`選項可以詳細列出某一項task的狀態與內容：
```shell
python3 db.py -t 1

# Task ID       1
# Task model    LR
# Task status   done
# Eval metrics  {u'id1516463923010': {u'error': 0.0047493813563330295}}
```
`-a`用來將新的task加入到database中：
```shell
python3 db.py -a newData.json
```


