# smashwilson.fold-to-spec

This is a VSCode extension that adds more useful code folding behavior for RSpec files.

RSpec suites are often organized into a multi-level tree, grouped by `context` or `desribe` blocks to share setup or teardown blocks or common fixtures. This makes fold-to-level commands less useful. This extension adds a command, `fold-to-spec.fold`, which uniformly folds the leaf nodes (`it`, `setup`, and `teardown` blocks) while leaving the `context` or `describe` blocks expanded.

## Requirements

<!-- If you have any requirements or dependencies, add a section describing those and how to install and configure them. -->
