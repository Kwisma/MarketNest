在 Git 提交时，通常使用以下标准的提交信息规范：

* **修复bug**：`fix`

  ```bash
  git commit -m "fix: 修复了XXX问题"
  ```

* **添加新文件或新功能**：`feat`

  ```bash
  git commit -m "feat: 添加了XXX功能"
  ```

* **修改现有代码**（不属于 bug 修复和新功能）：`refactor`

  ```bash
  git commit -m "refactor: 重构了XXX代码"
  ```

* **文档更新**：`docs`

  ```bash
  git commit -m "docs: 更新了README文件"
  ```

* **样式更新**（如代码格式调整）：`style`

  ```bash
  git commit -m "style: 修改了代码格式"
  ```

* **性能提升**：`perf`

  ```bash
  git commit -m "perf: 优化了XXX性能"
  ```

* **测试相关变更**：`test`

  ```bash
  git commit -m "test: 增加了XXX的单元测试"
  ```

所以，如果你是**添加新文件**，通常使用 `feat`（表示添加了新功能或新文件）。

例如：

```bash
git commit -m "feat: 添加了script目录及新脚本"
```

这种方式也有助于团队和项目管理者了解每次提交的目的。
