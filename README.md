# FamilyMarkup

This extension provides support for [FamilyMarkup language](https://github.com/redexp/familymarkup-lsp).

## Settings

- Language: for errors and hints
- Surname Position: before or after given name

## Features

- [x] Support [FamilyMarkup Language Server](https://github.com/redexp/familymarkup-lsp).
- [x] TreeView of all famalies
- [ ] Syntax highlighting for Markdown
- [ ] "Surname after given name" as default for English locale

## Syntax Example


```familymarkup
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

