# Line Counting

## Tokei

From cli usage, it seems to have every feature we need:

- Count lines
- Count per individual file
- Ignore comments and blanks (if so desired)
- Ignore files listed in `.gitignore` (if so desired)

`tokei . --files`

outputs:

```text
-------------------------------------------------------------------------------
 Language            Files        Lines         Code     Comments       Blanks
-------------------------------------------------------------------------------
 JSON                    4          124          124            0            0
-------------------------------------------------------------------------------
 ./tsconfig.test.json                 7            7            0            0
 ./package.json                      90           90            0            0
 ./tsconfig.base.json                19           19            0            0
 ./tsconfig.json                      8            8            0            0
-------------------------------------------------------------------------------
 Markdown                9          190          190            0            0
-------------------------------------------------------------------------------
 ./README.md                          3            3            0            0
 |ocs/notes/integration.md           31           31            0            0
 |s/notes/line-counting.md           20           20            0            0
 ./docs/notes/d3.md                  68           68            0            0
 ./docs/notes/color.md               20           20            0            0
 |ocs/notes/interaction.md           14           14            0            0
 ./docs/notes/style.md                8            8            0            0
 ./docs/notes/prior-art.md            4            4            0            0
 |cs/notes/project-name.md           22           22            0            0
-------------------------------------------------------------------------------
 TypeScript              5          237          156           47           34
-------------------------------------------------------------------------------
 ./src/index.tsx                      7            4            1            2
 ./src/project/Project.ts            42           19           18            5
 ./src/App/App.test.tsx              16            9            4            3
 ./src/App/App.tsx                   32           24            3            5
 |rc/SlocView/SlocView.tsx          140          100           21           19
-------------------------------------------------------------------------------
 Total                  18          551          470           47           34
-------------------------------------------------------------------------------
```

Also available in JSON format with `tokei . --files --output json`.

- [GitHub - XAMPPRocky/tokei: Count your code, quickly.](https://github.com/XAMPPRocky/tokei#how-to-use-tokei)
- [tokei/src at master · XAMPPRocky/tokei · GitHub](https://github.com/XAMPPRocky/tokei/tree/master/src)
- [tokei/lib.rs at master · XAMPPRocky/tokei · GitHub](https://github.com/XAMPPRocky/tokei/blob/master/src/lib.rs)
- [tokei/cli.rs at master · XAMPPRocky/tokei · GitHub](https://github.com/XAMPPRocky/tokei/blob/master/src/cli.rs)
- [tokei/main.rs at master · XAMPPRocky/tokei · GitHub](https://github.com/XAMPPRocky/tokei/blob/master/src/main.rs)
- [tokei - Rust](https://docs.rs/tokei/11.1.1/tokei/)
- [tokei::Config - Rust](https://docs.rs/tokei/11.1.1/tokei/struct.Config.html)
- [tokei::Stats - Rust](https://docs.rs/tokei/11.1.1/tokei/struct.Stats.html)
- [tokei::Languages - Rust](https://docs.rs/tokei/11.1.1/tokei/struct.Languages.html)
