# NaMemo
Name + Memo　を由来とする人の名前を覚えるのを補助するスマホアプリです。\
React Native + Typescript + Expo で開発しています。

## Prerequisites (Mac)
### Install `expo-cli`
Run the following command
```
npm install -g expo-cli
```
or
```
yarn global add expo-cli
```
動かない場合はこちらを参照してください　https://docs.expo.io/get-started/installation/

## How to run NaMemo
Run the following command inside `NaMemo/`
```
expo start
```

## Usage
1. 日付、姓（必須）、名（必須）、関係（必須）、メモをフォームに記入し登録

2. リストで表示

3. リストの検索バーに任意のキーワードを入力することでそのキーワードを含むデータのみ表示

4. アイテムを選択すると編集画面に遷移

| 1 | 2 | 3 | 4 |
| --- | --- | --- | --- |
| ![IMG_3424](https://user-images.githubusercontent.com/51317086/127283926-d7b88a73-7b75-4869-908a-1ee427657329.PNG) | ![IMG_3425](https://user-images.githubusercontent.com/51317086/127284371-dead27a2-fac7-4cd5-8f3d-eaf995176a53.PNG) | ![IMG_3426](https://user-images.githubusercontent.com/51317086/127285265-444e4010-73b1-439e-a5f4-737a8fb9b70a.PNG) | ![IMG_3427](https://user-images.githubusercontent.com/51317086/127285776-746d83e9-fb47-488b-94fd-b0e1f4c08511.PNG) |


## Directory Structure and Description
```
App.tsx
Components/
Modules/
```
- App.tsx
アプリ本体
- Components
子要素のディレクトリ
- Modules
関数や型定義ファイル
