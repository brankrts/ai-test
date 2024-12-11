const e=Object.freeze(JSON.parse(`{"displayName":"Fish","fileTypes":["fish"],"firstLineMatch":"^#!.*\\\\bfish\\\\b","foldingStartMarker":"^\\\\s*(function|while|if|switch|for|begin)\\\\s.*$","foldingStopMarker":"^\\\\s*end\\\\s*$","name":"fish","patterns":[{"begin":"\\"","beginCaptures":{"0":{"name":"punctuation.definition.string.begin.fish"}},"comment":"Double quoted string","end":"\\"","endCaptures":{"0":{"name":"punctuation.definition.string.end.fish"}},"name":"string.quoted.double.fish","patterns":[{"include":"#variable"},{"comment":"https://fishshell.com/docs/current/#quotes","match":"\\\\\\\\(\\\\\\"|\\\\$|$|\\\\\\\\)","name":"constant.character.escape.fish"}]},{"begin":"'","beginCaptures":{"0":{"name":"punctuation.definition.string.begin.fish"}},"comment":"Single quoted string","end":"'","endCaptures":{"0":{"name":"punctuation.definition.string.end.fish"}},"name":"string.quoted.single.fish","patterns":[{"comment":"https://fishshell.com/docs/current/#quotes","match":"\\\\\\\\('|\`|\\\\\\\\)","name":"constant.character.escape.fish"}]},{"captures":{"1":{"name":"punctuation.definition.comment.fish"}},"comment":"line comment","match":"(?<!\\\\$)(#)(?!\\\\{).*$\\\\n?","name":"comment.line.number-sign.fish"},{"captures":{"2":{"name":"keyword.control.fish"},"4":{"name":"support.function.command.fish"}},"comment":"name of command, either a function or a binary","match":"(^\\\\s*|&&\\\\s*|\\\\|\\\\s*|\\\\(\\\\s*|[;]\\\\s*|\\\\b(if|while)\\\\b\\\\s+)(?!(?<!\\\\.)\\\\b(function|while|if|else|switch|case|for|in|begin|end|continue|break|return|source|exit|wait|and|or|not)\\\\b(?![?!]))([a-zA-Z_\\\\-0-9\\\\[\\\\].]+)"},{"comment":"keywords that affect control flow","match":"(?<!\\\\.)\\\\b(function|while|if|else|switch|case|for|in|begin|end|continue|break|return|source|exit|wait|and|or|not)\\\\b(?![?!])","name":"keyword.control.fish"},{"match":"(?<!\\\\.)\\\\bfunction\\\\b(?![?!])","name":"storage.type.fish"},{"match":"\\\\|","name":"keyword.operator.pipe.fish"},{"comment":"IO Redirection","match":"(?:<|#StandardInput(>|\\\\^|>>|\\\\^\\\\^)(&[012\\\\-])?|[012](<|>|>>)(&[012\\\\-])?)","name":"keyword.operator.redirect.fish"},{"match":"&","name":"keyword.operator.background.fish"},{"match":"\\\\*\\\\*|\\\\*|\\\\?","name":"keyword.operator.glob.fish"},{"captures":{"1":{"name":"source.option.fish"}},"comment":"command short/long options","match":"\\\\s(-{1,2}[a-zA-Z_\\\\-0-9]+|-\\\\w)\\\\b"},{"include":"#variable"},{"include":"#escape"}],"repository":{"escape":{"patterns":[{"comment":"single character character escape sequences","match":"\\\\\\\\[abefnrtv $*?~#(){}\\\\[\\\\]<>^&|;\\"']","name":"constant.character.escape.single.fish"},{"comment":"escapes the ascii character with the specified value (hexadecimal)","match":"\\\\\\\\x[0-9a-fA-F]{1,2}","name":"constant.character.escape.hex-ascii.fish"},{"comment":"escapes a byte of data with the specified value (hexadecimal). If you are using mutibyte encoding, this can be used to enter invalid strings. Only use this if you know what are doing.","match":"\\\\\\\\X[0-9a-fA-F]{1,2}","name":"constant.character.escape.hex-byte.fish"},{"comment":"escapes the ascii character with the specified value (octal)","match":"\\\\\\\\[0-7]{1,3}","name":"constant.character.escape.octal.fish"},{"comment":"escapes the 16-bit unicode character with the specified value (hexadecimal)","match":"\\\\\\\\u[0-9a-fA-F]{1,4}","name":"constant.character.escape.unicode-16-bit.fish"},{"comment":"escapes the 32-bit unicode character with the specified value (hexadecimal)","match":"\\\\\\\\U[0-9a-fA-F]{1,8}","name":"constant.character.escape.unicode-32-bit.fish"},{"comment":"escapes the control sequence generated by pressing the control key and the specified letter","match":"\\\\\\\\c[a-zA-Z]","name":"constant.character.escape.control.fish"}]},"variable":{"patterns":[{"captures":{"1":{"name":"punctuation.definition.variable.fish"}},"comment":"Built-in variables visible by pressing $ TAB TAB in a new shell","match":"(\\\\$)(argv|CMD_DURATION|COLUMNS|fish_bind_mode|fish_color_autosuggestion|fish_color_cancel|fish_color_command|fish_color_comment|fish_color_cwd|fish_color_cwd_root|fish_color_end|fish_color_error|fish_color_escape|fish_color_hg_added|fish_color_hg_clean|fish_color_hg_copied|fish_color_hg_deleted|fish_color_hg_dirty|fish_color_hg_modified|fish_color_hg_renamed|fish_color_hg_unmerged|fish_color_hg_untracked|fish_color_history_current|fish_color_host|fish_color_host_remote|fish_color_match|fish_color_normal|fish_color_operator|fish_color_param|fish_color_quote|fish_color_redirection|fish_color_search_match|fish_color_selection|fish_color_status|fish_color_user|fish_color_valid_path|fish_complete_path|fish_function_path|fish_greeting|fish_key_bindings|fish_pager_color_completion|fish_pager_color_description|fish_pager_color_prefix|fish_pager_color_progress|fish_pid|fish_prompt_hg_status_added|fish_prompt_hg_status_copied|fish_prompt_hg_status_deleted|fish_prompt_hg_status_modified|fish_prompt_hg_status_order|fish_prompt_hg_status_unmerged|fish_prompt_hg_status_untracked|FISH_VERSION|history|hostname|IFS|LINES|pipestatus|status|umask|version)\\\\b","name":"variable.language.fish"},{"captures":{"1":{"name":"punctuation.definition.variable.fish"}},"match":"(\\\\$)[a-zA-Z_]\\\\w*","name":"variable.other.normal.fish"}]}},"scopeName":"source.fish"}`)),t=[e];export{t as default};
