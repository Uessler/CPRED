[h: req = macro.args]
[h: action = json.get(req, "action")]
[h: assert(listFind("list,create,spawn,load,save,roll,damage,buy", action) >= 0, "Ação desconhecida.", 0)]
[h, if(action != "list" && action != "create" && action != "spawn"), code: {
  [h: id = json.get(req, "id")]
  [h: assert(isGM() || isOwner(getPlayerName(), id) || isOwnedByAll(id), "Você precisa ser dono desse token.", 0)]
}]
[h, macro("handlers/" + action + "@this"): req]
[r: macro.return]
