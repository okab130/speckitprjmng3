<!--
SYNC IMPACT REPORT
==================
Version Change: [NEW] → 1.0.0
Modified Principles: N/A (Initial constitution)
Added Sections:
  - Core Principles (5 principles defined)
  - Technology Constraints
  - Development Workflow
  - Governance
Templates Requiring Updates:
  ✅ plan-template.md - Constitution Check section aligns with defined principles
  ✅ spec-template.md - User story and requirements format align with constitution
  ✅ tasks-template.md - Task structure and user story organization align with constitution
Follow-up TODOs: None
-->

# Project Tracker Constitution

## Core Principles

### I. User Story-Driven Development

すべての機能はユーザーストーリーとして定義され、独立してテスト可能でなければならない(MUST)。各ユーザーストーリーは単独で価値を提供し、他のストーリーに依存せずにデプロイ可能であること。優先度(P1, P2, P3...)を明確に設定し、MVP(最小実用製品)の定義を常に意識する。

**Rationale**: パイロット版として50人規模のチーム向けに段階的価値提供を実現するため。各ストーリーが独立していることで、開発の並行化、段階的リリース、リスク分散が可能となる。

### II. Real-time First Architecture

リアルタイム同期はアーキテクチャの中核であり、WebSocketを使用して2秒以内にすべてのクライアントへ変更を伝播しなければならない(MUST)。楽観的ロック(Optimistic Locking)と最終書き込み優先(Last-Write-Wins)戦略により、ユーザーをブロックせずに並行編集を許可する。

**Rationale**: タスク管理・プロジェクト追跡システムにおいて、チーム全体の可視性と協調作業がコア価値。遅延や競合によるフラストレーションを最小限に抑え、ユーザー体験を最優先する。

### III. Performance Budgets (NON-NEGOTIABLE)

すべての操作は定義されたパフォーマンス予算内で完了しなければならない(MUST)：
- タスクステータス更新：2秒以内の視覚的反映
- Ganttチャート描画：100タスクで3秒以内
- ビュー切替(Kanban ↔ Gantt)：1秒以内
- 検索結果表示：1秒以内
- WebSocket通知配信：2秒以内

これらの予算を満たせない実装は却下される。パフォーマンステストは各ユーザーストーリーの完了条件に含める。

**Rationale**: 50人の並行ユーザーと500タスクのスケール目標を達成し、ユーザー体験を保証するため。測定可能な基準により、主観的な「十分速い」を排除する。

### IV. Data Integrity and Graceful Degradation

システムはデータ損失なしにネットワーク障害、同時編集、システム障害を処理しなければならない(MUST)。WebSocket接続の切断時は自動再接続を実施し、オプティミスティックUI更新はキューイングして再送する。データベーストランザクションによりデータ永続性を保証する。

**Rationale**: パイロット版でも信頼性は妥協できない。ユーザーの作業を失うことはチーム全体の生産性に直接影響し、システムへの信頼を損なう。

### V. Simplicity and MVP Focus

パイロット版であることを常に意識し、YAGNI(You Aren't Gonna Need It)原則を徹底する。複雑な機能(ロールベースアクセス制御、複雑なワークフローカスタマイゼーション、災害復旧など)は将来拡張として明示的に除外する。各実装決定は「これはMVPに必須か?」という問いに答えられなければならない(MUST)。

**Rationale**: 50人規模のチーム向けパイロット版として、迅速な検証と学習サイクルを優先。過度な設計は開発時間を浪費し、ユーザーフィードバックの機会を遅らせる。

## Technology Constraints

本プロジェクトは以下の技術スタックに従う(MUST)：

- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Real-time Communication**: WebSocket
- **Target Scale**: 50並行ユーザー、500タスク/プロジェクト

すべての実装はこのスタック内で完結すること。新規技術の導入は憲法修正を必要とする。

## Development Workflow

### Test-Driven Development (Conditional)

テストはユーザーストーリーの一部として**明示的に要求された場合のみ**記述する(MUST)。テストが要求された場合は以下を遵守：
- 契約テスト(Contract Tests)とインテグレーションテスト(Integration Tests)を実装前に記述
- Red-Green-Refactorサイクル：テスト失敗 → 実装 → テスト成功 → リファクタリング
- 各ユーザーストーリーは独立してテスト可能であること

テストが要求されていない場合は、手動検証により受入基準(Acceptance Criteria)を満たす。

### Code Organization

- **Web Application Structure**: `backend/`と`frontend/`ディレクトリを明確に分離
- **Backend**: `src/models/`, `src/services/`, `src/api/`の階層化
- **Frontend**: `src/components/`, `src/pages/`, `src/services/`の構造
- **Tests**: `tests/contract/`, `tests/integration/`, `tests/unit/`(テスト要求時のみ)

### Review and Deployment

- すべてのコード変更はユーザーストーリーの受入基準(Acceptance Criteria)に対して検証される(MUST)
- パフォーマンス予算の遵守を各マージ前に確認(MUST)
- 各ユーザーストーリーは独立してデプロイ可能である状態を維持(SHOULD)

## Governance

### Constitution Authority

本憲法は本プロジェクトにおけるすべての開発慣行、技術決定、品質基準に優先する。憲法との矛盾が発生した場合、憲法の規定が優先される(MUST)。

### Amendment Process

憲法の修正は以下の手順に従う(MUST)：
1. 修正提案を文書化し、影響を受ける原則とその理由を明記
2. 既存の実装への影響分析(テンプレート、進行中の作業、完成したユーザーストーリー)
3. セマンティックバージョニングによるバージョンアップ：
   - **MAJOR**: 原則の削除または後方互換性のない再定義
   - **MINOR**: 新規原則の追加または既存セクションの実質的拡張
   - **PATCH**: 明確化、文言修正、誤字訂正、非意味論的改善
4. 依存テンプレート(plan-template.md, spec-template.md, tasks-template.md)の同期更新
5. 承認とマイグレーション計画の実行

### Compliance Review

- すべてのプルリクエストは原則への準拠を検証される(MUST)
- 憲法違反(特にパフォーマンス予算、データ整合性、ユーザーストーリー独立性)は明示的な正当化と文書化を要求する
- 繰り返し発生する違反は憲法の修正または原則の再評価を促す

### Runtime Guidance

実装時のガイダンスについては、`.specify/templates/commands/`内の各コマンド専用ドキュメントを参照すること。憲法は「何を」と「なぜ」を定義し、コマンドドキュメントは「どのように」を提供する。

**Version**: 1.0.0 | **Ratified**: 2025-01-26 | **Last Amended**: 2025-01-26
