# FamilyMarkup

This extension provides support for [FamilyMarkup Language](https://familymarkup.site).

## Settings

- **Locale** (defaults to current editor locale) for errors and hints
- **Children Without Relationships** (enabled by default). Usually, when a family starts with a large number of siblings, it’s easy to overlook describing the branch of one of them. This feature will highlight all children who lack family connections, allowing you to check whether a person truly did not continue the lineage or if you simply forgot to describe their branch.

## Features

- [x] Full support of [FamilyMarkup Language Server](https://github.com/redexp/familymarkup-lsp).
- [x] [TreeView](https://code.visualstudio.com/api/extension-guides/tree-view#treeview) of all families
- [x] Syntax highlighting for Markdown files preview
- [x] Syntax highlighting (limited) with TextMate syntax for faster first time rendering
  - [x] Syntax highlight in `md` files inside `fml` or `family` code blocks

## Syntax Example


```family
Potter

James + Lily Evans =
Harry


Weasley

Arthur + Molly? =
Fred
George
Ronald
girl?

Fred and George - twins

Ronald and Harry Potter - best friends
```

In this example question marks after names shows that we don't remember maiden name of Molly and don't remember name of last child, only that it's a girl. Last two line shows relation between Fred and George, Ronald and Harry

