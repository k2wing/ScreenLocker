# ScreenLocker
## 概要
- Webページ内へのマウスやキー入力を抑制するJavaScriptクラス。<br>
- 簡潔なコードを記述できるように設計。<br>
- トランジッションやアニメーションにも対応しており、ページ読み込みなどのローディング画面としても使用可能。<br>
## 言語
JavaScript
## 必要なファイル
- screenLocker.js
- log.js
## 使用方法
headタグに以下のようにしてスクリプトの読み込みを記述します。<br>
**ページ読み込み時のローディング画面として使用する場合は必ずheadタグでスクリプトを読み込んでください。body要素で読み込むとチラつきの原因となります。**<br>
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <script src="log.js"></script>
  <script src="screenlocker.js"></script>
</head>
...
```
任意のタイミングでスクリーンをロックする場合はスクリプトを読み込んだ直後に`restoreBody()`メソッドを使用してページの表示を元の状態に復元します。<br>
ローディングとして使用する場合はロックをする直前で`restore()`を使用します。<br>
※`restoreBody()`はスクリプト読み込み時に設定されたbody要素のスタイル`display: none`を削除しているためこのメソッドを使用するまでページは表示されません。
```javascript
new ScreenLocker().restoreBody();
```
スクリーンをロックしたいタイミングで`lock()`を使用します。<br>
このメソッドを使用すると、画面全体を覆うようにして最前面に配置された要素(デフォルト要素)が生成されます。
```javascript
new ScreenLocker().lock("");

// 第1引数にはデフォルト要素のIDを指定できます。
new ScreenLocker().lock("overlay");

// 第2引数に要素を指定する事で任意の子要素を配置できます。
const childElement = document.createElement("span");
childElement.textContent = "screen lock";
new ScrennLocker().lock("overlay", childElement);

// 第3引数はデフォルト要素のclassを指定(可変長引数)できます。
// 追加したclassはunlockでclassを指定しなかった場合に自動で削除されます。これによりトランジッションがスムーズに行えます。
new ScreenLocker().lock("overlay", null, "show");
```
スクリーンのロックを解除したいタイミングで`unlock()`を使用します。<br>
このメソッドを使用すると`lock()`で生成された要素は削除されキーやマウス入力を元の状態に戻します。
```javascript
new ScreenLocker().unlock();

// 第1引数にはアニメーションやトランジッションを正常に終了するために使用します。
// アニメーションの場合は"animation"を指定。
new ScreenLocker().unlock("animation");
// トランジッションの場合はトランジッションに使用した終了判定となるCSSプロパティ名を指定します。複数は指定できません。
new ScreenLocker().unlock("opacity");

// 第2引数はデフォルト要素のclassを指定(可変長引数)できます。
// classを指定しなかった場合はlockで追加したクラスが削除されます。
new ScreenLocker().unlock("", "fade");
```
## デモ

- [Demo1](https://k2wing.github.io/ScreenLocker/demo1.html)<br>
  一時的にページ内のUIに対してマウスやキー入力を抑制するデモです。
- [Demo2](https://k2wing.github.io/ScreenLocker/demo2.html)<br>
  ページ読み込み時のローディングデモです。<br>
  ※`Vue.js`等を使ったページ読み込み時のチラつきにも対応できます。

