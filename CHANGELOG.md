# CHANGELOG

## 2.17.2
* 内部モジュールの更新

## 2.17.1
* 内部モジュールの更新

## 2.17.0
* 内部モジュールの更新

## 2.16.0
* `renderingMode` に `@napi-rs/canvas` を追加

## 2.15.12
* 内部モジュールの更新

## 2.15.11
* コンテンツ内で発生した例外の詳細を出力するように修正

## 2.15.10
* 内部モジュールの更新

## 2.15.9
* 内部モジュールの更新

## 2.15.8
* 内部モジュールの更新

## 2.15.7
* 内部モジュールの更新

## 2.15.6
* 内部モジュールの更新

## 2.15.5
* 内部モジュールの更新

## 2.15.4
* 内部モジュールの更新

## 2.15.3
* 内部モジュールの更新

## 2.15.2
* 内部モジュールの更新

## 2.15.1
* 内部モジュールの更新

## 2.15.0
* 内部モジュールの更新

## 2.14.2
* 内部モジュールの更新

## 2.14.1
* 内部モジュールの更新

## 2.14.0
* `Runner` のリプレイモードをサポート
* `Runner#step()` の戻り値の型を `Promise<void>` に変更

## 2.13.9
* 内部モジュールの更新

## 2.13.8
* 内部モジュールの更新

## 2.13.7
* `Runner#fps` を public に変更

## 2.13.6
* 内部モジュールの更新

## 2.13.5
* 内部モジュールの更新

## 2.13.4
* `renderingMode` を `"canvas"` にした際に `scaleX` または `scaleY` が 0 のエンティティを描画すると、それ以降描画が停止してしまうバグを修正

## 2.13.3
* 内部モジュールの更新

## 2.13.2
* 内部モジュールの更新

## 2.13.1
* 内部モジュールの更新

## 2.13.0
* 内部モジュールの更新

## 2.12.0
* 内部モジュールの更新

## 2.11.0
* 内部モジュールの更新

## 2.10.3
* 内部モジュールの更新

## 2.10.2
* 内部モジュールの更新

## 2.10.1
* 内部モジュールの更新

## 2.10.0
* vm2 を dependencies から削除

## 2.9.2
* 内部モジュールの更新

## 2.9.1
* `NodeScriptAsset` のコンストラクタに `exports` が渡されていなかった問題を修正

## 2.9.0
* pdi-types@1.11.1 に追従
  * `BinaryAsset` に対応
  * `ScriptAsset#exports` に対応

## 2.8.4
* 内部モジュールの更新

## 2.8.3
* 内部モジュールの更新

## 2.8.2
* TypeScript での利用時に `node-canvas` がインストールされていなくてもコンパイルできるように

## 2.8.1
* `NullAudioAsset`, `NullImageAsset`, `NullVideoAsset` を非同期でロードするように

## 2.8.0
* 内部モジュールの更新

## 2.7.3
* 内部モジュールの更新

## 2.7.1
* 内部モジュールの更新

## 2.7.0
* `PlayManager#createPlay()` にオプショナル引数 `AMFlowStoreOptions` を追加

## 2.6.3
* Windows で大量のアセットを使うコンテンツで実行が止まる問題を修正 (ファイル読み込み・ネットワークアクセスの並列実行数を制限するように)

## 2.6.2
* canvas を optionalDependencies　から devDependencies へ変更

## 2.6.1
* 内部モジュールの更新

## 2.6.0
* `RunnerManager#startRunner()` の引数にオプションを追加。ポーズ状態で開始できるように

## 2.5.3
* ティックがない状態で AMFlowClient#getTickList() が誤ってエラーになる問題を修正

## 2.5.2
* 内部モジュールの更新

## 2.5.1
* 内部モジュールの更新

## 2.5.0
* 内部モジュールの更新

## 2.4.2
* 内部モジュールの更新

## 2.4.1
* 内部モジュールの更新

## 2.4.0
* 内部モジュールの更新

## 2.3.1
* `vm2` のバグ回避のためバージョンを固定

## 2.3.0
* 内部モジュールの更新

## 2.2.4
* `engine-files` のエイリアス名 `aev*` を `engine-files-v*` へ変更

## 2.2.3
* 内部モジュールの更新

## 2.2.2
* 内部モジュールの更新

## 2.2.1
* 内部モジュールの更新

## 2.2.0
* 内部モジュールの更新

## 2.1.3
* 内部モジュールの更新

## 2.1.2
* 内部モジュールの更新

## 2.1.1
* @akashic/engine-files@3.2.2 に更新

## 2.1.0
* @akashic/engine-files@3.2.0 に更新
* @akashic/engine-files@2.2.0 に更新
* @akashic/engine-files@1.2.0 に更新

## 2.0.2
* @akashic/engine-files@3.1.9 に更新

## 2.0.1
* @akashic/engine-files@3.1.8 に更新

## 2.0.0
* リポジトリのモノレポを廃止
  * それに伴い `@akashic/headless-driver-runner-v*` 及び `@akashic/headless-driver-runner` は 2.0.0 以降新たなバージョンはリリースされなくなります。

## v1.11.36 (2022-03-03)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#400](https://github.com/akashic-games/headless-driver/pull/400) chore(deps): update dependency eslint-config-prettier to v8.5.0 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.35 (2022-02-28)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#396](https://github.com/akashic-games/headless-driver/pull/396) chore(deps): update dependency @akashic/eslint-config to v1.1.0 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.34 (2022-02-28)

