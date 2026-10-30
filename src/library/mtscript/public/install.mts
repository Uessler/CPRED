[h: button = json.set("{}", "label", "SEXORED · Ficha", "command", '[h, macro("open@lib:local.sexored.red"): ""]', "group", "SEXORED", "color", "#e44850", "fontColor", "white", "autoExecute", 1, "applyToSelected", 0)]
[h: createMacro(button, "campaign")]
[h: broadcast("SEXORED instalado. Abra o painel Campanha e clique em SEXORED · Ficha.", "self")]
