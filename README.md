# NaMemo
Name + Memo　を由来とする人の名前を覚えるのを補助するスマホアプリです。\
React Native + Typescript + Expo で開発しています。

## Prerequisites
Run the following command inside `NaMemo/`
```
yarn
```
Expoの開発環境が必要ですがおそらく上記のコマンドで十分。\
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