#### Update Dependencies
* `headless-driver`
  * [#360](https://github.com/akashic-games/headless-driver/pull/360) chore(deps): update dependency @akashic/engine-files to v3.1.6 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#369](https://github.com/akashic-games/headless-driver/pull/369) chore(deps): bump shelljs from 0.8.4 to 0.8.5 ([@dependabot[bot]](https://github.com/apps/dependabot))

## v1.11.33 (2022-02-26)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#393](https://github.com/akashic-games/headless-driver/pull/393) chore(deps): update dependency eslint to v8.10.0 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.32 (2022-02-23)

#### Update Dependencies
* `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#390](https://github.com/akashic-games/headless-driver/pull/390) chore(deps): update dependency @types/jest to v27.4.1 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.31 (2022-02-15)

#### Update Dependencies
* `headless-driver`
  * [#385](https://github.com/akashic-games/headless-driver/pull/385) chore(deps): update dependency @types/node-fetch to v2.6.0 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.30 (2022-02-12)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#381](https://github.com/akashic-games/headless-driver/pull/381) chore(deps): update dependency eslint to v8.9.0 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.29 (2022-02-11)

#### Update Dependencies
* `headless-driver`
  * [#380](https://github.com/akashic-games/headless-driver/pull/380) fix(deps): update dependency vm2 to v3.9.7 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.28 (2022-02-10)

#### Update Dependencies
* `headless-driver`
  * [#379](https://github.com/akashic-games/headless-driver/pull/379) chore(deps): update dependency @types/node to v14.18.11 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.27 (2022-02-01)

#### Enhancement
* `headless-driver-runner-v3`
  * [#371](https://github.com/akashic-games/headless-driver/pull/371) 【v1.11.27】内部コンポーネントの更新(engineFiles@3.1.6, engineFiles@2.1.57, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.11.26 (2022-01-29)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#368](https://github.com/akashic-games/headless-driver/pull/368) chore(deps): update dependency eslint to v8.8.0 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.25 (2022-01-21)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#364](https://github.com/akashic-games/headless-driver/pull/364) chore(deps): update dependency typescript to v4.5.5 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.24 (2022-01-19)

#### Update Dependencies
* `headless-driver`
  * [#363](https://github.com/akashic-games/headless-driver/pull/363) chore(deps): update dependency @types/node to v14.18.9 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.23 (2022-01-18)

#### Enhancement
* `headless-driver-runner-v3`
  * [#359](https://github.com/akashic-games/headless-driver/pull/359) 【v1.11.23】内部コンポーネントの更新(engineFiles@3.1.5, engineFiles@2.1.57, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.11.22 (2022-01-11)

#### Update Dependencies
* `headless-driver-runner-v3`
  * [#352](https://github.com/akashic-games/headless-driver/pull/352) chore(deps): update dependency image-size to v1.0.1 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.21 (2022-01-05)

#### Update Dependencies
* `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#350](https://github.com/akashic-games/headless-driver/pull/350) chore(deps): update dependency jest to v27.4.7 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.20 (2022-01-04)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#348](https://github.com/akashic-games/headless-driver/pull/348) chore(deps): update dependency @typescript-eslint/eslint-plugin to v5.9.0 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.19 (2022-01-03)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#347](https://github.com/akashic-games/headless-driver/pull/347) chore(deps): update dependency eslint-plugin-import to v2.25.4 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.18 (2022-01-01)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#344](https://github.com/akashic-games/headless-driver/pull/344) chore(deps): update dependency eslint to v8.6.0 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.17 (2021-12-31)

#### Update Dependencies
* `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#343](https://github.com/akashic-games/headless-driver/pull/343) chore(deps): update dependency @types/jest to v27.4.0 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.16 (2021-12-28)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#341](https://github.com/akashic-games/headless-driver/pull/341) chore(deps): update dependency eslint-plugin-jest to v25.3.2 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.15 (2021-12-21)

#### Update Dependencies
* `headless-driver`
  * [#338](https://github.com/akashic-games/headless-driver/pull/338) chore(deps): update dependency @types/node to v14.18.2 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- [@yu-ogi](https://github.com/yu-ogi)

## v1.11.14 (2021-12-18)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#336](https://github.com/akashic-games/headless-driver/pull/336) chore(deps): update dependency eslint to v8.5.0 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.13 (2021-12-17)

#### Update Dependencies
* `headless-driver`
  * [#335](https://github.com/akashic-games/headless-driver/pull/335) chore(deps): update dependency @types/node to v14.18.1 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.12 (2021-12-14)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#332](https://github.com/akashic-games/headless-driver/pull/332) chore(deps): update dependency typescript to v4.5.4 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.11 (2021-12-08)

#### Update Dependencies
* `headless-driver-runner`, `headless-driver`
  * [#322](https://github.com/akashic-games/headless-driver/pull/322) fix(deps): update akashic non-major packages (minor) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- [@yu-ogi](https://github.com/yu-ogi)

## v1.11.10 (2021-12-08)

#### Enhancement
* `headless-driver-runner-v3`
  * [#320](https://github.com/akashic-games/headless-driver/pull/320) 【v1.11.10】内部コンポーネントの更新(engineFiles@3.1.4, engineFiles@2.1.57, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.11.9 (2021-12-05)

#### Update Dependencies
* `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#318](https://github.com/akashic-games/headless-driver/pull/318) chore(deps): update dependency ts-jest to v27.1.0 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.8 (2021-12-05)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#317](https://github.com/akashic-games/headless-driver/pull/317) chore(deps): update dependency prettier to v2.5.1 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.7 (2021-12-04)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#316](https://github.com/akashic-games/headless-driver/pull/316) chore(deps): update dependency eslint to v8.4.0 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#314](https://github.com/akashic-games/headless-driver/pull/314) chore(deps): update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.6 (2021-12-04)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#315](https://github.com/akashic-games/headless-driver/pull/315) chore(deps): update all dependencies (minor) ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.5 (2021-11-27)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#313](https://github.com/akashic-games/headless-driver/pull/313) chore(deps): update dependency prettier to v2.5.0 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.4 (2021-11-25)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#304](https://github.com/akashic-games/headless-driver/pull/304) chore(deps): update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.3 (2021-11-24)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#305](https://github.com/akashic-games/headless-driver/pull/305) chore(deps): update all dependencies (minor) ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.2 (2021-11-24)

#### Update Dependencies
* `headless-driver-runner`
  * [#310](https://github.com/akashic-games/headless-driver/pull/310) chore(deps): pin dependency @types/jest to 27.0.3 ([@renovate[bot]](https://github.com/apps/renovate))

## v1.11.1 (2021-11-16)

#### Enhancement
* `headless-driver-runner-v3`
  * [#311](https://github.com/akashic-games/headless-driver/pull/311) 【v1.11.1】内部コンポーネントの更新(engineFiles@3.1.3, engineFiles@2.1.57, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.11.0 (2021-11-05)

#### Bug Fix
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver`
  * [#309](https://github.com/akashic-games/headless-driver/pull/309) fix: export `g` namespaces ([@yu-ogi](https://github.com/yu-ogi))

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#302](https://github.com/akashic-games/headless-driver/pull/302) chore(deps): update dependency eslint to v8 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#297](https://github.com/akashic-games/headless-driver/pull/297) chore(deps): update all dependencies (minor) ([@renovate[bot]](https://github.com/apps/renovate))
  * [#296](https://github.com/akashic-games/headless-driver/pull/296) chore(deps): update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- ShinobuTakahashi ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))
- [@yu-ogi](https://github.com/yu-ogi)

## v1.10.1 (2021-10-06)

#### Enhancement
* `headless-driver-runner-v3`
  * [#300](https://github.com/akashic-games/headless-driver/pull/300) 【v1.10.1】内部コンポーネントの更新(engineFiles@3.1.1, engineFiles@2.1.57, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.10.0 (2021-10-01)

#### Enhancement
* `headless-driver-runner-v3`
  * [#299](https://github.com/akashic-games/headless-driver/pull/299) 【v1.9.7】内部コンポーネントの更新(engineFiles@3.1.0, engineFiles@2.1.57, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.9.6 (2021-09-30)

#### Enhancement
* `headless-driver-runner-v3`
  * [#298](https://github.com/akashic-games/headless-driver/pull/298) 【v1.9.6】内部コンポーネントの更新(engineFiles@3.0.22, engineFiles@2.1.57, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#291](https://github.com/akashic-games/headless-driver/pull/291) chore(deps): update all dependencies (minor) ([@renovate[bot]](https://github.com/apps/renovate))
  * [#295](https://github.com/akashic-games/headless-driver/pull/295) chore(deps): update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.9.5 (2021-09-10)

#### Bug Fix
* `headless-driver-runner-v3`
  * [#294](https://github.com/akashic-games/headless-driver/pull/294) Fix runner-v3's NodeScriptAsset and NodeTextAsset to allow empty string ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))

#### Committers: 1
- ShinobuTakahashi ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))

## v1.9.4 (2021-09-08)

#### Bug Fix
* `headless-driver`
  * [#293](https://github.com/akashic-games/headless-driver/pull/293)  fix: handle non-zero startpoints in PlayManager#createPlay() ([@xnv](https://github.com/xnv))

#### Update Dependencies
* `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#260](https://github.com/akashic-games/headless-driver/pull/260) chore(deps): update jest monorepo (major) ([@renovate[bot]](https://github.com/apps/renovate))
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#277](https://github.com/akashic-games/headless-driver/pull/277) chore(deps): update all dependencies (minor) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- [@yu-ogi](https://github.com/yu-ogi)
- xnv ([@xnv](https://github.com/xnv))

## v1.9.3 (2021-09-01)

#### Enhancement
* `headless-driver-runner-v3`
  * [#281](https://github.com/akashic-games/headless-driver/pull/281) 【v1.9.3】内部コンポーネントの更新(engineFiles@3.0.21, engineFiles@2.1.57, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.9.2 (2021-09-01)

#### Enhancement
* `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver`
  * [#280](https://github.com/akashic-games/headless-driver/pull/280) 【v1.9.2】内部コンポーネントの更新(engineFiles@3.0.20, engineFiles@2.1.57, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Update Dependencies
* Other
  * [#273](https://github.com/akashic-games/headless-driver/pull/273) chore(deps): update remark monorepo (major) ([@renovate[bot]](https://github.com/apps/renovate))
  * [#274](https://github.com/akashic-games/headless-driver/pull/274) chore(deps): update dependency lerna-changelog to v2 ([@renovate[bot]](https://github.com/apps/renovate))
* `headless-driver-runner-v3`
  * [#247](https://github.com/akashic-games/headless-driver/pull/247) chore(deps): update dependency image-size to v1 ([@renovate[bot]](https://github.com/apps/renovate))
* `headless-driver`
  * [#257](https://github.com/akashic-games/headless-driver/pull/257) chore(deps): update dependency @types/node to v14 ([@renovate[bot]](https://github.com/apps/renovate))
* `headless-driver-runner-v3`, `headless-driver`
  * [#275](https://github.com/akashic-games/headless-driver/pull/275) chore(deps): update dependency @types/jest to v27 ([@renovate[bot]](https://github.com/apps/renovate))
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#242](https://github.com/akashic-games/headless-driver/pull/242) chore(deps): update all dependencies (minor) ([@renovate[bot]](https://github.com/apps/renovate))
  * [#240](https://github.com/akashic-games/headless-driver/pull/240) chore(deps): update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.9.1 (2021-08-19)

#### Enhancement
* `headless-driver-runner-v3`
  * [#276](https://github.com/akashic-games/headless-driver/pull/276) 【v1.9.1】内部コンポーネントの更新(engineFiles@3.0.20, engineFiles@2.1.56, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.9.0 (2021-08-12)

#### Enhancement
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#272](https://github.com/akashic-games/headless-driver/pull/272) Add argument RunnerStartParameters of Runner#start() ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))

#### Committers: 1
- ShinobuTakahashi ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))

## v1.8.5 (2021-08-04)

#### Bug Fix
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#271](https://github.com/akashic-games/headless-driver/pull/271) Add stepLoopers() to PlatformV3 ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))

#### Other Change
* `headless-driver`
  * [#270](https://github.com/akashic-games/headless-driver/pull/270) Disable some tests ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))

#### Committers: 1
- ShinobuTakahashi ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))

## v1.8.4 (2021-07-12)

#### Enhancement
* `headless-driver-runner-v2`
  * [#268](https://github.com/akashic-games/headless-driver/pull/268) 【v1.8.4】内部コンポーネントの更新(engineFiles@3.0.19, engineFiles@2.1.56, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.8.3 (2021-07-12)

#### Enhancement
* `headless-driver-runner-v2`, `headless-driver-runner-v3`
  * [#267](https://github.com/akashic-games/headless-driver/pull/267) 【v1.8.3】内部コンポーネントの更新(engineFiles@3.0.18, engineFiles@2.1.55, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.8.2 (2021-07-09)

#### Enhancement
* `headless-driver-runner-v3`
  * [#266](https://github.com/akashic-games/headless-driver/pull/266) 【v1.8.2】内部コンポーネントの更新(engineFiles@3.0.18, engineFiles@2.1.54, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.8.1 (2021-07-05)

#### Enhancement
* `headless-driver-runner-v3`
  * [#264](https://github.com/akashic-games/headless-driver/pull/264) 【v1.7.4】内部コンポーネントの更新(engineFiles@3.0.17, engineFiles@2.1.54, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.8.0 (2021-07-01)

#### Enhancement
* `headless-driver`
  * [#263](https://github.com/akashic-games/headless-driver/pull/263) add AMFlowStore/AMFlowClient putStartPoint Trigger ([@kamakiri01](https://github.com/kamakiri01))

#### Other Change
* `headless-driver-runner`, `headless-driver`
  * [#258](https://github.com/akashic-games/headless-driver/pull/258) テストのリネームなど ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 2
- [@yu-ogi](https://github.com/yu-ogi)
- kamakiri_ys ([@kamakiri01](https://github.com/kamakiri01))

## v1.7.3 (2021-05-25)

#### Enhancement
* `headless-driver-runner-v2`, `headless-driver-runner-v3`
  * [#259](https://github.com/akashic-games/headless-driver/pull/259) 【v1.7.3】内部コンポーネントの更新(engineFiles@3.0.15, engineFiles@2.1.54, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.7.2 (2021-05-24)

#### Bug Fix
* `headless-driver-runner-v3`, `headless-driver`
  * [#256](https://github.com/akashic-games/headless-driver/pull/256) #248 にて`trustedFunctions` が存在しない場合に常に `require("@akashic/engine-files")` へとフォールバックされていた挙動を修正 ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 1
- [@yu-ogi](https://github.com/yu-ogi)

## v1.7.1 (2021-05-20)

#### Bug Fix
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`
  * [#255](https://github.com/akashic-games/headless-driver/pull/255) `Runner#advanceUntil()` の挙動を修正 ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 1
- [@yu-ogi](https://github.com/yu-ogi)

## v1.7.0 (2021-05-19)

#### Enhancement
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#252](https://github.com/akashic-games/headless-driver/pull/252) `g` の名前空間を export するように ([@yu-ogi](https://github.com/yu-ogi))
  * [#250](https://github.com/akashic-games/headless-driver/pull/250) node-canvas へプライマリサーフェスの描画内容を出力する機能の追加 ([@yu-ogi](https://github.com/yu-ogi))
  * [#249](https://github.com/akashic-games/headless-driver/pull/249) trusted フラグの追加 ([@yu-ogi](https://github.com/yu-ogi))

#### Other Change
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#254](https://github.com/akashic-games/headless-driver/pull/254) `Runner#platform`, `DumpedPlaylog` を公開プロパティに変更 ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 1
- [@yu-ogi](https://github.com/yu-ogi)

## v1.5.15 (2021-04-09)

#### Enhancement
* `headless-driver-runner-v3`
  * [#245](https://github.com/akashic-games/headless-driver/pull/245) 【v1.5.15】内部コンポーネントの更新(engineFiles@3.0.14, engineFiles@2.1.53, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.5.14 (2021-04-08)

#### Enhancement
* `headless-driver-runner-v3`
  * [#244](https://github.com/akashic-games/headless-driver/pull/244) 【v1.5.14】内部コンポーネントの更新(engineFiles@3.0.13, engineFiles@2.1.53, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.5.13 (2021-04-06)

#### Enhancement
* `headless-driver-runner-v3`
  * [#243](https://github.com/akashic-games/headless-driver/pull/243) 【v1.5.13】内部コンポーネントの更新(engineFiles@3.0.12, engineFiles@2.1.53, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.5.12 (2021-04-01)

#### Enhancement
* `headless-driver-runner-v3`
  * [#241](https://github.com/akashic-games/headless-driver/pull/241) 【v1.5.12】内部コンポーネントの更新(engineFiles@3.0.11, engineFiles@2.1.53, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Other Change
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#225](https://github.com/akashic-games/headless-driver/pull/225) Add akashic eslint config ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))

#### Committers: 2
- ShinobuTakahashi ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))
- xnv ([@xnv](https://github.com/xnv))

## v1.5.11 (2021-03-16)

#### Enhancement
* `headless-driver-runner-v3`
  * [#239](https://github.com/akashic-games/headless-driver/pull/239) 【v1.5.11】内部コンポーネントの更新(engineFiles@3.0.10, engineFiles@2.1.53, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))
* `headless-driver-runner-v2`
  * [#238](https://github.com/akashic-games/headless-driver/pull/238) 【v1.5.11】内部コンポーネントの更新(engineFiles@3.0.9, engineFiles@2.1.53, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.5.10 (2021-03-15)

#### Update Dependencies
* Other
  * [#237](https://github.com/akashic-games/headless-driver/pull/237) Update dependency lerna to v4 ([@renovate[bot]](https://github.com/apps/renovate))
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#236](https://github.com/akashic-games/headless-driver/pull/236) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))
  * [#228](https://github.com/akashic-games/headless-driver/pull/228) Update all dependencies (minor) ([@renovate[bot]](https://github.com/apps/renovate))
  * [#224](https://github.com/akashic-games/headless-driver/pull/224) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))
* `headless-driver-runner-v3`
  * [#233](https://github.com/akashic-games/headless-driver/pull/233) Update dependency @types/pngjs to v6 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.5.9 (2021-02-16)

#### Enhancement
* `headless-driver-runner-v3`
  * [#235](https://github.com/akashic-games/headless-driver/pull/235) 【v1.5.9】内部コンポーネントの更新(engineFiles@3.0.9, engineFiles@2.1.52, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.5.8 (2021-02-16)

#### Enhancement
* `headless-driver-runner-v2`
  * [#234](https://github.com/akashic-games/headless-driver/pull/234) 【v1.5.8】内部コンポーネントの更新(engineFiles@3.0.8, engineFiles@2.1.52, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Other Change
* [#230](https://github.com/akashic-games/headless-driver/pull/230) add publish script as npm-scripts ([@dera-](https://github.com/dera-))

#### Committers: 2
- [@dera-](https://github.com/dera-)
- xnv ([@xnv](https://github.com/xnv))

## v1.5.7 (2021-02-05)

#### Enhancement
* `headless-driver-runner-v3`
  * [#232](https://github.com/akashic-games/headless-driver/pull/232) 【v1.5.7】内部コンポーネントの更新(engineFiles@3.0.8, engineFiles@2.1.51, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.5.6 (2021-02-05)

#### Enhancement
* `headless-driver-runner-v2`
  * [#231](https://github.com/akashic-games/headless-driver/pull/231) 【v1.5.6】内部コンポーネントの更新(engineFiles@3.0.7, engineFiles@2.1.51, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 2
- kamakiri_ys ([@kamakiri01](https://github.com/kamakiri01))
- xnv ([@xnv](https://github.com/xnv))

## v1.5.5 (2021-01-29)

#### Enhancement
* `headless-driver-runner-v3`
  * [#226](https://github.com/akashic-games/headless-driver/pull/226) 【v1.5.4】内部コンポーネントの更新(engineFiles@3.0.4, engineFiles@2.1.50, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.5.4 (2021-01-29)

#### Bug Fix
* `headless-driver-runner-v3`
  * [#227](https://github.com/akashic-games/headless-driver/pull/227) Fix build ([@yu-ogi](https://github.com/yu-ogi))

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#178](https://github.com/akashic-games/headless-driver/pull/178) Update dependency typescript to v4 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- [@yu-ogi](https://github.com/yu-ogi)

## v1.5.3 (2021-01-07)

#### Enhancement
* `headless-driver-runner-v3`
  * [#223](https://github.com/akashic-games/headless-driver/pull/223) 【v1.5.3】内部コンポーネントの更新(engineFiles@3.0.3, engineFiles@2.1.50, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))
  * [#222](https://github.com/akashic-games/headless-driver/pull/222) 【v1.5.3】内部コンポーネントの更新(engineFiles@3.0.2, engineFiles@2.1.50, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#206](https://github.com/akashic-games/headless-driver/pull/206) Update dependency prettier to v2.2.1 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#221](https://github.com/akashic-games/headless-driver/pull/221) Update actions/setup-node action to v2 ([@renovate[bot]](https://github.com/apps/renovate))
* `headless-driver-runner-v3`, `headless-driver`
  * [#205](https://github.com/akashic-games/headless-driver/pull/205) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.5.2 (2020-12-21)

#### Update Dependencies
* `headless-driver-runner-v3`
  * [#210](https://github.com/akashic-games/headless-driver/pull/210) chore(deps): pin dependencies ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- kamakiri_ys ([@kamakiri01](https://github.com/kamakiri01))

## v1.5.1 (2020-12-02)

#### Enhancement
* `headless-driver-runner-v2`, `headless-driver-runner-v3`
  * [#211](https://github.com/akashic-games/headless-driver/pull/211) 【v1.5.1】内部コンポーネントの更新(engineFiles@3.0.1, engineFiles@2.1.50, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))
* `headless-driver-runner-v3`
  * [#207](https://github.com/akashic-games/headless-driver/pull/207) feat(headless-driver-runner-v3): add a node-canvas implementation ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 2
- [@yu-ogi](https://github.com/yu-ogi)
- xnv ([@xnv](https://github.com/xnv))

## v1.5.0 (2020-11-18)

#### Enhancement
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#202](https://github.com/akashic-games/headless-driver/pull/202) feat: add Runner#firePointEvent() ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 1
- [@yu-ogi](https://github.com/yu-ogi)

## v1.4.0 (2020-11-16)

#### Breaking Change
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#199](https://github.com/akashic-games/headless-driver/pull/199) feat: Add Runner#advance() ([@yu-ogi](https://github.com/yu-ogi))

#### Enhancement
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#199](https://github.com/akashic-games/headless-driver/pull/199) feat: Add Runner#advance() ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 1
- [@yu-ogi](https://github.com/yu-ogi)

## v1.3.4 (2020-11-13)

#### Enhancement
* `headless-driver-runner-v3`
  * [#201](https://github.com/akashic-games/headless-driver/pull/201) 【v1.3.4】内部コンポーネントの更新(engineFiles@3.0.0-beta.11, engineFiles@2.1.48, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.3.3 (2020-11-12)

#### Enhancement
* `headless-driver-runner-v2`, `headless-driver-runner-v3`
  * [#200](https://github.com/akashic-games/headless-driver/pull/200) 【v1.3.3】内部コンポーネントの更新(engineFiles@3.0.0-beta.10, engineFiles@2.1.48, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.3.2 (2020-11-09)

#### Update Dependencies
* `headless-driver`
  * [#198](https://github.com/akashic-games/headless-driver/pull/198) Update dependency ts-jest to v26.4.4 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.3.1 (2020-11-07)

#### Update Dependencies
* `headless-driver`
  * [#197](https://github.com/akashic-games/headless-driver/pull/197) Update dependency jest to v26.6.3 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0



## v1.2.18 (2020-10-31)

#### Update Dependencies
* `headless-driver`
  * [#196](https://github.com/akashic-games/headless-driver/pull/196) Update dependency @types/node to v13.13.30 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.2.17 (2020-10-27)

#### Update Dependencies
* `headless-driver`
  * [#193](https://github.com/akashic-games/headless-driver/pull/193) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.2.16 (2020-10-26)

#### Update Dependencies
* `headless-driver`
  * [#194](https://github.com/akashic-games/headless-driver/pull/194) Update dependency jest to v26.6.1 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.2.15 (2020-10-17)

#### Update Dependencies
* `headless-driver`
  * [#191](https://github.com/akashic-games/headless-driver/pull/191) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#192](https://github.com/akashic-games/headless-driver/pull/192) Update remark monorepo (major) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.2.14 (2020-10-10)

#### Update Dependencies
* `headless-driver`
  * [#189](https://github.com/akashic-games/headless-driver/pull/189) Update dependency @types/node to v13.13.25 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.2.13 (2020-10-10)

#### Update Dependencies
* `headless-driver`
  * [#190](https://github.com/akashic-games/headless-driver/pull/190) Update dependency jest to v26.5.2 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.2.12 (2020-10-03)

#### Update Dependencies
* `headless-driver`
  * [#188](https://github.com/akashic-games/headless-driver/pull/188) Update dependency ts-jest to v26.4.1 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.2.11 (2020-09-30)

#### Enhancement
* `headless-driver-runner-v3`
  * [#186](https://github.com/akashic-games/headless-driver/pull/186) 【v1.2.11】内部コンポーネントの更新(engineFiles@3.0.0-beta.9, engineFiles@2.1.47, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.2.10 (2020-09-20)

#### Update Dependencies
* `headless-driver`
  * [#185](https://github.com/akashic-games/headless-driver/pull/185) Update dependency ts-jest to v26.4.0 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.2.9 (2020-09-19)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#184](https://github.com/akashic-games/headless-driver/pull/184) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.2.8 (2020-09-13)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#179](https://github.com/akashic-games/headless-driver/pull/179) Update all dependencies (minor) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.2.7 (2020-09-13)

#### Update Dependencies
* `headless-driver`
  * [#181](https://github.com/akashic-games/headless-driver/pull/181) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.2.6 (2020-09-12)

#### Update Dependencies
* `headless-driver`
  * [#182](https://github.com/akashic-games/headless-driver/pull/182) Update dependency node-fetch to v2.6.1 [SECURITY] ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.2.5 (2020-09-04)

#### Enhancement
* `headless-driver-runner-v2`
  * [#180](https://github.com/akashic-games/headless-driver/pull/180) 【v1.2.5】内部コンポーネントの更新(engineFiles@3.0.0-beta.8, engineFiles@2.1.47, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.2.4 (2020-08-25)

#### Update Dependencies
* `headless-driver`
  * [#177](https://github.com/akashic-games/headless-driver/pull/177) Update dependency jest to v26.4.2 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.2.3 (2020-08-15)

#### Update Dependencies
* `headless-driver`
  * [#176](https://github.com/akashic-games/headless-driver/pull/176) Update dependency @types/jest to v26.0.10 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.2.1 (2020-08-08)

#### Update Dependencies
* `headless-driver`
  * [#174](https://github.com/akashic-games/headless-driver/pull/174) Update dependency @types/jest to v26.0.9 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.2.0 (2020-08-06)

#### Breaking Change
* `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#173](https://github.com/akashic-games/headless-driver/pull/173) Follow amflow@3.0.0 (supports ignorable event) ([@yu-ogi](https://github.com/yu-ogi))

#### Enhancement
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#172](https://github.com/akashic-games/headless-driver/pull/172) 【v1.1.27】内部コンポーネントの更新(engineFiles@3.0.0-beta.7, engineFiles@2.1.46, engineFiles@1.1.16) ([@xnv](https://github.com/xnv))
* `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#173](https://github.com/akashic-games/headless-driver/pull/173) Follow amflow@3.0.0 (supports ignorable event) ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 2
- [@yu-ogi](https://github.com/yu-ogi)
- xnv ([@xnv](https://github.com/xnv))

## v1.1.26 (2020-08-03)

#### Enhancement
* `headless-driver-runner-v2`
  * [#168](https://github.com/akashic-games/headless-driver/pull/168) 【v1.1.26】内部コンポーネントの更新(engineFiles@3.0.0-beta.7, engineFiles@2.1.43, engineFiles@1.1.15) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.1.25 (2020-08-01)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#166](https://github.com/akashic-games/headless-driver/pull/166) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.1.24 (2020-08-01)

#### Enhancement
* `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver`
  * [#164](https://github.com/akashic-games/headless-driver/pull/164) 【v1.1.24】内部コンポーネントの更新(engineFiles@3.0.0-beta.7, engineFiles@2.1.42, engineFiles@1.1.15) ([@xnv](https://github.com/xnv))

#### Update Dependencies
* `headless-driver`
  * [#167](https://github.com/akashic-games/headless-driver/pull/167) Update dependency jest to v26.2.2 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 2
- ShinobuTakahashi ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))
- xnv ([@xnv](https://github.com/xnv))

## v1.1.23 (2020-07-25)

#### Update Dependencies
* `headless-driver`
  * [#163](https://github.com/akashic-games/headless-driver/pull/163) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.1.22 (2020-07-19)

#### Update Dependencies
* `headless-driver`
  * [#162](https://github.com/akashic-games/headless-driver/pull/162) Update dependency @types/jest to v26.0.5 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.1.21 (2020-07-18)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#161](https://github.com/akashic-games/headless-driver/pull/161) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))
* `headless-driver`
  * [#160](https://github.com/akashic-games/headless-driver/pull/160) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.1.20 (2020-07-04)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#159](https://github.com/akashic-games/headless-driver/pull/159) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.1.19 (2020-06-30)

#### Enhancement
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#157](https://github.com/akashic-games/headless-driver/pull/157) 【v1.1.19】内部コンポーネントの更新(engineFiles@3.0.0-beta.6, engineFiles@2.1.41, engineFiles@1.1.15) ([@xnv](https://github.com/xnv))
  * [#158](https://github.com/akashic-games/headless-driver/pull/158) Follow @akashic/engine-files@3.0.0-beta.6 ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 2
- [@yu-ogi](https://github.com/yu-ogi)
- xnv ([@xnv](https://github.com/xnv))

## v1.1.18 (2020-06-27)

#### Update Dependencies
* `headless-driver`
  * [#155](https://github.com/akashic-games/headless-driver/pull/155) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.1.17 (2020-06-27)

#### Update Dependencies
* `headless-driver`
  * [#156](https://github.com/akashic-games/headless-driver/pull/156) Update dependency jest to v26.1.0 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.1.16 (2020-06-13)

#### Update Dependencies
* `headless-driver`
  * [#151](https://github.com/akashic-games/headless-driver/pull/151) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.1.15 (2020-06-13)

#### Update Dependencies
* `headless-driver`
  * [#152](https://github.com/akashic-games/headless-driver/pull/152) Update dependency @types/jest to v26 ([@renovate[bot]](https://github.com/apps/renovate))

#### Other Change
* [#149](https://github.com/akashic-games/headless-driver/pull/149) publishスクリプトにタグ指定オプションを追加 ([@dera-](https://github.com/dera-))

#### Committers: 1
- [@dera-](https://github.com/dera-)

## v1.1.14 (2020-06-09)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#150](https://github.com/akashic-games/headless-driver/pull/150) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.1.13 (2020-06-03)

#### Bug Fix
* [#147](https://github.com/akashic-games/headless-driver/pull/147) 直下の.npmrcの削除 ([@dera-](https://github.com/dera-))

#### Republish
* [#148](https://github.com/akashic-games/headless-driver/pull/148) Republish ([@xnv](https://github.com/xnv))

#### Committers: 2
- [@dera-](https://github.com/dera-)
- xnv ([@xnv](https://github.com/xnv))

## v1.1.11 (2020-05-26)

#### Update Dependencies
* `headless-driver`
  * [#136](https://github.com/akashic-games/headless-driver/pull/136) chore(deps): update dependency jest to v26 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.1.10 (2020-05-23)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#143](https://github.com/akashic-games/headless-driver/pull/143) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.1.9 (2020-05-23)

#### Update Dependencies
* `headless-driver`
  * [#144](https://github.com/akashic-games/headless-driver/pull/144) Update dependency ts-jest to v26 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v1.1.8 (2020-05-21)

#### Enhancement
* `headless-driver-runner-v2`
  * [#142](https://github.com/akashic-games/headless-driver/pull/142) 【v1.1.8】内部コンポーネントの更新(engineFiles@3.0.0-beta.5, engineFiles@2.1.40, engineFiles@1.1.14) ([@xnv](https://github.com/xnv))

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#135](https://github.com/akashic-games/headless-driver/pull/135) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))
  * [#134](https://github.com/akashic-games/headless-driver/pull/134) Update all dependencies (minor) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.1.7 (2020-05-13)

#### Enhancement
* `headless-driver-runner-v3`
  * [#141](https://github.com/akashic-games/headless-driver/pull/141) 【v1.1.7】内部コンポーネントの更新(engineFiles@3.0.0-beta.5, engineFiles@2.1.39, engineFiles@1.1.14) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.1.6 (2020-05-12)

#### Enhancement
* `headless-driver-runner-v3`
  * [#138](https://github.com/akashic-games/headless-driver/pull/138) 【v1.1.6】内部コンポーネントの更新(engineFiles@3.0.0-beta.4, engineFiles@2.1.39, engineFiles@1.1.14) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.1.5 (2020-04-21)

#### Enhancement
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#133](https://github.com/akashic-games/headless-driver/pull/133) Add externalValue to Runner ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))

#### Committers: 1
- ShinobuTakahashi ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))

## v1.1.4 (2020-04-13)

#### Enhancement
* `headless-driver-runner-v2`
  * [#132](https://github.com/akashic-games/headless-driver/pull/132) 【v1.1.4】内部コンポーネントの更新(engineFiles@3.0.0-beta.3, engineFiles@2.1.39, engineFiles@1.1.14) ([@xnv](https://github.com/xnv))

#### Update Dependencies
* `headless-driver`
  * [#129](https://github.com/akashic-games/headless-driver/pull/129) Update all dependencies (minor) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.1.3 (2020-04-13)

#### Enhancement
* `headless-driver-runner-v3`
  * [#130](https://github.com/akashic-games/headless-driver/pull/130) 【v1.1.3】内部コンポーネントの更新(engineFiles@3.0.0-beta.3, engineFiles@2.1.38, engineFiles@1.1.14)  ([@xnv](https://github.com/xnv))

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#131](https://github.com/akashic-games/headless-driver/pull/131) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))
  * [#127](https://github.com/akashic-games/headless-driver/pull/127) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#128](https://github.com/akashic-games/headless-driver/pull/128) Update remark monorepo (major) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.1.2 (2020-04-01)

#### Bug Fix
* `headless-driver`
  * [#126](https://github.com/akashic-games/headless-driver/pull/126) fix that runner-version will not be undefined ([@dera-](https://github.com/dera-))

#### Committers: 1
- [@dera-](https://github.com/dera-)

## v1.1.1 (2020-03-31)

#### Update Dependencies
* `headless-driver`
  * [#124](https://github.com/akashic-games/headless-driver/pull/124) Update all dependencies (minor) ([@renovate[bot]](https://github.com/apps/renovate))
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#123](https://github.com/akashic-games/headless-driver/pull/123) Update dependency prettier to v2 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#122](https://github.com/akashic-games/headless-driver/pull/122) Update dependency tslint to v6 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#125](https://github.com/akashic-games/headless-driver/pull/125) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0



## v1.0.2 (2020-03-12)

#### Enhancement
* `headless-driver-runner-v2`
  * [#121](https://github.com/akashic-games/headless-driver/pull/121) 【v1.0.2】内部コンポーネントの更新(engineFiles@3.0.0-beta.2, engineFiles@2.1.38, engineFiles@1.1.14) ([@xnv](https://github.com/xnv))

#### Update Dependencies
* `headless-driver`
  * [#120](https://github.com/akashic-games/headless-driver/pull/120) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))
  * [#117](https://github.com/akashic-games/headless-driver/pull/117) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#118](https://github.com/akashic-games/headless-driver/pull/118) Update dependency typescript to v3.8.3 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v1.0.1 (2020-02-25)

#### Update Dependencies
* `headless-driver`
  * [#111](https://github.com/akashic-games/headless-driver/pull/111) Update dependency ts-jest to v25 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#113](https://github.com/akashic-games/headless-driver/pull/113) Update dependency @types/jest to v25 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#110](https://github.com/akashic-games/headless-driver/pull/110) Update dependency jest to v25 ([@renovate[bot]](https://github.com/apps/renovate))
* Other
  * [#103](https://github.com/akashic-games/headless-driver/pull/103) Update dependency lerna-changelog to v1 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#112](https://github.com/akashic-games/headless-driver/pull/112) Update dependency cross-env to v7 ([@renovate[bot]](https://github.com/apps/renovate))
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#109](https://github.com/akashic-games/headless-driver/pull/109) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- [@dera-](https://github.com/dera-)

## v1.0.0 (2020-02-06)

#### Breaking Change
* `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#108](https://github.com/akashic-games/headless-driver/pull/108) v3系のengineを利用しているコンテンツも動かせるよう対応 ([@dera-](https://github.com/dera-))

#### Enhancement
* `headless-driver-runner-v3`, `headless-driver-runner`, `headless-driver`
  * [#108](https://github.com/akashic-games/headless-driver/pull/108) v3系のengineを利用しているコンテンツも動かせるよう対応 ([@dera-](https://github.com/dera-))

#### Update Dependencies
* `headless-driver`
  * [#105](https://github.com/akashic-games/headless-driver/pull/105) Update dependency @types/jest to v24.9.0 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#102](https://github.com/akashic-games/headless-driver/pull/102) Update all dependencies (minor) ([@renovate[bot]](https://github.com/apps/renovate))
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner`, `headless-driver`
  * [#104](https://github.com/akashic-games/headless-driver/pull/104) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))
  * [#101](https://github.com/akashic-games/headless-driver/pull/101) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Other Change
* [#106](https://github.com/akashic-games/headless-driver/pull/106) Remove node-8 from travis.yml and add node-12 ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))

#### Committers: 2
- ShinobuTakahashi ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))
- [@dera-](https://github.com/dera-)

## v0.6.1 (2019-12-16)

#### Enhancement
* `headless-driver-runner-v2`
  * [#100](https://github.com/akashic-games/headless-driver/pull/100) 【v0.6.1】内部コンポーネントの更新(engineFiles@2.1.35, engineFiles@1.1.13) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.6.0 (2019-12-13)

#### Breaking Change
* `headless-driver-runner`, `headless-driver`
  * [#95](https://github.com/akashic-games/headless-driver/pull/95) Add file access validation ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))

#### Enhancement
* `headless-driver-runner`, `headless-driver`
  * [#95](https://github.com/akashic-games/headless-driver/pull/95) Add file access validation ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))

#### Committers: 1
- ShinobuTakahashi ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))

## v0.5.18 (2019-12-13)

#### Enhancement
* `headless-driver`
  * [#99](https://github.com/akashic-games/headless-driver/pull/99) Add dump function to AMFlow ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))

#### Committers: 1
- ShinobuTakahashi ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))

## v0.5.17 (2019-12-10)

#### Enhancement
* `headless-driver-runner-v2`
  * [#98](https://github.com/akashic-games/headless-driver/pull/98) 【v0.5.17】内部コンポーネントの更新(engineFiles@2.1.34, engineFiles@1.1.13) ([@xnv](https://github.com/xnv))

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner`, `headless-driver`
  * [#97](https://github.com/akashic-games/headless-driver/pull/97) Update dependency typescript to v3.7.3 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.5.16 (2019-12-05)

#### Enhancement
* `headless-driver-runner-v2`
  * [#96](https://github.com/akashic-games/headless-driver/pull/96) 【v0.5.16】内部コンポーネントの更新(engineFiles@2.1.33, engineFiles@1.1.13) ([@xnv](https://github.com/xnv))

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner`, `headless-driver`
  * [#88](https://github.com/akashic-games/headless-driver/pull/88) Update all dependencies (minor) ([@renovate[bot]](https://github.com/apps/renovate))
  * [#87](https://github.com/akashic-games/headless-driver/pull/87) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.5.15 (2019-11-07)

#### Enhancement
* `headless-driver-runner-v1`
  * [#94](https://github.com/akashic-games/headless-driver/pull/94) 【v0.5.15】内部コンポーネントの更新(engineFiles@2.1.32, engineFiles@1.1.13) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.5.14 (2019-11-06)

#### Enhancement
* `headless-driver-runner-v2`
  * [#93](https://github.com/akashic-games/headless-driver/pull/93) 【v0.5.14】内部コンポーネントの更新(engineFiles@2.1.32, engineFiles@1.1.12) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.5.13 (2019-11-05)

#### Enhancement
* `headless-driver-runner-v2`
  * [#92](https://github.com/akashic-games/headless-driver/pull/92) 【v0.5.13】内部コンポーネントの更新(engineFiles@2.1.31, engineFiles@1.1.12) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.5.12 (2019-10-31)

#### Enhancement
* `headless-driver`
  * [#91](https://github.com/akashic-games/headless-driver/pull/91) Fix vm2 of package.json to dependencies ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))

#### Committers: 1
- ShinobuTakahashi ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))

## v0.5.11 (2019-10-31)

#### Enhancement
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner`, `headless-driver`
  * [#83](https://github.com/akashic-games/headless-driver/pull/83) support vm module ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))

#### Committers: 1
- ShinobuTakahashi ([@ShinobuTakahashi](https://github.com/ShinobuTakahashi))

## v0.5.10 (2019-10-16)

#### Enhancement
* `headless-driver-runner-v2`
  * [#90](https://github.com/akashic-games/headless-driver/pull/90) 【v0.5.10】内部コンポーネントの更新(engineFiles@2.1.30, engineFiles@1.1.12) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.5.9 (2019-10-02)

#### Enhancement
* `headless-driver-runner-v2`
  * [#86](https://github.com/akashic-games/headless-driver/pull/86) 【v0.5.9】内部コンポーネントの更新(engineFiles@2.1.29, engineFiles@1.1.12) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.5.8 (2019-10-01)

#### Enhancement
* `headless-driver-runner-v2`
  * [#85](https://github.com/akashic-games/headless-driver/pull/85) 【v0.5.8】内部コンポーネントの更新(engineFiles@2.1.28, engineFiles@1.1.12) ([@xnv](https://github.com/xnv))

#### Update Dependencies
* `headless-driver`
  * [#84](https://github.com/akashic-games/headless-driver/pull/84) Update dependency serve-handler to v6.1.2 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.5.7 (2019-09-25)

#### Enhancement
* `headless-driver-runner-v2`
  * [#82](https://github.com/akashic-games/headless-driver/pull/82) 【v0.5.7】内部コンポーネントの更新(engineFiles@2.1.27, engineFiles@1.1.12) ([@xnv](https://github.com/xnv))

#### Update Dependencies
* Other
  * [#81](https://github.com/akashic-games/headless-driver/pull/81) Update dependency cross-env to v6 ([@renovate[bot]](https://github.com/apps/renovate))
* `headless-driver-runner`
  * [#80](https://github.com/akashic-games/headless-driver/pull/80) Update dependency @types/node-fetch to v2.5.2 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.5.6 (2019-09-20)

#### Enhancement
* `headless-driver-runner-v2`
  * [#79](https://github.com/akashic-games/headless-driver/pull/79) 【v0.5.6】内部コンポーネントの更新(engineFiles@2.1.26, engineFiles@1.1.12) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.5.5 (2019-09-20)

#### Enhancement
* `headless-driver-runner-v2`
  * [#78](https://github.com/akashic-games/headless-driver/pull/78) 【v0.5.5】内部コンポーネントの更新(engineFiles@2.1.25, engineFiles@1.1.12) ([@xnv](https://github.com/xnv))

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner`, `headless-driver`
  * [#77](https://github.com/akashic-games/headless-driver/pull/77) Update all dependencies (minor) ([@renovate[bot]](https://github.com/apps/renovate))
  * [#76](https://github.com/akashic-games/headless-driver/pull/76) Update dependency typescript to v3.6.3 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.5.4 (2019-09-13)

#### Enhancement
* `headless-driver-runner-v1`
  * [#75](https://github.com/akashic-games/headless-driver/pull/75) 【v0.5.4】内部コンポーネントの更新(engineFiles@2.1.24, engineFiles@1.1.12) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.5.3 (2019-09-06)

#### Enhancement
* `headless-driver-runner-v2`
  * [#74](https://github.com/akashic-games/headless-driver/pull/74) 【v0.5.3】内部コンポーネントの更新(engineFiles@2.1.24, engineFiles@1.1.11) ([@xnv](https://github.com/xnv))

#### Update Dependencies
* Other
  * [#61](https://github.com/akashic-games/headless-driver/pull/61) Update dependency remark-cli to v7 ([@renovate[bot]](https://github.com/apps/renovate))
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner`, `headless-driver`
  * [#72](https://github.com/akashic-games/headless-driver/pull/72) Update all dependencies (minor) ([@renovate[bot]](https://github.com/apps/renovate))
* `headless-driver`
  * [#71](https://github.com/akashic-games/headless-driver/pull/71) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.5.2 (2019-08-30)

#### Enhancement
* `headless-driver-runner-v2`
  * [#73](https://github.com/akashic-games/headless-driver/pull/73) 【v0.5.2】内部コンポーネントの更新(engineFiles@2.1.23, engineFiles@1.1.11) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.5.1 (2019-08-22)

#### Enhancement
* `headless-driver-runner-v1`
  * [#70](https://github.com/akashic-games/headless-driver/pull/70) 【v0.5.1】内部コンポーネントの更新(engineFiles@2.1.22, engineFiles@1.1.11) ([@xnv](https://github.com/xnv))

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner`, `headless-driver`
  * [#69](https://github.com/akashic-games/headless-driver/pull/69) Update dependency rimraf to v3 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#60](https://github.com/akashic-games/headless-driver/pull/60) Update all dependencies (minor) ([@renovate[bot]](https://github.com/apps/renovate))
* `headless-driver`
  * [#68](https://github.com/akashic-games/headless-driver/pull/68) Update dependency jest to v24.9.0 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#64](https://github.com/akashic-games/headless-driver/pull/64) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.5.0 (2019-08-09)

#### Republish
* [#67](https://github.com/akashic-games/headless-driver/pull/67) Republish ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.4.12 (2019-08-09)

#### Enhancement
* `headless-driver-runner-v1`, `headless-driver-runner-v2`
  * [#66](https://github.com/akashic-games/headless-driver/pull/66) 【v0.4.12】内部コンポーネントの更新(engineFiles@2.1.22, engineFiles@1.1.10) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.4.11 (2019-07-30)

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver`
  * [#59](https://github.com/akashic-games/headless-driver/pull/59) Update dependency serve-handler to v6.1.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner`, `headless-driver`
  * [#58](https://github.com/akashic-games/headless-driver/pull/58) Update dependency typescript to v3.5.3 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#57](https://github.com/akashic-games/headless-driver/pull/57) Update dependency serve-handler to v6.0.3 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#56](https://github.com/akashic-games/headless-driver/pull/56) Pin dependency cross-env to 5.2.0 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 0


## v0.4.10 (2019-06-28)

#### Enhancement
* `headless-driver-runner-v1`, `headless-driver-runner-v2`
  * [#51](https://github.com/akashic-games/headless-driver/pull/51) 【v0.4.10】内部コンポーネントの更新(engineFiles@2.1.19, engineFiles@1.1.9) ([@xnv](https://github.com/xnv))

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner`, `headless-driver`
  * [#54](https://github.com/akashic-games/headless-driver/pull/54) Update dependency tslint to v5.18.0 ([@renovate[bot]](https://github.com/apps/renovate))
  * [#53](https://github.com/akashic-games/headless-driver/pull/53) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))
  * [#52](https://github.com/akashic-games/headless-driver/pull/52) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Other Change
* [#45](https://github.com/akashic-games/headless-driver/pull/45) 何も変更を加えずにpublishするnpm-scriptを追加 ([@dera-](https://github.com/dera-))

#### Republish
* [#55](https://github.com/akashic-games/headless-driver/pull/55) Republish ([@xnv](https://github.com/xnv))

#### Committers: 2
- [@dera-](https://github.com/dera-)
- xnv ([@xnv](https://github.com/xnv))

## v0.4.9 (2019-06-12)

#### Enhancement
* `headless-driver-runner-v1`, `headless-driver-runner-v2`
  * [#50](https://github.com/akashic-games/headless-driver/pull/50) 【v0.4.9】内部コンポーネントの更新(engineFiles@2.1.19, engineFiles@1.1.9) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.4.8 (2019-06-11)

#### Enhancement
* `headless-driver-runner-v1`, `headless-driver-runner-v2`
  * [#49](https://github.com/akashic-games/headless-driver/pull/49) 【v0.4.8】内部コンポーネントの更新(engineFiles@2.1.19, engineFiles@1.1.9) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.4.7 (2019-06-11)

#### Enhancement
* `headless-driver-runner-v1`, `headless-driver-runner-v2`
  * [#48](https://github.com/akashic-games/headless-driver/pull/48) 【v0.4.7】内部コンポーネントの更新(engineFiles@2.1.19, engineFiles@1.1.9) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.4.6 (2019-06-11)

#### Enhancement
* `headless-driver-runner-v1`, `headless-driver-runner-v2`
  * [#47](https://github.com/akashic-games/headless-driver/pull/47) 【v0.4.6】内部コンポーネントの更新(engineFiles@2.1.19, engineFiles@1.1.9) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.4.5 (2019-06-11)

#### Enhancement
* `headless-driver-runner-v1`, `headless-driver-runner-v2`
  * [#46](https://github.com/akashic-games/headless-driver/pull/46) 【v0.4.5】内部コンポーネントの更新(engineFiles@2.1.19, engineFiles@1.1.9) ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))

## v0.4.4 (2019-06-11)

#### Enhancement
* `headless-driver-runner-v2`
  * [#44](https://github.com/akashic-games/headless-driver/pull/44) 【v0.4.4】内部コンポーネントの更新(engineFiles@2.1.19, engineFiles@1.1.9) ([@xnv](https://github.com/xnv))

#### Update Dependencies
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner`, `headless-driver`
  * [#42](https://github.com/akashic-games/headless-driver/pull/42) Update all dependencies (minor) ([@renovate[bot]](https://github.com/apps/renovate))
  * [#41](https://github.com/akashic-games/headless-driver/pull/41) Update all dependencies (patch) ([@renovate[bot]](https://github.com/apps/renovate))

#### Other Change
* [#43](https://github.com/akashic-games/headless-driver/pull/43) Add `dependencies` label to lerna-changelog ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 2
- [@yu-ogi](https://github.com/yu-ogi)
- xnv ([@xnv](https://github.com/xnv))

## v0.4.3 (2019-06-06)

#### Enhancement
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver`
  * [#40](https://github.com/akashic-games/headless-driver/pull/40) Export ContentParameters and GameJsonParameters ([@yu-ogi](https://github.com/yu-ogi))
* `headless-driver-runner-v2`
  * [#39](https://github.com/akashic-games/headless-driver/pull/39) 【v0.4.3】内部コンポーネントの更新(engineFiles@2.1.18, engineFiles@1.1.9) ([@xnv](https://github.com/xnv))
  * [#38](https://github.com/akashic-games/headless-driver/pull/38) 【v0.4.3】内部コンポーネントの更新(engineFiles@2.1.17, engineFiles@1.1.9) ([@xnv](https://github.com/xnv))

#### Bug Fix
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver`
  * [#40](https://github.com/akashic-games/headless-driver/pull/40) Export ContentParameters and GameJsonParameters ([@yu-ogi](https://github.com/yu-ogi))

#### Other Change
* `headless-driver`
  * [#25](https://github.com/akashic-games/headless-driver/pull/25) Resolve circular dependency ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 2
- [@yu-ogi](https://github.com/yu-ogi)
- xnv ([@xnv](https://github.com/xnv))

## v0.4.2 (2019-05-16)

#### Bug Fix
* `headless-driver`
  * [#24](https://github.com/akashic-games/headless-driver/pull/24) Export Content Interface ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 1
- [@yu-ogi](https://github.com/yu-ogi)

## v0.4.1 (2019-05-16)

#### Enhancement
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner`, `headless-driver`
  * [#23](https://github.com/akashic-games/headless-driver/pull/23) Support to run local game.json ([@yu-ogi](https://github.com/yu-ogi))

#### Other Change
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner`, `headless-driver`
  * [#22](https://github.com/akashic-games/headless-driver/pull/22) Use jest and update internal dependency modules ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 1
- [@yu-ogi](https://github.com/yu-ogi)

## v0.4.0 (2019-05-09)

#### Breaking Change
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner`, `headless-driver`
  * [#21](https://github.com/akashic-games/headless-driver/pull/21) Support play status ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 1
- [@yu-ogi](https://github.com/yu-ogi)

## v0.3.9 (2019-04-22)

#### Enhancement
* `headless-driver-runner-v1`, `headless-driver-runner-v2`
  * [#20](https://github.com/akashic-games/headless-driver/pull/20) 内部コンポーネントの更新 ([@xnv](https://github.com/xnv))

#### Bug Fix
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver`
  * [#19](https://github.com/akashic-games/headless-driver/pull/19) Fix to execute script when trailing line comment ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 2
- [@yu-ogi](https://github.com/yu-ogi)
- xnv ([@xnv](https://github.com/xnv))

## v0.3.8 (2019-04-19)

#### Enhancement
* [#12](https://github.com/akashic-games/headless-driver/pull/12) Enabled to update CHANGELOG.md ([@dera-](https://github.com/dera-))

#### Other Change
* [#16](https://github.com/akashic-games/headless-driver/pull/16) Add CHANGELOG.md ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 3
- [@dera-](https://github.com/dera-)
- [@yu-ogi](https://github.com/yu-ogi)
- xnv ([@xnv](https://github.com/xnv))


## v0.3.7 (2019-04-09)

#### Enhancement
* `headless-driver-runner-v2`
  * [#15](https://github.com/akashic-games/headless-driver/pull/15) 内部コンポーネントの更新 ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))


## v0.3.6 (2019-04-03)

#### Bug Fix
* `headless-driver`
  * [#13](https://github.com/akashic-games/headless-driver/pull/13) Refactor AMFlowClient ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 1
- [@yu-ogi](https://github.com/yu-ogi)


## v0.3.5 (2019-04-03)

#### Enhancement
* `headless-driver-runner-v2`
  * [#14](https://github.com/akashic-games/headless-driver/pull/14) 内部コンポーネントの更新 ([@xnv](https://github.com/xnv))

#### Other Change
* [#11](https://github.com/akashic-games/headless-driver/pull/11) Update remark ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 2
- [@yu-ogi](https://github.com/yu-ogi)
- xnv ([@xnv](https://github.com/xnv))


## v0.3.4 (2019-03-28)

#### Enhancement
* `headless-driver-runner-v1`
  * [#10](https://github.com/akashic-games/headless-driver/pull/10) 内部コンポーネントの更新 ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))


## v0.3.3 (2019-03-12)

#### Enhancement
* `headless-driver-runner-v2`
  * [#9](https://github.com/akashic-games/headless-driver/pull/9) 内部コンポーネントの更新 ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))


## v0.3.2 (2019-03-05)

#### Enhancement
* `headless-driver-runner-v2`
  * [#8](https://github.com/akashic-games/headless-driver/pull/8) 内部コンポーネントの更新 ([@xnv](https://github.com/xnv))

#### Committers: 1
- xnv ([@xnv](https://github.com/xnv))


## v0.3.1 (2019-02-06)

#### Enhancement
* `headless-driver-runner-v1`, `headless-driver-runner-v2`
  * [#6](https://github.com/akashic-games/headless-driver/pull/6) 内部コンポーネントの更新 ([@xnv](https://github.com/xnv))

#### Other Change
* [#7](https://github.com/akashic-games/headless-driver/pull/7) Drop *.json from ignoreChanges ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 2
- [@yu-ogi](https://github.com/yu-ogi)
- xnv ([@xnv](https://github.com/xnv))


## v0.3.0 (2019-02-05)

#### Breaking Change
* `headless-driver-runner-v1`, `headless-driver-runner-v2`, `headless-driver-runner`, `headless-driver`
  * [#4](https://github.com/akashic-games/headless-driver/pull/4) Drop g.Game#logger ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 1
- [@yu-ogi](https://github.com/yu-ogi)


## v0.2.4 (2019-02-05)

#### Enhancement
* `headless-driver`
  * [#3](https://github.com/akashic-games/headless-driver/pull/3) Support multiple startPoints at AMFlow#put(get)StartPoint() ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 1
- [@yu-ogi](https://github.com/yu-ogi)


## v0.2.3 (2019-01-31)

#### Bug Fix
* `headless-driver`
  * [#2](https://github.com/akashic-games/headless-driver/pull/2) Add a validation before use not authenticated AMFlow ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 1
- [@yu-ogi](https://github.com/yu-ogi)


## v0.2.2 (2019-01-29)

#### Bug Fix
* `headless-driver`
  * [#1](https://github.com/akashic-games/headless-driver/pull/1) Fix to import lodash.clonedeep instead of lodash ([@yu-ogi](https://github.com/yu-ogi))

#### Committers: 1
- [@yu-ogi](https://github.com/yu-ogi)
