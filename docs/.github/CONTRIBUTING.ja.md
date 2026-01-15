# 貢献ガイド

npm-push プロジェクトへのご関心ありがとうございます！あらゆる形式の貢献を歓迎します。

## 貢献方法

### 問題の報告

バグを発見した場合や機能の提案がある場合は、[GitHub Issues](https://github.com/ccode/npm-push/issues) を通じて報告してください。

### コードの提出

1. このリポジトリを Fork
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. Pull Request を開く

## コード規約

- プロジェクトのコードスタイルに従う
- 適切なコメントを追加
- すべてのテストが通過することを確認
- 関連ドキュメントを更新

## ライセンス

コードを提出することで、MIT ライセンスの下で貢献をライセンスすることに同意したものとみなされます。

## 開発環境のセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/ccode/npm-push.git
cd npm-push

# 依存関係をインストール
bun install

# テストを実行
bun test

# 開発モード
bun run dev
```

## コミットメッセージ規約

[Conventional Commits](https://www.conventionalcommits.org/) 規約に従ってください：

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント更新
- `style`: コードスタイル（コード実行に影響しない）
- `refactor`: リファクタリング
- `test`: テスト関連
- `chore`: ビルドプロセスまたは補助ツールの変更

例：`feat: 多言語サポートを追加`

## 行動規範

[行動規範](CODE_OF_CONDUCT.ja.md) に従ってください。

## 質問？

質問がある場合は、Issues を通じてお問い合わせください。

---

<div align="center">

[🇨🇳 中文](CONTRIBUTING.zh.md) | [🇺🇸 English](CONTRIBUTING.en.md) | [🇯🇵 日本語](CONTRIBUTING.ja.md) | [🇰🇷 한국어](CONTRIBUTING.ko.md)

</div>
