//<script>
/**
 * ScreenLocker 1.0.0
 * 
 * Copyright (c) 2024 K.N/k2wing
 * Released under the MIT license
 * https://github.com/k2wing/ScreenLocker/blob/main/LICENSE
 */
class ScreenLocker {
    
    // シングルトンインスタンス生成時に#singleton宣言されてませんエラーを回避
    static #singleton;
    
    static #_ = this.#singleton = new ScreenLocker();

    #div;
    #classList;
    #onCleanUp;

    get #CSS_BASE_CLASS() {return "_screen-lock-base"}

    // スクリプトが読み込まれた時にシングルトンインスタンス生成と同時に初期化
    // それ以降newでインスタンス生成されるとScreenLocker.#singletonが返る
    constructor() {
        return ScreenLocker.#singleton ?? this.#init();
    }

    #init() {
        // スタイル属性に直接設定すると優先順位が高すぎて外部CSSでimportantを使用しても
        // アニメーションを使用した際にスタイルが適用されないのでスタイル要素に追加する
        // ※ScreenLockerをスタンドアローンで機能させたいのでスタイルの設定はここで行う
        const style = document.head.appendChild(document.createElement("style"));
        style.sheet.insertRule(
            `.${this.#CSS_BASE_CLASS} {
                position: fixed;
                opacity: 0;
                left: 0px;
                top: 0px;
                width: 100%;
                height: 100%;
                z-index: 9999;
            }`
        );

        // ページ読み込みの用途で使用する時、大抵はonloadでlockするのでこのタイミングだと
        // HTML読み込みが完了しているため微妙にちらつくことが想定される。
        // これを対策するためあらかじめBODYを非表示にしておき、onloadのタイミングで
        // restoreBodyメソッドを呼び出し表示する(以下のスタイルを削除して元に戻す)
        const index = style.sheet.insertRule(
            `BODY{display: none}`
        );

        // 上記で設定した非表示状態を解除する
        // restoreBodyを通常プロパティでオーバーライドして実行後に削除してプロトタイプのメソッドに戻す
        // ※document.body.style.display="initial"と設定するとBODYへのクラスの付け替えなどで変更がしづらくなる事を考えてルールの削除で対応
        this.restoreBody = () => {
            style.sheet.deleteRule(index);
            delete this.restoreBody;
            return this;
        }

        // このクラスの唯一のインスタンスが返る
        return this;
    }

    /**
     * BODYを元の状態に戻す
     * このクラスを読み込むとBODY要素が非表示状態になるためページ読み込み完了後に必ず実行する
     * @returns このオブジェクト
     */
    restoreBody(){return this}

    /**
     * スクリーンをロックする
     * 画面全体を覆う要素を前面に表示して入力の一切を受け付けないフィールドを生成する。
     * 要素は表示中唯一のスクリーンロック用の要素であるため重複したロックは不可。
     * @param {string} id - スクリーンを覆う要素のIDを指定。
     * @param {HTMLElement} child - 覆った要素の子エレメントを指定。
     * @param  {...any} classList - 追加するCSSクラスを指定。unLockでCSSクラスを指定してない場合、ここで指定したクラスが削除される。
     */
    lock(id, child, ...classList) {
        
        if(this.#div) return;

        log(`screen lock: start`);

        this.#classList = classList;
        const div = document.createElement("DIV");
        
        div.id = id;
        div.classList.add(this.#CSS_BASE_CLASS);
        if(child) div.appendChild(child);
        this.#div = document.body.appendChild(div);
        
        log(`screen lock child: `, child);

        // スクリーンを覆ってマウス入力は防げてもキー入力は防げないので、
        // キー入力があればアクティブエレメントのフォーカスを外し、タブキーでの移動をキャンセルさせる
        const onKeydown = e => {
            document.activeElement.blur();
			if (e.keyCode == 9) e.preventDefault();
		};

        globalThis.addEventListener("keydown", onKeydown);

        this.#onCleanUp = () => {

            document.body.removeChild(this.#div);
            globalThis.removeEventListener("keydown", onKeydown);
            this.#div = this.#classList = this.#onCleanUp = undefined;

            log(`screen unlock: end`);
        }

        // 上記IDと同時にクラスでスタイルを適用するとトランジッションのトリガーが発生しないので次の描画でクラスを設定するようにする
        globalThis.requestAnimationFrame(() =>
            setTimeout(() => {

                if(classList.length) {

                    this.#div.classList.add(classList);   
                }

                log(`screen lock element:`, div);
                log(`screen lock: end`);
            })
        );
    }

    /**
     * スクリーンのロックを解除する
     * @param {string} propertyName - 終了処理を正常に行うためにアニメーションやトランジッションを使用した場合の指定をする。
     * トランジッションを使用した場合は適用したプロパティ名を、アニメーションを使用した場合はanimationを指定する。指定無しで即座に終了処理を行う。
     * @param  {...any} classList - 追加するCSSクラスを指定。ここでクラスを指定しなかった場合かつlockでクラスを指定しているとそのクラスが削除される。
     */
    unlock(propertyName, ...classList) {

        if(this.#div === undefined) return;

        log(`screen unlock: start`);

        if(classList.length) {

            this.#div.classList.add(classList);

        } else if(this.#classList.length) {

            this.#div.classList.remove(this.#classList);
        }

        if(propertyName == "animation") {

            this.#div.addEventListener("animationend", e => { this.#onCleanUp() });

        } else if(propertyName) {

            this.#div.addEventListener("transitionend", e => { if(e.propertyName == propertyName) this.#onCleanUp() });

        } else {

            this.#onCleanUp();
        }
    }
}