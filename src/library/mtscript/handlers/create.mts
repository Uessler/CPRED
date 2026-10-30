[h: assert(isGM(), "Somente o mestre pode criar tokens por este painel.", 0)]
[h: id = createToken(json.set("{}", "name", "Novo edgerunner", "tokenImage", "lib://local.sexored.red/avatar.png", "layer", "TOKEN", "x", 0, "y", 0))]
[h: setPC(id)]
[h: macro.return = json.set("{}", "ok", 1, "id", id)]
